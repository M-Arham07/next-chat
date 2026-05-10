alter table public.media_objects
    alter column msg_id drop not null;

drop constraint if exists media_objects_msg_id_key on public.media_objects;
create unique index if not exists media_objects_msg_id_unique_idx
    on public.media_objects (msg_id)
    where msg_id is not null;
