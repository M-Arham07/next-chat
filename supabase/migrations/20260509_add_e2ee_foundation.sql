create extension if not exists pgcrypto;

alter table public.messages
    add column if not exists sender_user_id uuid references public.profiles(id),
    add column if not exists sender_device_id uuid,
    add column if not exists content_format text not null default 'legacy_plaintext',
    add column if not exists key_version integer,
    add column if not exists updated_at timestamptz not null default now();

update public.messages
set
    sender_user_id = nullif(sender, '')::uuid,
    content_format = case
        when type = 'deleted' then 'deleted'
        else 'legacy_plaintext'
    end
where sender_user_id is null
  and sender ~* '^[0-9a-f-]{36}$';

create table if not exists public.user_devices (
    device_id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    device_label text not null,
    public_key jsonb not null,
    key_algorithm text not null default 'ECDH-P256',
    created_at timestamptz not null default now(),
    revoked_at timestamptz
);

create index if not exists user_devices_user_id_idx
    on public.user_devices (user_id)
    where revoked_at is null;

create table if not exists public.thread_key_versions (
    thread_id text not null references public.threads(thread_id) on delete cascade,
    key_version integer not null,
    created_by_device_id uuid not null references public.user_devices(device_id) on delete restrict,
    created_at timestamptz not null default now(),
    status text not null default 'active' check (status in ('active', 'retired')),
    primary key (thread_id, key_version)
);

create index if not exists thread_key_versions_active_idx
    on public.thread_key_versions (thread_id, key_version desc)
    where status = 'active';

create table if not exists public.thread_device_keys (
    thread_id text not null,
    key_version integer not null,
    device_id uuid not null references public.user_devices(device_id) on delete cascade,
    wrapped_thread_key text not null,
    wrap_iv text not null,
    sender_device_id uuid not null references public.user_devices(device_id) on delete restrict,
    sender_public_key jsonb not null,
    created_at timestamptz not null default now(),
    primary key (thread_id, key_version, device_id),
    foreign key (thread_id, key_version)
        references public.thread_key_versions(thread_id, key_version)
        on delete cascade
);

create index if not exists thread_device_keys_device_lookup_idx
    on public.thread_device_keys (device_id, thread_id, key_version desc);

create table if not exists public.message_envelopes (
    msg_id text primary key references public.messages(msg_id) on delete cascade,
    sender_device_id uuid not null references public.user_devices(device_id) on delete restrict,
    key_version integer not null,
    algorithm text not null default 'AES-GCM',
    ciphertext text not null,
    iv text not null,
    aad jsonb,
    decryption_status text
);

create table if not exists public.media_objects (
    media_id uuid primary key default gen_random_uuid(),
    msg_id text unique not null references public.messages(msg_id) on delete cascade,
    storage_path text not null unique,
    mime_type text not null,
    original_filename text,
    size_bytes bigint not null,
    encryption_mode text not null check (encryption_mode in ('single', 'chunked')),
    chunk_size_bytes integer,
    chunk_count integer,
    preview_ciphertext text,
    preview_iv text,
    wrapped_file_key text not null,
    file_key_iv text not null,
    key_version integer not null,
    sender_device_id uuid not null references public.user_devices(device_id) on delete restrict,
    created_at timestamptz not null default now()
);

create index if not exists media_objects_msg_lookup_idx
    on public.media_objects (msg_id);

create or replace function public.get_thread_active_key_version(p_thread_id text)
returns integer
language sql
stable
as $$
    select tkv.key_version
    from public.thread_key_versions tkv
    where tkv.thread_id = p_thread_id
      and tkv.status = 'active'
    order by tkv.key_version desc
    limit 1;
$$;

create or replace function public.register_device(
    p_device_label text,
    p_public_key jsonb,
    p_key_algorithm text default 'ECDH-P256'
)
returns public.user_devices
language plpgsql
security definer
set search_path = public
as $$
declare
    v_auth_user_id uuid;
    v_device public.user_devices;
begin
    v_auth_user_id := auth.uid();

    if v_auth_user_id is null then
        raise exception 'NOT_AUTHENTICATED';
    end if;

    insert into public.user_devices (user_id, device_label, public_key, key_algorithm)
    values (v_auth_user_id, p_device_label, p_public_key, coalesce(nullif(trim(p_key_algorithm), ''), 'ECDH-P256'))
    returning * into v_device;

    return v_device;
end;
$$;

