"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, User, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AbsensiSuccess() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const message = searchParams.get('message') || 'Absensi berhasil';
  const nama = searchParams.get('nama') || '';
  const nik = searchParams.get('nik') || '';
  const status = searchParams.get('status') || 'HADIR';
  const waktu = searchParams.get('waktu') || '';

  useEffect(() => {
    // Simulate loading and then show success
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 animate-pulse">
            <Clock className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Memproses Absensi...
          </h2>
          <p className="text-zinc-500">Sedang menyimpan data absensi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              {message}
            </h1>
            
            {nama && (
              <div className="bg-zinc-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="font-medium text-zinc-900">{nama}</p>
                    <p className="text-sm text-zinc-500">{nik}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      status === 'HADIR' ? 'bg-green-100 text-green-700' :
                      status === 'TELAT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {status}
                    </span>
                  </div>
                  
                  {waktu && (
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Waktu</p>
                      <p className="text-sm font-medium text-zinc-900">
                        {new Date(waktu).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Link
                href="/"
                className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors inline-block text-center"
              >
                Scan Lagi
              </Link>
              
              <Link
                href="/admin/login"
                className="w-full py-3 px-6 bg-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-300 transition-colors inline-block text-center"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
