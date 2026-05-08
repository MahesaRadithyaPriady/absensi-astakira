import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Update keterangan absensi
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { keterangan, status } = body;

    // Cek absensi exists
    const existing = await prisma.absensi.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Data absensi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update data
    const updateData: any = {};
    if (keterangan !== undefined) updateData.keterangan = keterangan;
    if (status !== undefined) updateData.status = status;

    const absensi = await prisma.absensi.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Keterangan berhasil diupdate",
      data: {
        id: absensi.id,
        tanggal: absensi.tanggal,
        waktuMasuk: absensi.waktuMasuk,
        waktuKeluar: absensi.waktuKeluar,
        status: absensi.status,
        keterangan: absensi.keterangan,
      },
    });
  } catch (error) {
    console.error("[ABSENSI_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Gagal update keterangan" },
      { status: 500 }
    );
  }
}
