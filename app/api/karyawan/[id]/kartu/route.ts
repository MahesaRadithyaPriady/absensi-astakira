import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("[KARTU POST] Generating kartu for karyawan:", id);

    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
    });

    if (!karyawan) {
      return NextResponse.json(
        { error: "Karyawan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Generate kartu fisik ID (simulasi - nanti bisa generate PDF atau image)
    const kartuFisik = `KARTU-${karyawan.nik}-${Date.now()}`;

    const updated = await prisma.karyawan.update({
      where: { id },
      data: { kartuFisik },
    });

    console.log("[KARTU POST] Generated:", kartuFisik);

    return NextResponse.json({
      success: true,
      kartuFisik: updated.kartuFisik,
    });
  } catch (error) {
    console.error("[KARTU POST] Error:", error);
    return NextResponse.json(
      { error: "Gagal generate kartu" },
      { status: 500 }
    );
  }
}
