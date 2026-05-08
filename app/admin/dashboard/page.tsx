"use client";

import { Users, QrCode, Calendar, Activity } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { name: "Total Users", value: "--", icon: Users, color: "bg-blue-500" },
    { name: "Scan Hari Ini", value: "--", icon: QrCode, color: "bg-green-500" },
    { name: "Kehadiran", value: "--", icon: Calendar, color: "bg-purple-500" },
    { name: "Aktivitas", value: "--", icon: Activity, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Selamat datang di panel admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700">
        <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Buka Scanner
          </a>
          <button className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors">
            Generate QR
          </button>
          <button className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors">
            Lihat Laporan
          </button>
        </div>
      </div>
    </div>
  );
}
