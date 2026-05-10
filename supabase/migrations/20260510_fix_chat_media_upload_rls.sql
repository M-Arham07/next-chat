create or replace function public.can_upload_media_storage_object(
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
        join public.user_devices ud
          on ud.device_id = mo.sender_device_id
        where (p_object_name = mo.storage_path or p_object_name like mo.storage_path || '/%')
          and ud.user_id = p_user_id
          and ud.revoked_at is null
    );
$$;

drop policy if exists chat_media_bucket_insert_sender on storage.objects;
create policy chat_media_bucket_insert_sender
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'chat-media'
    and public.can_upload_media_storage_object(name)
);
