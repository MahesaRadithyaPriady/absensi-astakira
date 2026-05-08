import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List all absensi with karyawan info
export async function GET() {
  try {
    const absensi = await prisma.absensi.findMany({
      include: {
        karyawan: {
          select: {
            nama: true,
            nik: true,
            jabatan: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, absensi });
  } catch (error) {
    console.error("[ABSENSI GET] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data absensi" },
      { status: 500 }
    );
  }
}

// POST - Create new absensi (scan QR)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCode, scanBy } = body;

    console.log("[ABSENSI POST] Scan QR:", { qrCode });

    // Find karyawan by QR code
    const karyawan = await prisma.karyawan.findUnique({
      where: { qrCode },
    });

    if (!karyawan) {
      return NextResponse.json(
        { error: "QR Code tidak valid" },
        { status: 404 }
      );
    }

    // Check if already has absensi today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        karyawanId: karyawan.id,
        tanggal: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingAbsensi) {
      // Jika sudah ada waktu masuk dan waktu keluar, tolak scan lagi
      if (existingAbsensi.waktuMasuk && existingAbsensi.waktuKeluar) {
        console.log("[ABSENSI POST] Rejected - already complete:", existingAbsensi.id);
        
        return NextResponse.json({
          success: false,
          error: "Anda tidak perlu scan lagi",
          message: "Anda sudah melakukan scan masuk dan keluar hari ini",
          absensi: {
            id: existingAbsensi.id,
            karyawan: {
              nama: karyawan.nama,
              nik: karyawan.nik,
            },
            waktuMasuk: existingAbsensi.waktuMasuk,
            waktuKeluar: existingAbsensi.waktuKeluar,
            status: existingAbsensi.status,
          },
        }, { status: 400 });
      }
      
      // Update waktu keluar (check out) - hanya jika belum ada waktu keluar
      const updated = await prisma.absensi.update({
        where: { id: existingAbsensi.id },
        data: {
          waktuKeluar: new Date(),
        },
        include: {
          karyawan: {
            select: {
              nama: true,
              nik: true,
            },
          },
        },
      });

      console.log("[ABSENSI POST] Check out:", updated.id);

      return NextResponse.json({
        success: true,
        message: "Check out berhasil",
        absensi: updated,
      });
    }

    // Create new absensi (check in)
    const now = new Date();
    const hours = now.getHours();
    
    // Determine status (telat if after 8 AM)
    const status = hours >= 8 ? "TELAT" : "HADIR";

    const absensi = await prisma.absensi.create({
      data: {
        karyawanId: karyawan.id,
        waktuMasuk: now,
        status,
        scanBy,
      },
      include: {
        karyawan: {
          select: {
            nama: true,
            nik: true,
          },
        },
      },
    });

    console.log("[ABSENSI POST] Check in:", absensi.id, "Status:", status);

    return NextResponse.json({
      success: true,
      message: "Check in berhasil",
      absensi,
    });
  } catch (error) {
    console.error("[ABSENSI POST] Error:", error);
    return NextResponse.json(
      { error: "Gagal mencatat absensi" },
      { status: 500 }
    );
  }
}
