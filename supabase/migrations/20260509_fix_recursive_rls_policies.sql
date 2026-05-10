create or replace function public.is_thread_participant(
    p_thread_id text,
    p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = p_thread_id
          and tp.user_id = p_user_id
          and tp.left_at is null
    );
$$;

create or replace function public.shares_active_thread_with_user(
    p_other_user_id uuid,
    p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.thread_participants mine
        join public.thread_participants theirs
          on theirs.thread_id = mine.thread_id
        where mine.user_id = p_user_id
          and mine.left_at is null
          and theirs.user_id = p_other_user_id
          and theirs.left_at is null
    );
$$;

create or replace function public.can_access_message(
    p_msg_id text,
    p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.messages m
        where m.msg_id = p_msg_id
          and public.is_thread_participant(m.thread_id, p_user_id)
    );
$$;

create or replace function public.can_access_media_storage_object(
    p_object_name text,
    p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.media_objects mo
        join public.messages m
          on m.msg_id = mo.msg_id
        where (p_object_name = mo.storage_path or p_object_name like mo.storage_path || '/%')
          and public.is_thread_participant(m.thread_id, p_user_id)
    );
$$;

drop policy if exists profiles_select_own_or_threads on public.profiles;
create policy profiles_select_own_or_threads
on public.profiles
for select
to authenticated
using (
    id = auth.uid()
    or public.shares_active_thread_with_user(id)
);

drop policy if exists threads_select_participant on public.threads;
create policy threads_select_participant
on public.threads
for select
to authenticated
using (
    public.is_thread_participant(thread_id)
);

drop policy if exists thread_participants_select_participant on public.thread_participants;
create policy thread_participants_select_participant
on public.thread_participants
for select
to authenticated
using (
    public.is_thread_participant(thread_id)
);

drop policy if exists SELECT_MESSAGES_IN_OWN_THREADS on public.messages;
create policy SELECT_MESSAGES_IN_OWN_THREADS
on public.messages
for select
to authenticated
using (
    public.is_thread_participant(thread_id)
);

drop policy if exists messages_select_participant on public.messages;
create policy messages_select_participant
on public.messages
for select
to authenticated
using (
    public.is_thread_participant(thread_id)
);

drop policy if exists messages_insert_participant on public.messages;
create policy messages_insert_participant
on public.messages
for insert
to authenticated
with check (
    public.is_thread_participant(thread_id)
);

drop policy if exists thread_key_versions_select_participant on public.thread_key_versions;
create policy thread_key_versions_select_participant
on public.thread_key_versions
for select
to authenticated
using (
    public.is_thread_participant(thread_id)
);

drop policy if exists user_devices_select_own on public.user_devices;
create policy user_devices_select_own
on public.user_devices
for select
to authenticated
using (
    user_id = auth.uid()
    or public.shares_active_thread_with_user(user_id)
);

drop policy if exists message_envelopes_select_participant on public.message_envelopes;
create policy message_envelopes_select_participant
on public.message_envelopes
for select
to authenticated
using (
    public.can_access_message(msg_id)
);

drop policy if exists media_objects_select_participant on public.media_objects;
create policy media_objects_select_participant
on public.media_objects
for select
to authenticated
using (
    public.can_access_message(msg_id)
);

drop policy if exists chat_media_bucket_select_thread_participant on storage.objects;
create policy chat_media_bucket_select_thread_participant
on storage.objects
for select
to authenticated
using (
    bucket_id = 'chat-media'
    and public.can_access_media_storage_object(name)
);
