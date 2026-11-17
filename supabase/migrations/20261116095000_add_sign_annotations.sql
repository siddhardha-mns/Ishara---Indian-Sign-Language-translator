alter table public.sign_image_overrides
  add column if not exists annotation jsonb,
  add column if not exists annotation_version integer not null default 1;
