// Admin session token: `${exp}.${hmacHex}`; HMAC key derived from ADMIN_PASSWORD.
// Runs on both Edge (middleware) and Node (route handlers) via Web Crypto.
const COOKIE = 'admin_session';
const TTL_SEC = 60 * 60 * 24 * 7;

function enc(s: string) {
  return new TextEncoder().encode(s);
}
function hex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function key(secret: string) {
  const raw = await crypto.subtle.digest('SHA-256', enc(`${secret}|ibasho-admin-session`));
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}
async function sign(secret: string, payload: string) {
  return hex(await crypto.subtle.sign('HMAC', await key(secret), enc(payload)));
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_TTL_SEC = TTL_SEC;

export async function issueAdminToken(secret: string) {
  const exp = String(Math.floor(Date.now() / 1000) + TTL_SEC);
  return `${exp}.${await sign(secret, exp)}`;
}

export async function verifyAdminToken(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, await sign(secret, exp));
}
