import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ScanBody {
  qrCode: string;
  deviceId?: string;
  location?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ScanBody = await req.json();
    const { qrCode, deviceId, location } = body;

    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: "QR Code wajib diisi" },
        { status: 400 }
      );
    }

    // Cari karyawan berdasarkan qrCode
    const karyawan = await prisma.karyawan.findFirst({
      where: { qrCode },
    });

    if (!karyawan) {
      return NextResponse.json(
        { success: false, error: "QR Code tidak valid" },
        { status: 404 }
      );
    }

    // Cek status karyawan
    if (karyawan.status !== "AKTIF") {
      return NextResponse.json(
        { success: false, error: "Kartu karyawan tidak aktif" },
        { status: 403 }
      );
    }

    // Tentukan tanggal hari ini (reset jam ke 00:00:00)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Cek absensi hari ini untuk karyawan ini
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        karyawanId: karyawan.id,
        tanggal: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let scanType: "MASUK" | "KELUAR";
    let absensi;

    // Tentukan status berdasarkan jam masuk
    // TELAT jika masuk setelah jam 8:00 pagi (tapi sebelum jam 12 siang - shift pagi)
    // Untuk shift malam/sore, tidak dianggap TELAT
    const jamMasuk = now.getHours() * 60 + now.getMinutes(); // dalam menit
    const jam8Pagi = 8 * 60; // 8:00 = 480 menit
    const jam12Siang = 12 * 60; // 12:00 = 720 menit
    const isShiftPagi = jamMasuk >= 0 && jamMasuk < jam12Siang; // 00:00 - 12:00 dianggap shift pagi
    const statusAbsensi = (isShiftPagi && jamMasuk > jam8Pagi) ? "TELAT" : "HADIR";

    if (!existingAbsensi) {
      // Belum ada scan hari ini = MASUK
      scanType = "MASUK";
      absensi = await prisma.absensi.create({
        data: {
          karyawanId: karyawan.id,
          tanggal: now,
          waktuMasuk: now,
          status: statusAbsensi,
          keterangan: deviceId ? `Scan dari: ${deviceId}` : null,
        },
      });
    } else if (!existingAbsensi.waktuKeluar) {
      // Sudah scan masuk, tapi belum scan keluar = KELUAR
      scanType = "KELUAR";
      absensi = await prisma.absensi.update({
        where: { id: existingAbsensi.id },
        data: {
          waktuKeluar: now,
        },
      });
    } else {
      // Sudah scan masuk dan keluar = Update jam keluar terbaru dengan catatan
      scanType = "KELUAR";
      const catatanBaru = `Update keluar: ${now.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}`;
      absensi = await prisma.absensi.update({
        where: { id: existingAbsensi.id },
        data: {
          waktuKeluar: now,
          keterangan: existingAbsensi.keterangan
            ? `${existingAbsensi.keterangan} | ${catatanBaru}`
            : catatanBaru,
        },
      });
    }

    // Tentukan pesan berdasarkan scan ke-berapa
    const isUpdateKeluar = existingAbsensi?.waktuKeluar ? true : false;
    const message = isUpdateKeluar
      ? "Scan berhasil - Jam keluar diupdate. Anda bisa menambahkan keterangan jika diperlukan."
      : scanType === "MASUK"
      ? `Scan masuk berhasil - Status: ${statusAbsensi}`
      : "Scan keluar berhasil";

    // Response sukses
    return NextResponse.json({
      success: true,
      scanType,
      message,
      data: {
        karyawan: {
          id: karyawan.id,
          nik: karyawan.nik,
          nama: karyawan.nama,
          jabatan: karyawan.jabatan,
          departemen: karyawan.departemen,
        },
        absensi: {
          id: absensi.id,
          tanggal: absensi.tanggal,
          waktuMasuk: absensi.waktuMasuk,
          waktuKeluar: absensi.waktuKeluar,
          status: absensi.status,
          keterangan: absensi.keterangan,
        },
        scanInfo: {
          waktuScan: now,
          deviceId: deviceId || null,
          location: location || null,
        },
        updateKeterangan: {
          endpoint: `/api/absensi/${absensi.id}`,
          method: "PUT",
          body: { keterangan: "string", status: "HADIR|TELAT|IZIN|SAKIT|DINAS_LUAR" },
        },
      },
    });
  } catch (error) {
    console.error("[SCAN_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat memproses scan" },
      { status: 500 }
    );
  }
}

// GET endpoint untuk testing/verifikasi QR
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qrCode = searchParams.get("qrCode");

    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: "Parameter qrCode wajib diisi" },
        { status: 400 }
      );
    }

    const karyawan = await prisma.karyawan.findFirst({
      where: { qrCode },
    });

    if (!karyawan) {
      return NextResponse.json(
        { success: false, error: "QR Code tidak valid" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: karyawan.id,
        nik: karyawan.nik,
        nama: karyawan.nama,
        jabatan: karyawan.jabatan,
        departemen: karyawan.departemen,
        status: karyawan.status,
      },
    });
  } catch (error) {
    console.error("[SCAN_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
