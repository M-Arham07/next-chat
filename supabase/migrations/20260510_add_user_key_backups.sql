create table if not exists public.user_key_backups (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    encrypted_blob text not null,
    salt text not null,
    iv text not null,
    kdf_algorithm text not null default 'PBKDF2-SHA256',
    kdf_iterations integer not null,
    backup_version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.user_key_backups enable row level security;

drop policy if exists user_key_backups_select_own on public.user_key_backups;
create policy user_key_backups_select_own
on public.user_key_backups
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists user_key_backups_insert_own on public.user_key_backups;
create policy user_key_backups_insert_own
on public.user_key_backups
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists user_key_backups_update_own on public.user_key_backups;
create policy user_key_backups_update_own
on public.user_key_backups
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
