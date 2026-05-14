alter table realtime.messages enable row level security;

drop policy if exists "thread participants can receive chat broadcasts" on realtime.messages;
create policy "thread participants can receive chat broadcasts"
on realtime.messages
for select
to authenticated
using (
    realtime.messages.extension = 'broadcast'
    and exists (
        select 1
        from public.thread_participants tp
        where tp.user_id = auth.uid()
          and tp.left_at is null
          and ('thread:' || tp.thread_id) = realtime.topic()
    )
);

drop policy if exists "thread participants can send chat broadcasts" on realtime.messages;
create policy "thread participants can send chat broadcasts"
on realtime.messages
for insert
to authenticated
with check (
    realtime.messages.extension = 'broadcast'
    and exists (
        select 1
        from public.thread_participants tp
        where tp.user_id = auth.uid()
          and tp.left_at is null
          and ('thread:' || tp.thread_id) = realtime.topic()
    )
);