create or replace function public.get_thread_bootstrap(
    p_thread_id text,
    p_device_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with requester as (
    select auth.uid() as user_id
),
membership as (
    select 1
    from public.thread_participants tp
    join requester r on r.user_id = tp.user_id
    where tp.thread_id = p_thread_id
      and tp.left_at is null
),
active_version as (
    select public.get_thread_active_key_version(p_thread_id) as key_version
),
participant_devices as (
    select jsonb_agg(
        jsonb_build_object(
            'userId', ud.user_id,
            'deviceId', ud.device_id,
            'deviceLabel', ud.device_label,
            'publicKey', ud.public_key,
            'keyAlgorithm', ud.key_algorithm,
            'revokedAt', ud.revoked_at
        )
        order by ud.created_at asc
    ) as devices
    from public.thread_participants tp
    join public.user_devices ud
      on ud.user_id = tp.user_id
    where tp.thread_id = p_thread_id
      and tp.left_at is null
      and ud.revoked_at is null
),
wrapped_key as (
    select jsonb_build_object(
        'algorithm', 'ECDH-P256/AES-GCM',
        'wrappedKey', tdk.wrapped_thread_key,
        'iv', tdk.wrap_iv,
        'senderPublicKey', tdk.sender_public_key
    ) as wrapped_thread_key
    from public.thread_device_keys tdk
    join active_version av
      on av.key_version = tdk.key_version
    where tdk.thread_id = p_thread_id
      and tdk.device_id = p_device_id
)
select case
    when exists(select 1 from membership) then jsonb_build_object(
        'threadId', p_thread_id,
        'activeKeyVersion', (select key_version from active_version),
        'participantDevices', coalesce((select devices from participant_devices), '[]'::jsonb),
        'wrappedThreadKey', (select wrapped_thread_key from wrapped_key)
    )
    else null
end;
$$;

create or replace function public.initialize_thread_e2ee(
    p_thread_id text,
    p_creator_device_id uuid,
    p_participant_wrapped_keys jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_auth_user_id uuid;
    v_key_version integer;
    v_payload jsonb;
begin
    v_auth_user_id := auth.uid();

    if v_auth_user_id is null then
        raise exception 'NOT_AUTHENTICATED';
    end if;

    if not exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = p_thread_id
          and tp.user_id = v_auth_user_id
          and tp.left_at is null
    ) then
        raise exception 'FORBIDDEN';
    end if;

    select public.get_thread_active_key_version(p_thread_id) into v_key_version;

    if v_key_version is not null then
        return v_key_version;
    end if;

    v_key_version := 1;

    insert into public.thread_key_versions (thread_id, key_version, created_by_device_id, status)
    values (p_thread_id, v_key_version, p_creator_device_id, 'active');

    for v_payload in
        select value
        from jsonb_array_elements(coalesce(p_participant_wrapped_keys, '[]'::jsonb))
    loop
        insert into public.thread_device_keys (
            thread_id,
            key_version,
            device_id,
            wrapped_thread_key,
            wrap_iv,
            sender_device_id,
            sender_public_key
        )
        values (
            p_thread_id,
            v_key_version,
            (v_payload ->> 'deviceId')::uuid,
            v_payload ->> 'wrappedKey',
            v_payload ->> 'iv',
            p_creator_device_id,
            v_payload -> 'senderPublicKey'
        );
    end loop;

    return v_key_version;
end;
$$;

create or replace function public.rotate_thread_e2ee_key(
    p_thread_id text,
    p_creator_device_id uuid,
    p_participant_wrapped_keys jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_auth_user_id uuid;
    v_next_key_version integer;
    v_payload jsonb;
begin
    v_auth_user_id := auth.uid();

    if v_auth_user_id is null then
        raise exception 'NOT_AUTHENTICATED';
    end if;

    if not exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = p_thread_id
          and tp.user_id = v_auth_user_id
          and tp.left_at is null
    ) then
        raise exception 'FORBIDDEN';
    end if;

    update public.thread_key_versions
    set status = 'retired'
    where thread_id = p_thread_id
      and status = 'active';

    select coalesce(max(key_version), 0) + 1
    into v_next_key_version
    from public.thread_key_versions
    where thread_id = p_thread_id;

    insert into public.thread_key_versions (thread_id, key_version, created_by_device_id, status)
    values (p_thread_id, v_next_key_version, p_creator_device_id, 'active');

    for v_payload in
        select value
        from jsonb_array_elements(coalesce(p_participant_wrapped_keys, '[]'::jsonb))
    loop
        insert into public.thread_device_keys (
            thread_id,
            key_version,
            device_id,
            wrapped_thread_key,
            wrap_iv,
            sender_device_id,
            sender_public_key
        )
        values (
            p_thread_id,
            v_next_key_version,
            (v_payload ->> 'deviceId')::uuid,
            v_payload ->> 'wrappedKey',
            v_payload ->> 'iv',
            p_creator_device_id,
            v_payload -> 'senderPublicKey'
        );
    end loop;

    return v_next_key_version;
end;
$$;

create or replace function public.message_thread_id(p_msg_id text)
returns text
language sql
stable
as $$
    select m.thread_id
    from public.messages m
    where m.msg_id = p_msg_id
$$;

alter table public.profiles enable row level security;
alter table public.threads enable row level security;
alter table public.thread_participants enable row level security;
alter table public.messages enable row level security;
alter table public.user_devices enable row level security;
alter table public.thread_key_versions enable row level security;
alter table public.thread_device_keys enable row level security;
alter table public.message_envelopes enable row level security;
alter table public.media_objects enable row level security;

drop policy if exists profiles_select_own_or_threads on public.profiles;
create policy profiles_select_own_or_threads
on public.profiles
for select
to authenticated
using (
    id = auth.uid()
    or exists (
        select 1
        from public.thread_participants mine
        join public.thread_participants theirs
          on theirs.thread_id = mine.thread_id
        where mine.user_id = auth.uid()
          and mine.left_at is null
          and theirs.user_id = profiles.id
          and theirs.left_at is null
    )
);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists threads_select_participant on public.threads;
create policy threads_select_participant
on public.threads
for select
to authenticated
using (
    exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = threads.thread_id
          and tp.user_id = auth.uid()
          and tp.left_at is null
    )
);

