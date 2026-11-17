const STORAGE_KEY = 'ishara.sign-image-overrides.v1';
const ANNOTATION_KEY = 'ishara.sign-image-annotations.v1';
const BUCKET = 'sign-overrides';

export type SignImageOverrides = Record<string, string>;
export interface SignImageAnnotation {
  version: 1;
  width: number;
  height: number;
  hands: Array<{
    handedness?: string;
    score?: number;
    landmarks: Array<{ x: number; y: number; z?: number }>;
  }>;
  capturedAt: string;
}
export type SignImageAnnotations = Record<string, SignImageAnnotation>;

export function getSignImageOverrides(): SignImageOverrides {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as SignImageOverrides;
  } catch {
    return {};
  }
}

export function saveSignImageOverride(signName: string, imageDataUrl: string): SignImageOverrides {
  const overrides = { ...getSignImageOverrides(), [signName]: imageDataUrl };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  return overrides;
}

export function getSignImageAnnotations(): SignImageAnnotations {
  try {
    return JSON.parse(localStorage.getItem(ANNOTATION_KEY) || '{}') as SignImageAnnotations;
  } catch {
    return {};
  }
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function ensureUser() {
  const { supabase } = await import('./supabaseClient');
  if (!supabase) return null;
  const session = await supabase.auth.getSession();
  if (session.data.session?.user) return session.data.session.user;
  const result = await supabase.auth.signInAnonymously();
  return result.data.user ?? null;
}

export async function syncSignImageOverrides(): Promise<SignImageOverrides> {
  const { supabase } = await import('./supabaseClient');
  if (!supabase) return getSignImageOverrides();
  const user = await ensureUser();
  if (!user) return getSignImageOverrides();
  const result = await supabase.from('sign_image_overrides').select('sign_name,storage_path,annotation').eq('user_id', user.id);
  if (result.error) return getSignImageOverrides();
  const remote = await Promise.all((result.data ?? []).map(async (row) => {
    const signed = await supabase.storage.from(BUCKET).createSignedUrl(row.storage_path, 60 * 60 * 24 * 30);
    return [row.sign_name, signed.data?.signedUrl] as const;
  }));
  const annotations = Object.fromEntries((result.data ?? []).filter((row) => row.annotation).map((row) => [row.sign_name, row.annotation]));
  localStorage.setItem(ANNOTATION_KEY, JSON.stringify({ ...getSignImageAnnotations(), ...annotations }));
  const merged = { ...getSignImageOverrides(), ...Object.fromEntries(remote.filter(([, url]) => url)) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export async function saveSignImageOverrideRemote(
  signName: string,
  imageDataUrl: string,
  annotation: SignImageAnnotation,
): Promise<SignImageOverrides> {
  const local = saveSignImageOverride(signName, imageDataUrl);
  localStorage.setItem(ANNOTATION_KEY, JSON.stringify({ ...getSignImageAnnotations(), [signName]: annotation }));
  const { supabase } = await import('./supabaseClient');
  if (!supabase) return local;
  const user = await ensureUser();
  if (!user) return local;
  const response = await fetch(imageDataUrl);
  const blob = await response.blob();
  const storagePath = `${user.id}/${slug(signName)}.jpg`;
  const upload = await supabase.storage.from(BUCKET).upload(storagePath, blob, { contentType: 'image/jpeg', upsert: true });
  if (upload.error) return local;
  const row = await supabase.from('sign_image_overrides').upsert({
    user_id: user.id,
    sign_name: signName,
    storage_path: storagePath,
    content_type: 'image/jpeg',
    annotation,
    updated_at: new Date().toISOString(),
  });
  if (row.error) return local;
  const signed = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60 * 24 * 30);
  const merged = { ...local, ...(signed.data?.signedUrl ? { [signName]: signed.data.signedUrl } : {}) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
