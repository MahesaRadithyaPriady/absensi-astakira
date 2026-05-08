import QRCode from 'qrcode';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from './prisma';

// Generate sequential NIK (ASTA-0001, ASTA-0002, etc.)
export async function generateSequentialNIK(): Promise<string> {
  try {
    // Get the last NIK from database
    const lastKaryawan = await prisma.karyawan.findFirst({
      where: {
        nik: {
          startsWith: 'ASTA-'
        }
      },
      orderBy: {
        nik: 'desc'
      }
    });

    let nextNumber = 1;
    
    if (lastKaryawan && lastKaryawan.nik) {
      // Extract number from last NIK (e.g., ASTA-0001 -> 0001 -> 1)
      const match = lastKaryawan.nik.match(/ASTA-(\d+)/);
      if (match && match[1]) {
        const lastNumber = parseInt(match[1], 10);
        nextNumber = lastNumber + 1;
      }
    }

    // Ensure we don't exceed 9999
    if (nextNumber > 9999) {
      throw new Error('Maximum NIK number reached (ASTA-9999)');
    }

    return `ASTA-${nextNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('[GENERATE_NIK] Error:', error);
    // Fallback to timestamp-based approach if database query fails
    const timestamp = Date.now();
    const sequence = (timestamp % 9999) + 1;
    return `ASTA-${sequence.toString().padStart(4, '0')}`;
  }
}

// Generate no kartu format ASTA-K0001
export function generateNoKartu(nik: string): string {
  // Extract number from NIK (e.g., ASTA-0001 -> 0001)
  const match = nik.match(/ASTA-(\d+)/);
  const number = match ? match[1] : '0001';
  return `ASTA-K${number}`;
}

// Generate QR code with callback URL
export async function generateQRCodeImage(nik: string): Promise<{ qrCode: string; qrImagePath: string }> {
  try {
    // Create callback URL for absensi
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/absensi/callback?nik=${encodeURIComponent(nik)}`;
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(callbackUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Also save as file in public/qrcodes directory
    const qrCodesDir = join(process.cwd(), 'public', 'qrcodes');
    await mkdir(qrCodesDir, { recursive: true });
    
    const fileName = `${nik.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const filePath = join(qrCodesDir, fileName);
    
    // Generate QR code as buffer and save
    const qrBuffer = await QRCode.toBuffer(callbackUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    await writeFile(filePath, qrBuffer);
    
    return {
      qrCode: callbackUrl,
      qrImagePath: `/qrcodes/${fileName}`
    };
  } catch (error) {
    console.error('[QR_GENERATOR] Error:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Generate kartu fisik ID
export function generateKartuFisik(nik: string): string {
  const timestamp = Date.now().toString();
  return `KARTU-${nik}-${timestamp}`;
}

// Generate masa aktif (2 years from now)
export function generateMasaAktif(): Date {
  const masaAktif = new Date();
  masaAktif.setFullYear(masaAktif.getFullYear() + 2);
  return masaAktif;
}
