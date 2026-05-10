alter function public.get_thread_active_key_version(text) set search_path = public;
alter function public.message_thread_id(text) set search_path = public;
alter function public.create_thread(text, uuid[], text, text) set search_path = public;
alter function public.get_inbox(uuid, integer) set search_path = public;
alter function public.search_threads(text, integer) set search_path = public;

revoke execute on function public.register_device(text, jsonb, text) from anon;
grant execute on function public.register_device(text, jsonb, text) to authenticated;

revoke execute on function public.get_thread_bootstrap(text, uuid) from anon;
grant execute on function public.get_thread_bootstrap(text, uuid) to authenticated;

revoke execute on function public.initialize_thread_e2ee(text, uuid, jsonb) from anon;
grant execute on function public.initialize_thread_e2ee(text, uuid, jsonb) to authenticated;

revoke execute on function public.rotate_thread_e2ee_key(text, uuid, jsonb) from anon;
grant execute on function public.rotate_thread_e2ee_key(text, uuid, jsonb) to authenticated;

revoke execute on function public.create_thread(text, uuid[], text, text) from anon;
grant execute on function public.create_thread(text, uuid[], text, text) to authenticated;
