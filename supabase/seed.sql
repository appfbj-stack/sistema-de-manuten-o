with company_upsert as (
  insert into public.companies (name, plan)
  select 'Nexus Industrial Demo', 'INDUSTRIAL'
  where not exists (
    select 1 from public.companies where name = 'Nexus Industrial Demo'
  )
  returning id
),
company_ref as (
  select id from company_upsert
  union all
  select id from public.companies where name = 'Nexus Industrial Demo'
  limit 1
),
users_insert as (
  insert into public.users (company_id, name, email, role)
  select c.id, u.name, u.email, u.role
  from company_ref c
  cross join (
    values
      ('Fernando Borges', 'borgesjaf@gmail.com', 'admin'),
      ('Técnico João', 'joao@nexus.local', 'technician'),
      ('Técnica Maria', 'maria@nexus.local', 'technician')
  ) as u(name, email, role)
  where not exists (select 1 from public.users x where x.email = u.email)
  returning id, name
),
equip_insert as (
  insert into public.equipment (company_id, technical_type, name, tag, location)
  select c.id, e.technical_type, e.name, e.tag, e.location
  from company_ref c
  cross join (
    values
      ('HVAC'::technical_type, 'Chiller Carrier 30TR', 'HVAC-001', 'Hospital São Lucas'),
      ('SOLAR'::technical_type, 'Inversor Fronius 50kW', 'SOL-INV-001', 'Usina Solar Vale'),
      ('ELETRICA'::technical_type, 'QGBT Bloco A', 'ELE-QGBT-001', 'Metalúrgica Alfa'),
      ('PONTE_ROLANTE'::technical_type, 'Ponte Rolante 10T', 'PR-001', 'Metalúrgica Alfa')
  ) as e(technical_type, name, tag, location)
  where not exists (select 1 from public.equipment x where x.tag = e.tag)
  returning id, technical_type, name
),
work_orders_insert as (
  insert into public.work_orders (
    company_id,
    equipment_id,
    technical_type,
    title,
    customer_name,
    technician_name,
    service_type,
    priority,
    scheduled_for,
    notes,
    status
  )
  select
    c.id,
    e.id,
    e.technical_type,
    'OS Inicial - ' || e.name,
    case
      when e.technical_type = 'HVAC' then 'Hospital São Lucas'
      when e.technical_type = 'SOLAR' then 'Usina Solar Vale'
      else 'Metalúrgica Alfa'
    end,
    'Fernando Borges',
    'inspecao',
    'alta',
    current_date,
    'OS criada automaticamente para validação de fluxo técnico.',
    'ABERTA'
  from company_ref c
  join equip_insert e on true
  where not exists (
    select 1
    from public.work_orders w
    where w.title = 'OS Inicial - ' || e.name
  )
  returning id, technical_type
)
insert into public.work_order_checklist_items (work_order_id, template_item_id, label, result, notes)
select
  wo.id,
  cti.id,
  cti.label,
  'pendente'::checklist_status,
  null
from work_orders_insert wo
join public.checklist_templates ct
  on ct.technical_type = wo.technical_type
 and ct.active = true
 and ct.version = 1
join public.checklist_template_items cti
  on cti.template_id = ct.id
where not exists (
  select 1
  from public.work_order_checklist_items wci
  where wci.work_order_id = wo.id
    and wci.label = cti.label
);
