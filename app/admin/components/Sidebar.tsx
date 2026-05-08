"use client";

import { usePathname } from "next/navigation";
import { Home, Users, ClipboardList, LogOut, Shield } from "lucide-react";

interface SidebarProps {
  user: {
    name: string;
    role: string;
  } | null;
  onLogout: () => void;
}

const menuItems = [
  { href: "/admin/dashboard", label: "Home", icon: Home },
  { href: "/admin/karyawan", label: "Data Karyawan", icon: Users },
  { href: "/admin/absensi", label: "Data Absensi", icon: ClipboardList },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-800 border-r border-zinc-700 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Astakira</h1>
            <p className="text-xs text-zinc-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-zinc-700">
        {user && (
          <div className="mb-4 px-4 py-3 bg-zinc-700/50 rounded-xl">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-zinc-400">{user.role}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
