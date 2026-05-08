"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Search, Edit, Trash2, Eye, X, QrCode, User, Calendar, MapPin, Phone, Mail, Building, Download, CreditCard } from "lucide-react";
import PhotoUpload from "@/app/admin/components/PhotoUpload";
import LoadingSkeleton from "@/app/admin/components/LoadingSkeleton";

interface Karyawan {
  id: string;
  nik: string;
  nama: string;
  jabatan: string;
  departemen: string;
  noHp: string | null;
  email: string | null;
  alamat: string | null;
  photo: string | null;
  noKartu: string | null;
  qrCode: string | null;
  qrImagePath: string | null;
  kartuFisik: string | null;
  masaAktif: string | null;
  status: string;
  createdAt: string;
}

export default function KaryawanPage() {
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showKartuModal, setShowKartuModal] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState<Karyawan | null>(null);
  const [kartuSide, setKartuSide] = useState<'depan' | 'belakang'>('depan');
  const [isDownloadingKartu, setIsDownloadingKartu] = useState(false);
  const kartuCaptureRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    jabatan: "",
    departemen: "",
    noHp: "",
    email: "",
    alamat: "",
    masaAktif: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nextNik, setNextNik] = useState<string>("");
  const [qrImageLoaded, setQrImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchKaryawan();
    fetchNextNik();
  }, []);

  const fetchKaryawan = async () => {
    try {
      const res = await fetch("/api/karyawan");
      const data = await res.json();
      if (data.success) {
        setKaryawan(data.karyawan);
      } else {
        toast.error(data.error || "Gagal memuat data karyawan");
      }
    } catch (error) {
      console.error("[KARYAWAN] Fetch error:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (photoFile) {
        formDataToSend.append("photo", photoFile);
      }

      const res = await fetch("/api/karyawan", {
        method: "POST",
        body: formDataToSend,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Karyawan berhasil ditambahkan!");
        setShowModal(false);
        resetForm();
        fetchKaryawan();
      } else {
        toast.error(data.error || "Gagal menambah karyawan");
      }
    } catch (error) {
      console.error("[KARYAWAN] Create error:", error);
      toast.error("Terjadi kesalahan saat menambah karyawan");
    }
  };

  const fetchNextNik = async () => {
    try {
      const res = await fetch("/api/karyawan/next-nik");
      const data = await res.json();
      if (data.success) {
        setNextNik(data.nextNik);
      }
    } catch (error) {
      console.error("[NEXT_NIK] Error:", error);
    }
  };

  const resetForm = () => {
    setFormData({ nik: "", nama: "", jabatan: "", departemen: "", noHp: "", email: "", alamat: "", masaAktif: "" });
    setPhotoFile(null);
    setIsEditing(false);
    fetchNextNik();
  };

  const handleEdit = (k: Karyawan) => {
    setFormData({
      nik: k.nik,
      nama: k.nama,
      jabatan: k.jabatan,
      departemen: k.departemen,
      noHp: k.noHp || "",
      email: k.email || "",
      alamat: k.alamat || "",
      masaAktif: k.masaAktif ? new Date(k.masaAktif).toISOString().split('T')[0] : "",
    });
    setPhotoFile(null);
    setIsEditing(true);
    setSelectedKaryawan(k);
    setShowModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKaryawan) return;

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (photoFile) {
        formDataToSend.append("photo", photoFile);
      }

      const res = await fetch(`/api/karyawan/${selectedKaryawan.id}`, {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Karyawan berhasil diupdate!");
        setShowModal(false);
        resetForm();
        fetchKaryawan();
      } else {
        toast.error(data.error || "Gagal mengupdate karyawan");
      }
    } catch (error) {
      console.error("[KARYAWAN] Update error:", error);
      toast.error("Terjadi kesalahan saat mengupdate karyawan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) return;

    try {
      const res = await fetch(`/api/karyawan/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Karyawan berhasil dihapus!");
        fetchKaryawan();
      } else {
        toast.error(data.error || "Gagal menghapus karyawan");
      }
    } catch (error) {
      console.error("[KARYAWAN] Delete error:", error);
    }
  };

  const generateKartu = async (id: string) => {
    try {
      const res = await fetch(`/api/karyawan/${id}/kartu`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchKaryawan();
        toast.success("Kartu fisik berhasil digenerate!");
      } else {
        toast.error(data.error || "Gagal generate kartu");
      }
    } catch (error) {
      console.error("[KARYAWAN] Generate kartu error:", error);
      toast.error("Terjadi kesalahan saat generate kartu");
    }
  };

  const checkQrImageExists = (karyawan: Karyawan) => {
    if (karyawan.qrImagePath) {
      const img = new Image();
      img.onload = () => {
        setQrImageLoaded(prev => ({ ...prev, [karyawan.id]: true }));
      };
      img.onerror = () => {
        setQrImageLoaded(prev => ({ ...prev, [karyawan.id]: false }));
      };
      img.src = karyawan.qrImagePath;
    }
  };

  const lihatKartu = (k: Karyawan) => {
    setSelectedKaryawan(k);
    setKartuSide('depan');
    setShowKartuModal(true);
    checkQrImageExists(k);
  };

  const downloadKartuPdf = async () => {
    if (!selectedKaryawan) return;
    if (!kartuCaptureRef.current) {
      toast.error("Kartu belum siap untuk di-download");
      return;
    }

    setIsDownloadingKartu(true);
    const prevSide = kartuSide;

    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      const captureSidePng = async (side: 'depan' | 'belakang') => {
        setKartuSide(side);
        await new Promise((r) => setTimeout(r, 350));
        const el = kartuCaptureRef.current;
        if (!el) throw new Error("Capture element not found");
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (document as any).fonts?.ready;
        } catch {
          // ignore
        }
        const rect = el.getBoundingClientRect();
        const dataUrl = await toPng(el, {
          cacheBust: true,
          pixelRatio: 2,
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height),
          style: {
            background: "#ffffff",
          },
          // prevent capturing outside viewport
          skipAutoScale: true,
        } as any);
        return { dataUrl, width: Math.ceil(rect.width * 2), height: Math.ceil(rect.height * 2) };
      };

      const depan = await captureSidePng('depan');
      const belakang = await captureSidePng('belakang');

      const pdf = new jsPDF({
        orientation: depan.width >= depan.height ? "landscape" : "portrait",
        unit: "pt",
        format: [depan.width, depan.height],
      });

      pdf.addImage(depan.dataUrl, "PNG", 0, 0, depan.width, depan.height);
      pdf.addPage([belakang.width, belakang.height], belakang.width >= belakang.height ? "landscape" : "portrait");
      pdf.addImage(belakang.dataUrl, "PNG", 0, 0, belakang.width, belakang.height);

      pdf.save(`kartu-${selectedKaryawan.nik}.pdf`);
      toast.success("PDF kartu berhasil di-download");
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : "Gagal download kartu";
      const errorPayload = {
        source: "kartu_pdf",
        message: msg,
        name: e?.name,
        stack: e?.stack,
        side: kartuSide,
        nik: selectedKaryawan?.nik,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      };

      console.error("[KARTU_PDF]", errorPayload, e);
      try {
        await fetch("/api/client-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(errorPayload),
        });
      } catch {
        // ignore
      }

      if (msg.toLowerCase().includes("html2canvas") || msg.toLowerCase().includes("jspdf")) {
        toast.error("Dependency belum terpasang. Install: npm i html2canvas jspdf");
      } else {
        toast.error(msg);
      }
    } finally {
      setKartuSide(prevSide);
      setIsDownloadingKartu(false);
    }
  };

  const filteredKaryawan = karyawan.filter(
    (k) =>
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.nik.toLowerCase().includes(search.toLowerCase()) ||
      k.jabatan.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Karyawan</h1>
          <p className="text-zinc-400 mt-1">Kelola data karyawan dan kartu fisik</p>
        </div>
        <button
          onClick={() => {
            setSelectedKaryawan(null);
            setPhotoFile(null);
            setIsEditing(false);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Karyawan
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari karyawan..."
          className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-800 rounded-2xl border border-zinc-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Photo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">NIK</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Nama</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">No Kartu</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Jabatan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Departemen</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">QR Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Kartu Fisik</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {filteredKaryawan.map((k) => (
              <tr key={k.id} className="hover:bg-zinc-700/30">
                <td className="px-4 py-3">
                  {k.photo ? (
                    <img
                      src={k.photo}
                      alt={k.nama}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {k.nama.charAt(0)}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-white">{k.nik}</td>
                <td className="px-4 py-3 text-sm text-white font-mono text-xs">{k.noKartu || '-'}</td>
                <td className="px-4 py-3 text-sm text-white">{k.nama}</td>
                <td className="px-4 py-3 text-sm text-zinc-300">{k.jabatan}</td>
                <td className="px-4 py-3 text-sm text-zinc-300">{k.departemen}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    k.status === "AKTIF" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {k.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {k.qrCode ? (
                    <span className="text-green-400 text-sm">Ada</span>
                  ) : (
                    <span className="text-zinc-500 text-sm">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {k.kartuFisik ? (
                    <button
                      onClick={() => lihatKartu(k)}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat
                    </button>
                  ) : (
                    <button
                      onClick={() => generateKartu(k.id)}
                      className="text-zinc-400 hover:text-white text-sm flex items-center gap-1"
                    >
                      <CreditCard className="w-4 h-4" />
                      Generate
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(k)}
                      className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(k.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredKaryawan.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            Tidak ada data karyawan
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-2xl p-6 w-full max-w-lg border border-zinc-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {isEditing ? "Edit Karyawan" : "Tambah Karyawan"}
            </h2>
            <form onSubmit={isEditing ? handleUpdate : handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Photo Profil</label>
                <PhotoUpload 
                  value={selectedKaryawan?.photo || undefined} 
                  onChange={setPhotoFile} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">NIK</label>
                  <input
                    type="text"
                    readOnly
                    value={isEditing ? formData.nik : nextNik}
                    className="w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-lg text-zinc-300 font-mono text-sm"
                    placeholder="Auto-generated..."
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    {isEditing ? "NIK tidak dapat diubah" : "NIK otomatis digenerate"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Nama</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Jabatan</label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Departemen</label>
                  <input
                    type="text"
                    required
                    value={formData.departemen}
                    onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">No HP</label>
                  <input
                    type="text"
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Alamat</label>
                <textarea
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Masa Aktif Kartu</label>
                  <input
                    type="date"
                    value={formData.masaAktif}
                    onChange={(e) => setFormData({ ...formData, masaAktif: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Kartu berlaku hingga tanggal ini</p>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const futureDate = new Date();
                      futureDate.setFullYear(futureDate.getFullYear() + 2);
                      setFormData({ ...formData, masaAktif: futureDate.toISOString().split('T')[0] });
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                  >
                    +2 Tahun
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-xl hover:bg-zinc-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kartu Modal */}
      {showKartuModal && selectedKaryawan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Kartu Karyawan</h2>
              <p className="text-zinc-500">Astakira Media</p>
            </div>

            {/* Kartu Container */}
            <div className="relative mb-6">
              {/* Card outer frame — raised shadow */}
              <div
                ref={kartuCaptureRef}
                data-kartu-capture="true"
                className="rounded-xl overflow-hidden shadow-2xl border border-slate-200"
                style={{
                  boxShadow: '0 25px 60px -10px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}>

                {kartuSide === 'depan' ? (
                  // ═══════════════════════════════════════
                  // SISI DEPAN — KTP-style Premium ID Card
                  // ═══════════════════════════════════════
                  <div className="relative h-[500px] overflow-hidden bg-white" style={{fontFamily: "'Courier New', monospace"}}>
                    
                    {/* ── Abstract Background Layer ── */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                      {/* Deep navy base strip kiri */}
                      <rect x="0" y="0" width="180" height="500" fill="#0f172a"/>
                      {/* Main area putih */}
                      <rect x="180" y="0" width="420" height="500" fill="#f8fafc"/>
                      {/* Diagonal slice accent */}
                      <polygon points="160,0 200,0 160,500 120,500" fill="#1e3a5f" opacity="0.9"/>
                      <polygon points="175,0 195,0 175,500 155,500" fill="#3b82f6" opacity="0.6"/>
                      {/* Abstract geometric circles - decorative */}
                      <circle cx="90" cy="80" r="120" fill="none" stroke="#1e40af" strokeWidth="0.5" opacity="0.4"/>
                      <circle cx="90" cy="80" r="90" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3"/>
                      <circle cx="90" cy="80" r="60" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3"/>
                      {/* Bottom wave abstract */}
                      <path d="M0 420 Q60 390 120 420 Q180 450 240 420 Q300 390 360 420 Q420 450 480 420 Q540 390 600 420 L600 500 L0 500 Z" fill="#0f172a" opacity="0.05"/>
                      {/* Micro dots grid */}
                      {[0,1,2,3,4,5,6,7,8].map((row) =>
                        [0,1,2,3,4,5,6,7,8,9,10].map((col) => (
                          <circle key={`${row}-${col}`} cx={210 + col * 35} cy={10 + row * 55} r="1" fill="#cbd5e1" opacity="0.5"/>
                        ))
                      )}
                      {/* Top accent bar */}
                      <rect x="0" y="0" width="600" height="5" fill="#3b82f6"/>
                      <rect x="0" y="5" width="600" height="2" fill="#1d4ed8"/>
                      {/* Bottom accent bar */}
                      <rect x="0" y="493" width="600" height="7" fill="#0f172a"/>
                    </svg>

                    {/* ── Left Panel: Logo + Label ── */}
                    <div className="absolute left-0 top-3 w-44 h-full flex flex-col items-center justify-between py-5 z-10">
                      {/* Logo */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 overflow-hidden shadow-xl backdrop-blur-sm">
                          <img src="/uploads/logo_perusahaan.jpeg" alt="Logo" className="w-full h-full object-cover"/>
                        </div>
                        <div className="text-center">
                          <p className="text-white text-[10px] font-bold tracking-[0.2em] leading-tight">ASTAKIRA</p>
                          <p className="text-blue-300 text-[9px] tracking-[0.15em]">MEDIA</p>
                        </div>
                      </div>

                      {/* Vertical Text */}
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-white/30 text-[9px] tracking-[0.35em] font-bold"
                          style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>
                          KARTU TANDA KARYAWAN
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest border ${
                        selectedKaryawan.status === 'AKTIF'
                          ? 'bg-green-500/20 border-green-400/50 text-green-300'
                          : 'bg-red-500/20 border-red-400/50 text-red-300'
                      }`}>
                        {selectedKaryawan.status}
                      </div>
                    </div>

                    {/* ── Right Panel: Main Content ── */}
                    <div className="absolute left-[185px] top-0 right-0 h-full flex flex-col z-10 px-5 py-5">
                      
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[9px] text-slate-400 tracking-[0.3em] font-bold uppercase">Republik Indonesia</p>
                          <p className="text-[11px] text-slate-700 tracking-[0.2em] font-bold uppercase">Kartu Identitas Karyawan</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-slate-400 font-mono">NIK</p>
                          <p className="text-[13px] font-bold text-slate-800 font-mono tracking-wider">{selectedKaryawan.nik}</p>
                        </div>
                      </div>

                      {/* Divider line */}
                      <div className="w-full h-px bg-gradient-to-r from-blue-400 to-transparent mb-4"/>

                      {/* Photo + Info Row */}
                      <div className="flex gap-4 mb-4">
                        {/* Photo */}
                        <div className="relative flex-shrink-0 w-24 mt-5 h-[120px]">
                          <div className="relative w-24 h-[120px] overflow-hidden border-2 border-slate-300 shadow-md rounded-sm">
                            {selectedKaryawan.photo ? (
                              <img
                                src={selectedKaryawan.photo}
                                alt={selectedKaryawan.nama}
                                className="absolute inset-0 w-full h-full object-cover object-center"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                <span className="text-3xl font-bold text-slate-500">{selectedKaryawan.nama.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          {/* Corner marks like KTP */}
                          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-500"/>
                          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-500"/>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-500"/>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-500"/>
                        </div>

                        {/* Info table — KTP style */}
                        <div className="flex-1 space-y-1.5 text-[11px]">
                          <div>
                            <p className="text-slate-400 text-[9px] uppercase tracking-wider">Nama Lengkap</p>
                            <p className="text-slate-900 font-bold tracking-wide uppercase leading-tight">{selectedKaryawan.nama}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-[9px] uppercase tracking-wider">Jabatan</p>
                            <p className="text-slate-800 font-semibold">{selectedKaryawan.jabatan}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-[9px] uppercase tracking-wider">Departemen</p>
                            <p className="text-slate-800 font-semibold">{selectedKaryawan.departemen}</p>
                          </div>
                          {selectedKaryawan.noHp && (
                            <div>
                              <p className="text-slate-400 text-[9px] uppercase tracking-wider">No. Telepon</p>
                              <p className="text-slate-800 font-mono">{selectedKaryawan.noHp}</p>
                            </div>
                          )}
                          {selectedKaryawan.email && (
                            <div>
                              <p className="text-slate-400 text-[9px] uppercase tracking-wider">Email</p>
                              <p className="text-slate-700 text-[10px]">{selectedKaryawan.email}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-full h-px bg-gradient-to-r from-blue-400/60 via-slate-200 to-transparent mb-3"/>

                      {/* Bottom Row: QR + No Kartu + Masa Aktif */}
                      <div className="flex items-end justify-between mt-auto">
                        {/* QR Code */}
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1" style={{borderRadius: '2px'}}>
                            {selectedKaryawan.qrImagePath && qrImageLoaded[selectedKaryawan.id] ? (
                              <img src={selectedKaryawan.qrImagePath} alt="QR Code" className="w-full h-full"/>
                            ) : (
                              <QrCode className="w-10 h-10 text-slate-600"/>
                            )}
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-wider">No. Kartu</p>
                            <p className="text-[11px] font-bold text-blue-700 font-mono tracking-wider">
                              {selectedKaryawan.noKartu || 'KARTU-' + selectedKaryawan.nik}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">Scan to verify</p>
                          </div>
                        </div>

                        {/* Masa Aktif */}
                        <div className="text-right">
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider">Berlaku Hingga</p>
                          <p className="text-[12px] font-bold text-slate-800 font-mono">
                            {selectedKaryawan.masaAktif
                              ? new Date(selectedKaryawan.masaAktif).toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'})
                              : (() => { const d = new Date(selectedKaryawan.createdAt); d.setFullYear(d.getFullYear()+2); return d.toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'}); })()
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Hologram shimmer strip ── */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20"
                      style={{background: 'linear-gradient(90deg, transparent, #3b82f6, #a78bfa, #34d399, #f59e0b, #3b82f6, transparent)', opacity: 0.7}}/>
                  </div>
                ) : (
                  // ═══════════════════════════════════════
                  // SISI BELAKANG — KTP-style Premium ID Card
                  // ═══════════════════════════════════════
                  <div className="relative h-[500px] overflow-hidden" style={{fontFamily: "'Courier New', monospace", background: '#0f172a'}}>
                    
                    {/* ── Abstract Dark Background ── */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                      <rect x="0" y="0" width="600" height="500" fill="#0f172a"/>
                      {/* Large abstract circles */}
                      <circle cx="500" cy="100" r="200" fill="none" stroke="#1e3a5f" strokeWidth="1" opacity="0.5"/>
                      <circle cx="500" cy="100" r="150" fill="none" stroke="#1e40af" strokeWidth="0.5" opacity="0.4"/>
                      <circle cx="500" cy="100" r="100" fill="#1e3a5f" opacity="0.15"/>
                      <circle cx="60" cy="400" r="160" fill="none" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.3"/>
                      <circle cx="60" cy="400" r="100" fill="#1e40af" opacity="0.08"/>
                      {/* Diagonal accent lines */}
                      <line x1="0" y1="200" x2="600" y2="180" stroke="#1e40af" strokeWidth="0.5" opacity="0.4"/>
                      <line x1="0" y1="210" x2="600" y2="190" stroke="#3b82f6" strokeWidth="0.3" opacity="0.2"/>
                      {/* Fine grid */}
                      {[0,1,2,3,4,5,6,7,8,9].map((col) =>
                        <line key={col} x1={col*60} y1="0" x2={col*60} y2="500" stroke="#1e3a5f" strokeWidth="0.3" opacity="0.3"/>
                      )}
                      {[0,1,2,3,4,5,6,7].map((row) =>
                        <line key={row} x1="0" y1={row*70} x2="600" y2={row*70} stroke="#1e3a5f" strokeWidth="0.3" opacity="0.3"/>
                      )}
                      {/* Top & bottom bars */}
                      <rect x="0" y="0" width="600" height="5" fill="#3b82f6"/>
                      <rect x="0" y="5" width="600" height="2" fill="#1d4ed8"/>
                      <rect x="0" y="493" width="600" height="7" fill="#1e3a5f"/>
                      {/* Magnetic stripe-like element */}
                      <rect x="0" y="60" width="600" height="45" fill="#1e293b"/>
                      <rect x="0" y="60" width="600" height="2" fill="#334155"/>
                      <rect x="0" y="103" width="600" height="2" fill="#334155"/>
                    </svg>

                    {/* ── Magnetic Stripe Label ── */}
                    <div className="absolute top-[68px] left-4 z-10">
                      <p className="text-slate-500 text-[8px] tracking-[0.4em] uppercase">Magnetic Stripe</p>
                    </div>

                    {/* ── Main Content ── */}
                    <div className="absolute inset-0 z-10 flex flex-col px-6 pt-[120px] pb-5">
                      
                      {/* Company Header */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                            <img src="/uploads/logo_perusahaan.jpeg" alt="Logo" className="w-full h-full object-cover"/>
                          </div>
                          <div>
                            <p className="text-white text-sm font-bold tracking-[0.2em]">ASTAKIRA MEDIA</p>
                            <p className="text-blue-400 text-[9px] tracking-[0.15em]">OFFICIAL EMPLOYEE CARD</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 text-[8px] tracking-wider">DOKUMEN RESMI</p>
                          <p className="text-slate-400 text-[8px] font-mono">#ASTAKIRA-2025</p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-full h-px bg-gradient-to-r from-blue-500/60 via-blue-400/30 to-transparent mb-5"/>

                      {/* QR + Details Row */}
                      <div className="flex gap-6 items-start mb-5">
                        {/* Large QR */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-28 h-28 bg-white p-2 shadow-lg shadow-blue-900/30" style={{borderRadius: '2px'}}>
                            {selectedKaryawan.qrImagePath && qrImageLoaded[selectedKaryawan.id] ? (
                              <img src={selectedKaryawan.qrImagePath} alt="QR Code" className="w-full h-full"/>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <QrCode className="w-16 h-16 text-slate-800"/>
                              </div>
                            )}
                          </div>
                          <p className="text-slate-500 text-[8px] tracking-[0.2em] uppercase">Scan to Verify</p>
                        </div>

                        {/* Card Info */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-slate-500 text-[9px] tracking-[0.3em] uppercase mb-0.5">No. Kartu</p>
                            <p className="text-blue-400 text-[15px] font-bold font-mono tracking-wider">
                              {selectedKaryawan.noKartu || 'KARTU-' + selectedKaryawan.nik}
                            </p>
                          </div>
                          <div className="flex gap-6">
                            <div>
                              <p className="text-slate-500 text-[9px] tracking-[0.3em] uppercase mb-0.5">Berlaku Hingga</p>
                              <p className="text-white text-[13px] font-bold font-mono">
                                {selectedKaryawan.masaAktif
                                  ? new Date(selectedKaryawan.masaAktif).toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'})
                                  : (() => { const d = new Date(selectedKaryawan.createdAt); d.setFullYear(d.getFullYear()+2); return d.toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'}); })()
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[9px] tracking-[0.3em] uppercase mb-0.5">Status</p>
                              <span className={`text-[11px] font-bold tracking-widest ${
                                selectedKaryawan.status === 'AKTIF' ? 'text-green-400' : 'text-red-400'
                              }`}>{selectedKaryawan.status}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-slate-500 text-[9px] tracking-[0.3em] uppercase mb-0.5">NIK</p>
                            <p className="text-white text-[12px] font-mono tracking-widest">{selectedKaryawan.nik}</p>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-full h-px bg-gradient-to-r from-slate-700 via-blue-800/40 to-transparent mb-4"/>

                      {/* Signature Row */}
                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          <p className="text-slate-600 text-[8px] tracking-wider uppercase mb-1">Catatan</p>
                          <p className="text-slate-500 text-[9px] max-w-[220px] leading-relaxed">
                            Kartu ini adalah milik Astakira Media. Jika ditemukan, harap kembalikan ke perusahaan.
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 text-[8px] tracking-wider mb-2">Menyetujui,</p>
                          <div className="w-28 h-px bg-slate-600 mb-1 ml-auto"/>
                          <p className="text-white text-[10px] font-bold tracking-wide">Mahesa Radithya Priady</p>
                          <p className="text-blue-400 text-[8px] tracking-wider">Chief Executive Officer</p>
                        </div>
                      </div>
                    </div>

                    {/* ── Hologram shimmer strip ── */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20"
                      style={{background: 'linear-gradient(90deg, transparent, #3b82f6, #a78bfa, #34d399, #f59e0b, #3b82f6, transparent)', opacity: 0.5}}/>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setKartuSide(kartuSide === 'depan' ? 'belakang' : 'depan')}
                className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-300 transition-colors flex items-center gap-2"
              >
                <span className="text-sm">{kartuSide === 'depan' ? 'Lihat Belakang' : 'Lihat Depan'}</span>
              </button>
              <button
                onClick={() => setShowKartuModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-300 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  downloadKartuPdf();
                }}
                disabled={isDownloadingKartu}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isDownloadingKartu ? "Membuat PDF..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}