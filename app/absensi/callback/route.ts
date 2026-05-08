import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nik = searchParams.get('nik');

    if (!nik) {
      return NextResponse.redirect(new URL('/?error=QR+code+invalid', request.url));
    }

    console.log('[ABSENSI CALLBACK] Processing QR scan for NIK:', nik);

    // Find karyawan by NIK
    const karyawan = await prisma.karyawan.findUnique({
      where: { nik },
    });

    if (!karyawan) {
      return NextResponse.redirect(new URL('/?error=Karyawan+tidak+ditemukan', request.url));
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

    let absensi;
    let message: string;

    if (existingAbsensi) {
      // Update waktu keluar (check out)
      absensi = await prisma.absensi.update({
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
      message = 'Check out berhasil';
    } else {
      // Create new absensi (check in)
      const now = new Date();
      const hours = now.getHours();
      
      // Determine status (telat if after 8 AM)
      const status = hours >= 8 ? 'TELAT' : 'HADIR';

      absensi = await prisma.absensi.create({
        data: {
          karyawanId: karyawan.id,
          waktuMasuk: now,
          status,
          scanBy: 'qr-callback',
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
      message = 'Check in berhasil';
    }

    console.log('[ABSENSI CALLBACK] Success:', { message, karyawan: karyawan.nama });

    // Redirect to success page with absensi data
    const successUrl = new URL('/absensi/success', request.url);
    successUrl.searchParams.set('message', message);
    successUrl.searchParams.set('nama', absensi.karyawan.nama);
    successUrl.searchParams.set('nik', absensi.karyawan.nik);
    successUrl.searchParams.set('status', absensi.status);
    successUrl.searchParams.set('waktu', (absensi.waktuMasuk || absensi.waktuKeluar || new Date()).toISOString());
    successUrl.searchParams.set('id', absensi.id);
    
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('[ABSENSI CALLBACK] Error:', error);
    return NextResponse.redirect(new URL('/?error=Terjadi+kesalahan', request.url));
  }
}
