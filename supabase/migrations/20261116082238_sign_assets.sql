create table public.sign_image_overrides (
  user_id uuid not null references auth.users(id) on delete cascade,
  sign_name text not null check (length(sign_name) between 1 and 120),
  storage_path text not null,
  content_type text not null default 'image/jpeg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, sign_name)
);

alter table public.sign_image_overrides enable row level security;
grant select, insert, update, delete on public.sign_image_overrides to authenticated;

create policy "Users can read their sign overrides" on public.sign_image_overrides for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their sign overrides" on public.sign_image_overrides for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their sign overrides" on public.sign_image_overrides for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their sign overrides" on public.sign_image_overrides for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('sign-reference', 'sign-reference', true, 2097152, array['image/jpeg','image/png']::text[]),
  ('sign-overrides', 'sign-overrides', false, 2097152, array['image/jpeg','image/png']::text[])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can read reference signs" on storage.objects for select to public using (bucket_id = 'sign-reference');
create policy "Users can read their sign overrides" on storage.objects for select to authenticated using (bucket_id = 'sign-overrides' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users can upload their sign overrides" on storage.objects for insert to authenticated with check (bucket_id = 'sign-overrides' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users can update their sign overrides" on storage.objects for update to authenticated using (bucket_id = 'sign-overrides' and (storage.foldername(name))[1] = (select auth.uid()::text)) with check (bucket_id = 'sign-overrides' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users can delete their sign overrides" on storage.objects for delete to authenticated using (bucket_id = 'sign-overrides' and (storage.foldername(name))[1] = (select auth.uid()::text));
