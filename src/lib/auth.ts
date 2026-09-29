import { cookies } from "next/headers";
import crypto from "crypto";
import { getAdminAuthAsync, hashPassword } from "./db";

const SESSION_COOKIE_NAME = "linktree_admin_session";
const SECRET_KEY = (process.env.JWT_SECRET || "internal-linktree-master-secret-key-salt").trim();

export function createSessionToken(): string {
  const payload = JSON.stringify({
    role: "admin",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(encodedPayload)
    .digest("base64url");

  if (signature !== expectedSig) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8")
    );
    if (!payload.exp || Date.now() > payload.exp) {
      return false;
    }
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return verifySessionToken(token);
  } catch (err) {
    console.error("Error checking admin auth cookie:", err);
    return false;
  }
}

export async function checkPassword(password: string): Promise<boolean> {
  const inputPwd = (password || "").trim();
  if (!inputPwd) return false;

  // 1. Cek environment variable ADMIN_PASSWORD (dengan trim untuk membuang newline/CR)
  const envPassword = (process.env.ADMIN_PASSWORD || "").trim();
  if (envPassword && inputPwd === envPassword) {
    return true;
  }

  // 2. Default fallback password yang diizinkan (admin123 & bapenda)
  const allowedDefaults = ["admin123", "bapenda", "bapenda123"];
  if (allowedDefaults.includes(inputPwd) || allowedDefaults.includes(inputPwd.toLowerCase())) {
    return true;
  }

  // 3. Cek database Supabase atau local db.json
  try {
    const adminAuth = await getAdminAuthAsync();
    const calculatedHash = hashPassword(inputPwd, (adminAuth.salt || "").trim());
    return calculatedHash === (adminAuth.passwordHash || "").trim();
  } catch (err) {
    console.error("Error checking password against DB:", err);
    return inputPwd === "admin123";
  }
}

export { SESSION_COOKIE_NAME };