drop policy if exists thread_participants_select_participant on public.thread_participants;
create policy thread_participants_select_participant
on public.thread_participants
for select
to authenticated
using (
    exists (
        select 1
        from public.thread_participants mine
        where mine.thread_id = thread_participants.thread_id
          and mine.user_id = auth.uid()
          and mine.left_at is null
    )
);

drop policy if exists messages_select_participant on public.messages;
create policy messages_select_participant
on public.messages
for select
to authenticated
using (
    exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = messages.thread_id
          and tp.user_id = auth.uid()
          and tp.left_at is null
    )
);

drop policy if exists messages_insert_participant on public.messages;
create policy messages_insert_participant
on public.messages
for insert
to authenticated
with check (
    exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = messages.thread_id
          and tp.user_id = auth.uid()
          and tp.left_at is null
    )
);

drop policy if exists user_devices_select_own on public.user_devices;
create policy user_devices_select_own
on public.user_devices
for select
to authenticated
using (
    user_id = auth.uid()
    or exists (
        select 1
        from public.thread_participants mine
        join public.thread_participants theirs
          on theirs.thread_id = mine.thread_id
        where mine.user_id = auth.uid()
          and mine.left_at is null
          and theirs.user_id = user_devices.user_id
          and theirs.left_at is null
    )
);

drop policy if exists user_devices_update_own on public.user_devices;
create policy user_devices_update_own
on public.user_devices
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists thread_key_versions_select_participant on public.thread_key_versions;
create policy thread_key_versions_select_participant
on public.thread_key_versions
for select
to authenticated
using (
    exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = thread_key_versions.thread_id
          and tp.user_id = auth.uid()
          and tp.left_at is null
    )
);

drop policy if exists thread_device_keys_select_own_device on public.thread_device_keys;
create policy thread_device_keys_select_own_device
on public.thread_device_keys
for select
to authenticated
using (
    exists (
        select 1
        from public.user_devices ud
        where ud.device_id = thread_device_keys.device_id
          and ud.user_id = auth.uid()
          and ud.revoked_at is null
    )
);

drop policy if exists message_envelopes_select_participant on public.message_envelopes;
create policy message_envelopes_select_participant
on public.message_envelopes
for select
to authenticated
using (
    exists (
        select 1
        from public.messages m
        join public.thread_participants tp
          on tp.thread_id = m.thread_id
        where m.msg_id = message_envelopes.msg_id
          and tp.user_id = auth.uid()
          and tp.left_at is null
    )
);

drop policy if exists message_envelopes_insert_sender on public.message_envelopes;
create policy message_envelopes_insert_sender
on public.message_envelopes
for insert
to authenticated
with check (
    exists (
        select 1
        from public.user_devices ud
        where ud.device_id = message_envelopes.sender_device_id
          and ud.user_id = auth.uid()
          and ud.revoked_at is null
    )
);

drop policy if exists media_objects_select_participant on public.media_objects;
create policy media_objects_select_participant
on public.media_objects
for select
to authenticated
using (
    exists (
        select 1
        from public.messages m
        join public.thread_participants tp
          on tp.thread_id = m.thread_id
        where m.msg_id = media_objects.msg_id
          and tp.user_id = auth.uid()
          and tp.left_at is null
    )
);

drop policy if exists media_objects_insert_sender on public.media_objects;
create policy media_objects_insert_sender
on public.media_objects
for insert
to authenticated
with check (
    exists (
        select 1
        from public.user_devices ud
        where ud.device_id = media_objects.sender_device_id
          and ud.user_id = auth.uid()
          and ud.revoked_at is null
    )
);

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', false)
on conflict (id) do update
set public = excluded.public;

drop policy if exists chat_media_bucket_select_thread_participant on storage.objects;
create policy chat_media_bucket_select_thread_participant
on storage.objects
for select
to authenticated
using (
    bucket_id = 'chat-media'
    and exists (
        select 1
        from public.media_objects mo
        join public.messages m on m.msg_id = mo.msg_id
        join public.thread_participants tp on tp.thread_id = m.thread_id
        where (name = mo.storage_path or name like mo.storage_path || '/%')
          and tp.user_id = auth.uid()
          and tp.left_at is null
    )
);

drop policy if exists chat_media_bucket_insert_sender on storage.objects;
create policy chat_media_bucket_insert_sender
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'chat-media'
    and exists (
        select 1
        from public.media_objects mo
        join public.user_devices ud on ud.device_id = mo.sender_device_id
        where (name = mo.storage_path or name like mo.storage_path || '/%')
          and ud.user_id = auth.uid()
          and ud.revoked_at is null
    )
);
