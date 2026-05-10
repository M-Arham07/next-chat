create or replace function public.get_profile_by_user_id(p_user_id uuid)
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
    select p.*
    from public.profiles p
    where p.id = p_user_id
$$;

create or replace function public.get_user_thread_ids(p_user_id uuid)
returns setof text
language sql
stable
security definer
set search_path = public
as $$
    select tp.thread_id
    from public.thread_participants tp
    where tp.user_id = p_user_id
      and tp.left_at is null
$$;

create or replace function public.store_message_from_realtime(
    p_msg_id text,
    p_thread_id text,
    p_sender_user_id uuid,
    p_sender_device_id uuid,
    p_sender text,
    p_type public.message_type,
    p_content text,
    p_content_format text,
    p_key_version integer,
    p_reply_to_msg_id text,
    p_status public.message_status,
    p_timestamp timestamptz,
    p_ciphertext text default null,
    p_iv text default null,
    p_algorithm text default null,
    p_aad jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = p_thread_id
          and tp.user_id = p_sender_user_id
          and tp.left_at is null
    ) then
        raise exception 'FORBIDDEN';
    end if;

    insert into public.messages (
        msg_id,
        thread_id,
        sender,
        sender_user_id,
        sender_device_id,
        type,
        content,
        content_format,
        key_version,
        reply_to_msg_id,
        status,
        "timestamp"
    ) values (
        p_msg_id,
        p_thread_id,
        p_sender,
        p_sender_user_id,
        p_sender_device_id,
        p_type,
        p_content,
        p_content_format,
        p_key_version,
        p_reply_to_msg_id,
        p_status,
        p_timestamp
    );

    if p_content_format = 'e2ee_text' then
        insert into public.message_envelopes (
            msg_id,
            sender_device_id,
            key_version,
            algorithm,
            ciphertext,
            iv,
            aad
        ) values (
            p_msg_id,
            p_sender_device_id,
            p_key_version,
            coalesce(p_algorithm, 'AES-GCM'),
            p_ciphertext,
            p_iv,
            p_aad
        );
    end if;
end;
$$;

create or replace function public.delete_message_for_user(
    p_msg_id text,
    p_sender_user_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    v_thread_id text;
begin
    delete from public.messages
    where msg_id = p_msg_id
      and sender_user_id = p_sender_user_id
    returning thread_id into v_thread_id;

    if v_thread_id is null then
        raise exception 'DELETE_NOT_ALLOWED';
    end if;

    return v_thread_id;
end;
$$;

alter function public.create_thread(text, uuid[], text, text) security definer;
