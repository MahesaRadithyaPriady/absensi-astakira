import { randomBytes } from "crypto";

export function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

export function getTokenExpiryDate(): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // Token expires in 7 days
  return expires;
}

export function isTokenExpired(expires: Date | null): boolean {
  if (!expires) return true;
  return new Date() > new Date(expires);
}
