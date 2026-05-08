import { NextResponse } from 'next/server';
import { generateSequentialNIK } from '@/lib/qr-generator';

export async function GET() {
  try {
    const nextNik = await generateSequentialNIK();
    
    return NextResponse.json({ 
      success: true, 
      nextNik 
    });
  } catch (error) {
    console.error('[NEXT_NIK] Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengenerate NIK berikutnya' },
      { status: 500 }
    );
  }
}
