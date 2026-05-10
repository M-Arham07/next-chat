alter table public.media_objects
    add column if not exists chunk_iv_seed text;
