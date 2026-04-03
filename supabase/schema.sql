create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'technical_type') then
    create type technical_type as enum ('HVAC', 'SOLAR', 'ELETRICA', 'PONTE_ROLANTE');
  end if;
  if not exists (select 1 from pg_type where typname = 'os_status') then
    create type os_status as enum ('ABERTA', 'ANDAMENTO', 'CONCLUIDA', 'CANCELADA');
  end if;
  if not exists (select 1 from pg_type where typname = 'checklist_status') then
    create type checklist_status as enum ('ok', 'atencao', 'critico', 'pendente');
  end if;
  if not exists (select 1 from pg_type where typname = 'photo_type') then
    create type photo_type as enum ('equipamento', 'defeito', 'servico');
  end if;
  if not exists (select 1 from pg_type where typname = 'alert_type') then
    create type alert_type as enum ('preventiva', 'inspecao_obrigatoria', 'vencimento');
  end if;
end $$;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'FREE',
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  auth_user_id uuid unique,
  name text not null,
  email text unique,
  role text not null default 'technician',
  created_at timestamptz not null default now()
);

create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  technical_type technical_type not null,
  name text not null,
  tag text,
  model text,
  serial_number text,
  location text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  equipment_id uuid references equipment(id) on delete set null,
  technical_type technical_type not null,
  title text not null,
  customer_name text not null,
  technician_name text not null,
  service_type text not null,
  priority text not null default 'media',
  scheduled_for date,
  notes text,
  status os_status not null default 'ABERTA',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists checklist_templates (
  id uuid primary key default gen_random_uuid(),
  technical_type technical_type not null,
  name text not null,
  version int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (technical_type, name, version)
);

create table if not exists checklist_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references checklist_templates(id) on delete cascade,
  label text not null,
  required boolean not null default true,
  sort_order int not null default 0
);

create table if not exists work_order_checklist_items (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references work_orders(id) on delete cascade,
  template_item_id uuid references checklist_template_items(id) on delete set null,
  label text not null,
  result checklist_status not null default 'pendente',
  notes text,
  measured_value text,
  created_at timestamptz not null default now()
);

create table if not exists work_order_photos (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references work_orders(id) on delete cascade,
  photo_type photo_type not null default 'servico',
  file_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists work_order_signatures (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references work_orders(id) on delete cascade,
  signer_type text not null check (signer_type in ('cliente','tecnico')),
  signer_name text,
  file_url text not null,
  signed_at timestamptz not null default now(),
  unique (work_order_id, signer_type)
);

create table if not exists maintenance_alerts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  equipment_id uuid not null references equipment(id) on delete cascade,
  alert_type alert_type not null,
  due_date date not null,
  status text not null default 'pendente',
  created_at timestamptz not null default now()
);

create index if not exists idx_users_company on users(company_id);
create index if not exists idx_equipment_company on equipment(company_id, technical_type);
create index if not exists idx_work_orders_company on work_orders(company_id, status, scheduled_for);
create index if not exists idx_work_orders_equipment on work_orders(equipment_id);
create index if not exists idx_templates_type on checklist_templates(technical_type, active);
create index if not exists idx_template_items_template on checklist_template_items(template_id, sort_order);
create index if not exists idx_wo_items_work_order on work_order_checklist_items(work_order_id);
create index if not exists idx_wo_photos_work_order on work_order_photos(work_order_id);
create index if not exists idx_wo_signatures_work_order on work_order_signatures(work_order_id);
create index if not exists idx_alerts_company_due on maintenance_alerts(company_id, due_date, status);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_work_orders_updated_at on work_orders;
create trigger trg_work_orders_updated_at
before update on work_orders
for each row execute function set_updated_at();

insert into checklist_templates (technical_type, name, version, active)
select v.technical_type, v.name, 1, true
from (
  values
    ('HVAC'::technical_type, 'Template HVAC'),
    ('SOLAR'::technical_type, 'Template Solar'),
    ('ELETRICA'::technical_type, 'Template Elétrica'),
    ('PONTE_ROLANTE'::technical_type, 'Template Ponte Rolante')
) as v(technical_type, name)
where not exists (
  select 1 from checklist_templates t
  where t.technical_type = v.technical_type
    and t.name = v.name
    and t.version = 1
);

with template_ids as (
  select id, technical_type
  from checklist_templates
  where version = 1 and active = true
)
insert into checklist_template_items (template_id, label, required, sort_order)
select t.id, i.label, true, i.sort_order
from template_ids t
join (
  values
    ('HVAC'::technical_type, 'Pressão', 1),
    ('HVAC'::technical_type, 'Temperatura', 2),
    ('HVAC'::technical_type, 'Filtros', 3),
    ('HVAC'::technical_type, 'Corrente', 4),
    ('SOLAR'::technical_type, 'Módulos', 1),
    ('SOLAR'::technical_type, 'Inversor', 2),
    ('SOLAR'::technical_type, 'Geração', 3),
    ('ELETRICA'::technical_type, 'Disjuntor', 1),
    ('ELETRICA'::technical_type, 'Tensão', 2),
    ('ELETRICA'::technical_type, 'Aterramento', 3),
    ('PONTE_ROLANTE'::technical_type, 'Cabo de aço', 1),
    ('PONTE_ROLANTE'::technical_type, 'Freio', 2),
    ('PONTE_ROLANTE'::technical_type, 'Gancho', 3),
    ('PONTE_ROLANTE'::technical_type, 'NR-12', 4)
) as i(technical_type, label, sort_order)
  on i.technical_type = t.technical_type
where not exists (
  select 1
  from checklist_template_items cti
  where cti.template_id = t.id
    and cti.label = i.label
);
