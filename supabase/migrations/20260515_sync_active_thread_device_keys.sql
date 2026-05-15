create or replace function public.sync_thread_e2ee_devices(
    p_thread_id text,
    p_key_version integer,
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
    v_active_key_version integer;
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

    select public.get_thread_active_key_version(p_thread_id)
    into v_active_key_version;

    if v_active_key_version is null then
        raise exception 'THREAD_NOT_INITIALIZED';
    end if;

    if v_active_key_version <> p_key_version then
        raise exception 'STALE_KEY_VERSION';
    end if;

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
            p_key_version,
            (v_payload ->> 'deviceId')::uuid,
            v_payload ->> 'wrappedKey',
            v_payload ->> 'iv',
            p_creator_device_id,
            v_payload -> 'senderPublicKey'
        )
        on conflict (thread_id, key_version, device_id)
        do update set
            wrapped_thread_key = excluded.wrapped_thread_key,
            wrap_iv = excluded.wrap_iv,
            sender_device_id = excluded.sender_device_id,
            sender_public_key = excluded.sender_public_key;
    end loop;

    return p_key_version;
end;
$$;

revoke execute on function public.sync_thread_e2ee_devices(text, integer, uuid, jsonb) from anon;
grant execute on function public.sync_thread_e2ee_devices(text, integer, uuid, jsonb) to authenticated;
