import { generateAccessToken } from "./token";

// Generate unique kartu number
export function generateNoKartu(nik: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `KARTU-${nik}-${timestamp}-${random}`;
}

// Generate QR code for absensi
export function generateQRCode(nik: string): string {
  const token = generateAccessToken().slice(0, 8);
  return `AST-${nik}-${token}`;
}

// Generate kartu fisik ID
export function generateKartuFisik(nik: string): string {
  const timestamp = Date.now().toString();
  return `KARTU-${nik}-${timestamp}`;
}
