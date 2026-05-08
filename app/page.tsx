"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, ScanLine, CheckCircle2, Clock, User, AlertCircle } from "lucide-react";

interface ScanResponse {
  success: boolean;
  message: string;
  absensi?: {
    id: string;
    karyawan: {
      nama: string;
      nik: string;
    };
    waktuMasuk?: string;
    waktuKeluar?: string;
    status: string;
  };
}

export default function Home() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scannerId = "qr-reader";

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(scannerId);
    }

    const startScanner = async () => {
      try {
        await scannerRef.current?.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            setScanResult(decodedText);
            scannerRef.current?.stop();
            setIsScanning(false);
            setIsProcessing(true);
            setError(null);
            
            // Process absensi
            try {
              const response = await fetch('/api/absensi', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  qrCode: decodedText,
                  scanBy: 'scanner',
                }),
              });
              
              const data: ScanResponse = await response.json();
              setScanData(data);
              
              if (!data.success) {
                setError(data.message || 'Gagal memproses absensi');
              }
            } catch (err) {
              console.error('Absensi error:', err);
              setError('Terjadi kesalahan saat memproses absensi');
            } finally {
              setIsProcessing(false);
            }
          },
          () => {}
        );
        setIsScanning(true);
      } catch (err) {
        console.error("Scanner error:", err);
      }
    };

    startScanner();

    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const handleRescan = () => {
    setScanResult(null);
    setScanData(null);
    setError(null);
    setIsScanning(true);
    const startScanner = async () => {
      try {
        await scannerRef.current?.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            setScanResult(decodedText);
            scannerRef.current?.stop();
            setIsScanning(false);
            setIsProcessing(true);
            setError(null);
            
            // Process absensi
            try {
              const response = await fetch('/api/absensi', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  qrCode: decodedText,
                  scanBy: 'scanner',
                }),
              });
              
              const data: ScanResponse = await response.json();
              setScanData(data);
              
              if (!data.success) {
                setError(data.message || 'Gagal memproses absensi');
              }
            } catch (err) {
              console.error('Absensi error:', err);
              setError('Terjadi kesalahan saat memproses absensi');
            } finally {
              setIsProcessing(false);
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("Scanner error:", err);
      }
    };
    startScanner();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Absensi Astakira</h1>
          <p className="text-zinc-500 mt-1">Scan QR Code untuk absensi</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {scanResult ? (
            <div className="p-8">
              {isProcessing ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 animate-pulse">
                    <Clock className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                    Memproses Absensi...
                  </h2>
                  <p className="text-zinc-500">Sedang menyimpan data absensi</p>
                </div>
              ) : error ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                    Gagal!
                  </h2>
                  <p className="text-zinc-500 mb-2">{error}</p>
                  <p className="text-zinc-400 text-sm mb-6 break-all">{scanResult}</p>
                  <button
                    onClick={handleRescan}
                    className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Scan Lagi
                  </button>
                </div>
              ) : scanData?.success ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                    {scanData.message}
                  </h2>
                  
                  {scanData.absensi && (
                    <div className="bg-zinc-50 rounded-xl p-4 mb-6 text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="w-5 h-5 text-zinc-500" />
                        <div>
                          <p className="font-medium text-zinc-900">{scanData.absensi.karyawan.nama}</p>
                          <p className="text-sm text-zinc-500">{scanData.absensi.karyawan.nik}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-zinc-500">Status</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            scanData.absensi.status === 'HADIR' ? 'bg-green-100 text-green-700' :
                            scanData.absensi.status === 'TELAT' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {scanData.absensi.status}
                          </span>
                        </div>
                        
                        {scanData.absensi.waktuMasuk && (
                          <div className="text-right">
                            <p className="text-xs text-zinc-500">{scanData.absensi.waktuKeluar ? 'Check Out' : 'Check In'}</p>
                            <p className="text-sm font-medium text-zinc-900">
                              {new Date(scanData.absensi.waktuMasuk || scanData.absensi.waktuKeluar!).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleRescan}
                    className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Scan Lagi
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                    Terjadi Kesalahan
                  </h2>
                  <p className="text-zinc-500 mb-6 break-all">{scanResult}</p>
                  <button
                    onClick={handleRescan}
                    className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Scan Lagi
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden">
                <div id="qr-reader" className="w-full h-full" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-blue-400 rounded-lg">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-400 -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-400 -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-400 -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-400 -mb-1 -mr-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 text-white/80">
                  <ScanLine className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isScanning ? "Scanning..." : "Memulai scanner..."}
                  </span>
                </div>
              </div>
              <p className="text-center text-zinc-500 text-sm mt-4">
                Arahkan kamera ke QR Code absensi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
