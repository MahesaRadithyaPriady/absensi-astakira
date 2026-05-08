"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, User, Clock, AlertCircle, Send, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function AbsensiSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const message = searchParams.get('message') || 'Absensi berhasil';
  const nama = searchParams.get('nama') || '';
  const nik = searchParams.get('nik') || '';
  const status = searchParams.get('status') || 'HADIR';
  const waktu = searchParams.get('waktu') || '';
  const absensiId = searchParams.get('id') || '';

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-scan countdown
  useEffect(() => {
    if (isLoading || isSubmitting) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, isSubmitting, router]);

  const handleSubmitKeterangan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan.trim() || !absensiId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/absensi/${absensiId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keterangan: keterangan.trim() }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setKeterangan('');
      }
    } catch (error) {
      console.error('Failed to submit keterangan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanAgain = () => {
    router.push('/');
  };

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

            {/* Form Keterangan */}
            {absensiId && !submitSuccess && (
              <form onSubmit={handleSubmitKeterangan} className="mb-6">
                <div className="text-left">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Tambah Keterangan (Opsional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Contoh: Pulang cepat, lembur, dll"
                      className="flex-1 px-4 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !keterangan.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {submitSuccess && (
              <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-xl text-sm">
                Keterangan berhasil ditambahkan!
              </div>
            )}
            
            {/* Countdown */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <RotateCcw className="w-4 h-4" />
                Scan lagi dalam {countdown} detik
              </div>
            </div>
            
            {/* Tombol Scan Lagi */}
            <div className="space-y-3">
              <button
                onClick={handleScanAgain}
                className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors inline-block text-center"
              >
                Scan Lagi Sekarang
              </button>
              
              <Link
                href="/"
                className="w-full py-3 px-6 bg-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-300 transition-colors inline-block text-center"
              >
                Kembali ke Halaman Utama
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
