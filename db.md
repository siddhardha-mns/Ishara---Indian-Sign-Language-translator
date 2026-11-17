# Supabase database and storage

Created on 2026-11-16 through the Supabase plugin.

## Project

- Name: `ishara-isl-translator`
- Project ref: `ecsjgbkgilhqttamggbw`
- Region: `ap-south-1` (Mumbai)
- URL: `https://ecsjgbkgilhqttamggbw.supabase.co`
- Status at creation: `ACTIVE_HEALTHY`
- Client key: use the publishable key from the Supabase dashboard; never add a `service_role` key to the frontend.

## Database object

`public.sign_image_overrides` stores the latest captured replacement image for each sign and user:

```sql
user_id uuid references auth.users(id) on delete cascade
sign_name text
storage_path text
content_type text default 'image/jpeg'
created_at timestamptz default now()
updated_at timestamptz default now()
annotation jsonb
annotation_version integer default 1
primary key (user_id, sign_name)
```

Row-level security is enabled. Only the owning authenticated user can select, insert, update, or delete their rows. The complete applied SQL is also checked into `supabase/migrations/20261116082238_sign_assets.sql`.

## Storage buckets

| Bucket | Public | Limit | MIME types | Current objects |
|---|---:|---:|---|---:|
| `sign-reference` | Yes, read-only | 2 MB | JPEG, PNG | 0 |
| `sign-overrides` | No | 2 MB | JPEG, PNG | 0 |

The application currently ships the 139 verified reference frames in `public/sign-frames/`, so downloading them into Supabase is not required for the app to run. Captured replacement images are uploaded to:

```text
sign-overrides/<authenticated-user-id>/<sign-slug>.jpg
```

The app records that path in `sign_image_overrides`, then creates a temporary signed URL for display. No objects were uploaded during project creation; the first capture creates the corresponding override object.

Each accepted replacement also stores a MediaPipe annotation in the same row:

```json
{
  "version": 1,
  "width": 640,
  "height": 480,
  "hands": [{
    "handedness": "Right",
    "score": 0.98,
    "landmarks": [{"x": 0.42, "y": 0.61, "z": -0.01}]
  }],
  "capturedAt": "2026-11-16T00:00:00.000Z"
}
```

The capture is rejected when MediaPipe finds no hand. The annotation is a verified landmark reference; it does not retrain MediaPipe itself. The live camera still performs fresh MediaPipe detection on every frame.

## Frontend integration

Files added/changed:

- `src/services/supabaseClient.ts` creates a client only when Vite environment variables are present.
- `src/services/signImageOverrides.ts` keeps localStorage as an offline fallback and uploads captures to Supabase when configured.
- `src/components/SignDictionary.tsx` synchronizes remote overrides on load and uploads new captures.
- `src/components/SignDictionary.tsx` runs MediaPipe on each replacement frame, rejects unusable images, and marks annotated images with `MP ✓`.
- `.env.example` documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

Create `.env.local` from `.env.example` and set:

```env
VITE_SUPABASE_URL=https://ecsjgbkgilhqttamggbw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
```

Enable **Authentication → Sign In / Providers → Anonymous Sign-Ins** in the Supabase dashboard. The app uses anonymous authenticated sessions so storage and table policies can remain owner-scoped without requiring a login screen. If anonymous sign-in is disabled, the app intentionally falls back to localStorage.

## Verification

Verified through the plugin after migration:

- `public.sign_image_overrides` exists.
- Both storage buckets exist with the configured limits and MIME types.
- RLS policies exist for the table and `storage.objects`.
- The frontend dependency is `@supabase/supabase-js`.

Run locally:

```bash
npm run lint
npm run build
```

Never put the service-role key in `.env.local`, source control, Vite variables, or browser code.
