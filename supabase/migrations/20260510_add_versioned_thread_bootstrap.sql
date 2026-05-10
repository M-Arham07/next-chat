create or replace function public.get_thread_bootstrap_for_version(
    p_thread_id text,
    p_device_id uuid,
    p_key_version integer default null
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
requested_version as (
    select coalesce(p_key_version, (select key_version from active_version)) as key_version
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
    join requested_version rv
      on rv.key_version = tdk.key_version
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

revoke execute on function public.get_thread_bootstrap_for_version(text, uuid, integer) from anon;
grant execute on function public.get_thread_bootstrap_for_version(text, uuid, integer) to authenticated;
