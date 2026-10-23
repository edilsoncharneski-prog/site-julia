import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'eletrosom_admin_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

function getSecretKeyMaterial(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_PASSWORD ||
    'eletrosom-ebikes-admin-hmac-secret-2026'
  );
}

async function signPayload(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecretKeyMaterial()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createAdminSessionToken(username: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${encodeURIComponent(username)}.${expiresAt}`;
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [userPart, expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const payload = `${userPart}.${expiresAtStr}`;
  const expectedSignature = await signPayload(payload);

  if (signature.length !== expectedSignature.length) return false;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return diff === 0;
}

export function validateAdminCredentials(user: string, pass: string): boolean {
  const cleanUser = (user || '').trim().toLowerCase();
  const cleanPass = (pass || '').trim();

  if (!cleanUser || !cleanPass) return false;

  const envUser = (process.env.ADMIN_USER || 'admin').trim().toLowerCase();
  const envPass = (process.env.ADMIN_PASSWORD || 'Eletrosom@2026!').trim();

  const validUsers = new Set([envUser, 'admin']);
  return validUsers.has(cleanUser) && cleanPass === envPass;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    return await verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}
