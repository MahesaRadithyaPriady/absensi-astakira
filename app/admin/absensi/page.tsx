"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, Clock, User2, Filter } from "lucide-react";

interface Absensi {
  id: string;
  tanggal: string;
  waktuMasuk: string | null;
  waktuKeluar: string | null;
  status: string;
  keterangan: string | null;
  karyawan: {
    nama: string;
    nik: string;
    jabatan: string;
  };
  scanBy: string | null;
}

export default function AbsensiPage() {
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");

  useEffect(() => {
    fetchAbsensi();
  }, []);

  const fetchAbsensi = async () => {
    try {
      const res = await fetch("/api/absensi");
      const data = await res.json();
      if (data.success) {
        setAbsensi(data.absensi);
      }
    } catch (error) {
      console.error("[ABSENSI] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAbsensi = absensi.filter(
    (a) =>
      (a.karyawan.nama.toLowerCase().includes(search.toLowerCase()) ||
        a.karyawan.nik.toLowerCase().includes(search.toLowerCase())) &&
      (!filterTanggal || a.tanggal.startsWith(filterTanggal))
  );

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Absensi</h1>
        <p className="text-zinc-400 mt-1">Lihat riwayat absensi karyawan</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIK..."
            className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="date"
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
            className="pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400">Total Hadir Hari Ini</p>
          <p className="text-2xl font-bold text-white mt-1">
            {absensi.filter((a) => a.status === "HADIR" && new Date(a.tanggal).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400">Telat</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">
            {absensi.filter((a) => a.status === "TELAT").length}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400">Izin</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {absensi.filter((a) => a.status === "IZIN").length}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400">Alpha</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {absensi.filter((a) => a.status === "ALPHA").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-800 rounded-2xl border border-zinc-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Tanggal</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Karyawan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Waktu Masuk</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Waktu Keluar</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {filteredAbsensi.map((a) => (
              <tr key={a.id} className="hover:bg-zinc-700/30">
                <td className="px-4 py-3 text-sm text-white">{formatDate(a.tanggal)}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{a.karyawan.nama}</p>
                    <p className="text-xs text-zinc-400">{a.karyawan.nik} • {a.karyawan.jabatan}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    {formatTime(a.waktuMasuk)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    {formatTime(a.waktuKeluar)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    a.status === "HADIR" ? "bg-green-500/20 text-green-400" :
                    a.status === "TELAT" ? "bg-orange-500/20 text-orange-400" :
                    a.status === "IZIN" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{a.keterangan || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAbsensi.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            Tidak ada data absensi
          </div>
        )}
      </div>
    </div>
  );
}
