create or replace function public.broadcast_message_to_thread(
    p_thread_id text,
    p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.uid() is null then
        raise exception 'UNAUTHENTICATED';
    end if;

    if not exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = p_thread_id
          and tp.user_id = auth.uid()
          and tp.left_at is null
    ) then
        raise exception 'FORBIDDEN';
    end if;

    perform realtime.send(
        p_payload,
        'message:received',
        'thread:' || p_thread_id,
        true
    );
end;
$$;

create or replace function public.broadcast_message_deleted_to_thread(
    p_thread_id text,
    p_msg_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.uid() is null then
        raise exception 'UNAUTHENTICATED';
    end if;

    if not exists (
        select 1
        from public.thread_participants tp
        where tp.thread_id = p_thread_id
          and tp.user_id = auth.uid()
          and tp.left_at is null
    ) then
        raise exception 'FORBIDDEN';
    end if;

    perform realtime.send(
        jsonb_build_object(
            'threadId', p_thread_id,
            'msgId', p_msg_id
        ),
        'message:deleted',
        'thread:' || p_thread_id,
        true
    );
end;
$$;
