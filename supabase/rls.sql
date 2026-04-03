create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.company_id
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.equipment enable row level security;
alter table public.work_orders enable row level security;
alter table public.checklist_templates enable row level security;
alter table public.checklist_template_items enable row level security;
alter table public.work_order_checklist_items enable row level security;
alter table public.work_order_photos enable row level security;
alter table public.work_order_signatures enable row level security;
alter table public.maintenance_alerts enable row level security;

drop policy if exists companies_select on public.companies;
create policy companies_select
on public.companies
for select
using (id = public.current_company_id());

drop policy if exists companies_update on public.companies;
create policy companies_update
on public.companies
for update
using (id = public.current_company_id())
with check (id = public.current_company_id());

drop policy if exists users_all on public.users;
create policy users_all
on public.users
for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

drop policy if exists equipment_all on public.equipment;
create policy equipment_all
on public.equipment
for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

drop policy if exists work_orders_all on public.work_orders;
create policy work_orders_all
on public.work_orders
for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

drop policy if exists checklist_templates_read on public.checklist_templates;
create policy checklist_templates_read
on public.checklist_templates
for select
using (true);

drop policy if exists checklist_template_items_read on public.checklist_template_items;
create policy checklist_template_items_read
on public.checklist_template_items
for select
using (true);

drop policy if exists work_order_checklist_items_all on public.work_order_checklist_items;
create policy work_order_checklist_items_all
on public.work_order_checklist_items
for all
using (
  exists (
    select 1
    from public.work_orders wo
    where wo.id = work_order_checklist_items.work_order_id
      and wo.company_id = public.current_company_id()
  )
)
with check (
  exists (
    select 1
    from public.work_orders wo
    where wo.id = work_order_checklist_items.work_order_id
      and wo.company_id = public.current_company_id()
  )
);

drop policy if exists work_order_photos_all on public.work_order_photos;
create policy work_order_photos_all
on public.work_order_photos
for all
using (
  exists (
    select 1
    from public.work_orders wo
    where wo.id = work_order_photos.work_order_id
      and wo.company_id = public.current_company_id()
  )
)
with check (
  exists (
    select 1
    from public.work_orders wo
    where wo.id = work_order_photos.work_order_id
      and wo.company_id = public.current_company_id()
  )
);

drop policy if exists work_order_signatures_all on public.work_order_signatures;
create policy work_order_signatures_all
on public.work_order_signatures
for all
using (
  exists (
    select 1
    from public.work_orders wo
    where wo.id = work_order_signatures.work_order_id
      and wo.company_id = public.current_company_id()
  )
)
with check (
  exists (
    select 1
    from public.work_orders wo
    where wo.id = work_order_signatures.work_order_id
      and wo.company_id = public.current_company_id()
  )
);

drop policy if exists maintenance_alerts_all on public.maintenance_alerts;
create policy maintenance_alerts_all
on public.maintenance_alerts
for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
