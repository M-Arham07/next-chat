create or replace function public.bind_reserved_media_to_message(
    p_media_id uuid,
    p_msg_id text,
    p_sender_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not exists (
        select 1
        from public.media_objects mo
        join public.user_devices ud
          on ud.device_id = mo.sender_device_id
        where mo.media_id = p_media_id
          and ud.user_id = p_sender_user_id
          and mo.msg_id is null
    ) then
        raise exception 'MEDIA_BIND_NOT_ALLOWED';
    end if;

    update public.media_objects
    set msg_id = p_msg_id
    where media_id = p_media_id
      and msg_id is null;
end;
$$;
