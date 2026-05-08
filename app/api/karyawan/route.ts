import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAccessToken } from "@/lib/token";
import { savePhoto, validatePhoto } from "@/lib/upload";
import { generateSequentialNIK, generateNoKartu, generateQRCodeImage, generateKartuFisik, generateMasaAktif } from "@/lib/qr-generator";

// GET - List all karyawan
export async function GET() {
  try {
    const karyawan = await prisma.karyawan.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Add qrImagePath to each karyawan if not present in database
    const karyawanWithQrPath = karyawan.map(k => ({
      ...k,
      qrImagePath: (k as any).qrImagePath || `/qrcodes/${k.nik.replace(/[^a-zA-Z0-9]/g, '_')}.png`
    }));

    return NextResponse.json({ success: true, karyawan: karyawanWithQrPath });
  } catch (error) {
    console.error("[KARYAWAN GET] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data karyawan" },
      { status: 500 }
    );
  }
}

// POST - Create new karyawan with photo upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get form fields (excluding NIK - will be auto-generated)
    const nama = formData.get("nama") as string;
    const jabatan = formData.get("jabatan") as string;
    const departemen = formData.get("departemen") as string;
    const noHp = formData.get("noHp") as string;
    const email = formData.get("email") as string;
    const alamat = formData.get("alamat") as string;
    const masaAktif = formData.get("masaAktif") as string;
    const photo = formData.get("photo") as File;

    // Auto-generate NIK
    const nik = await generateSequentialNIK();

    console.log("[KARYAWAN POST] Creating:", { nik, nama, hasPhoto: !!photo });

    // No need to check if NIK already exists since we're generating it sequentially

    // Handle photo upload
    let photoPath: string | null = null;
    if (photo && photo.size > 0) {
      if (!validatePhoto(photo)) {
        return NextResponse.json(
          { error: "Format foto tidak valid. Gunakan JPG, PNG, atau WEBP (max 5MB)" },
          { status: 400 }
        );
      }
      photoPath = await savePhoto(photo, nik);
    }

    // Generate no kartu, QR code, kartu fisik, dan masa aktif
    const noKartu = generateNoKartu(nik);
    const { qrCode, qrImagePath } = await generateQRCodeImage(nik);
    const kartuFisik = generateKartuFisik(nik);
    const finalMasaAktif = masaAktif ? new Date(masaAktif) : generateMasaAktif();

    const karyawan = await prisma.karyawan.create({
      data: {
        nik,
        nama,
        jabatan,
        departemen,
        noHp,
        email,
        alamat,
        masaAktif: finalMasaAktif,
        photo: photoPath,
        noKartu,
        qrCode,
        qrImagePath,
        kartuFisik,
      } as any,
    });

    // Store QR image path separately (not in database for now)
    console.log('[KARYAWAN POST] QR Image saved at:', qrImagePath);

    console.log("[KARYAWAN POST] Created:", karyawan.id);

    return NextResponse.json({ success: true, karyawan });
  } catch (error) {
    console.error("[KARYAWAN POST] Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat karyawan" },
      { status: 500 }
    );
  }
}
