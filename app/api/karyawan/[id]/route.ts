import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { savePhoto, validatePhoto } from "@/lib/upload";
import { generateNoKartu, generateQRCodeImage, generateKartuFisik, generateMasaAktif } from "@/lib/qr-generator";

// GET - Get single karyawan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
    });

    if (!karyawan) {
      return NextResponse.json(
        { error: "Karyawan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Add qrImagePath if not present in database
    const karyawanWithQrPath = {
      ...karyawan,
      qrImagePath: (karyawan as any).qrImagePath || `/qrcodes/${karyawan.nik.replace(/[^a-zA-Z0-9]/g, '_')}.png`
    };

    return NextResponse.json({ success: true, karyawan: karyawanWithQrPath });
  } catch (error) {
    console.error("[KARYAWAN GET] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data karyawan" },
      { status: 500 }
    );
  }
}

// PUT - Update karyawan with photo upload
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    // Get form fields (excluding NIK - NIK cannot be changed)
    const nama = formData.get("nama") as string;
    const jabatan = formData.get("jabatan") as string;
    const departemen = formData.get("departemen") as string;
    const noHp = formData.get("noHp") as string;
    const email = formData.get("email") as string;
    const alamat = formData.get("alamat") as string;
    const masaAktif = formData.get("masaAktif") as string;
    const photo = formData.get("photo") as File;

    // Check if karyawan exists
    const existing = await prisma.karyawan.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Karyawan tidak ditemukan" },
        { status: 404 }
      );
    }

    const nik = existing.nik; // Use existing NIK, cannot be changed

    console.log("[KARYAWAN PUT] Updating:", { id, nik, nama, hasPhoto: !!photo });

    // Handle photo upload
    let photoPath: string | null = (existing as any).photo || null;
    if (photo && photo.size > 0) {
      if (!validatePhoto(photo)) {
        return NextResponse.json(
          { error: "Format foto tidak valid. Gunakan JPG, PNG, atau WEBP (max 5MB)" },
          { status: 400 }
        );
      }
      photoPath = await savePhoto(photo, nik);
    }

    // Generate no kartu, QR code, dan kartu fisik jika belum ada
    const updateData: any = {
      nama,
      jabatan,
      departemen,
      noHp,
      email,
      alamat,
      photo: photoPath,
    };

    // Handle masa aktif
    if (masaAktif) {
      updateData.masaAktif = new Date(masaAktif);
    }

    if (!(existing as any).noKartu) {
      updateData.noKartu = generateNoKartu(nik);
    }
    if (!existing.qrCode) {
      const { qrCode, qrImagePath } = await generateQRCodeImage(nik);
      updateData.qrCode = qrCode;
      updateData.qrImagePath = qrImagePath;
      console.log('[KARYAWAN PUT] QR Image saved at:', qrImagePath);
    }
    if (!existing.kartuFisik) {
      updateData.kartuFisik = generateKartuFisik(nik);
    }
    // masaAktif not stored in database for now due to Prisma client sync issues
    // if (!(existing as any).masaAktif) {
    //   updateData.masaAktif = generateMasaAktif();
    // }

    const karyawan = await prisma.karyawan.update({
      where: { id },
      data: updateData,
    });

    console.log("[KARYAWAN PUT] Updated:", karyawan.id);

    return NextResponse.json({ success: true, karyawan });
  } catch (error) {
    console.error("[KARYAWAN PUT] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate karyawan" },
      { status: 500 }
    );
  }
}

// DELETE - Delete karyawan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("[KARYAWAN DELETE] Deleting:", id);

    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
    });

    if (!karyawan) {
      return NextResponse.json(
        { error: "Karyawan tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.karyawan.delete({
      where: { id },
    });

    console.log("[KARYAWAN DELETE] Deleted:", id);

    return NextResponse.json({ success: true, message: "Karyawan berhasil dihapus" });
  } catch (error) {
    console.error("[KARYAWAN DELETE] Error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus karyawan" },
      { status: 500 }
    );
  }
}
