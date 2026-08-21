'use client';

import { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Download, Printer, QrCode, GraduationCap, Shield } from 'lucide-react';

// Simple QR placeholder – in production use 'qrcode.react'
function QRPlaceholder({ value }: { value: string }) {
  return (
    <div className="w-full aspect-square bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center p-3 relative overflow-hidden">
      {/* QR pattern simulation */}
      <div className="w-full h-full grid grid-cols-10 gap-0.5 opacity-80">
        {Array.from({ length: 100 }, (_, i) => {
          const corners = [0,1,2,3,10,11,12,20,21,22,7,8,9,17,18,19,27,28,29,70,71,72,80,81,82,90,91,92,77,78,79,87,88,89,97,98,99];
          const mid = [33,34,35,36,43,44,45,46,53,54,55,56,63,64,65,66];
          const isDark = corners.includes(i) || mid.includes(i) || (Math.sin(i * 2.3 + 1.7) > 0.3);
          return (
            <div key={i} className={`rounded-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`} />
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 rounded-lg p-1">
          <QrCode className="w-6 h-6 text-gray-900" />
        </div>
      </div>
    </div>
  );
}

export default function SiswaKartuPage() {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const student = user?.student;
  const nis = student?.nis || '2024001';
  const name = student?.fullName || 'Ahmad Rizki Pratama';
  const className = student?.class?.name || '8A';
  const photo = student?.photo;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kartu Siswa Digital</h1>
          <p className="text-sm text-gray-500 mt-0.5">QR Code untuk absensi dan identitas</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            <Printer className="w-4 h-4" /> Cetak
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold">
            <Download className="w-4 h-4" /> Simpan PDF
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Card front */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Tampak Depan</p>
          <div ref={cardRef}
            className="w-full max-w-sm mx-auto bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 rounded-2xl overflow-hidden shadow-xl text-white aspect-[1.58/1] relative">

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="relative h-full flex flex-col p-5">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8 bg-white rounded-lg overflow-hidden flex-shrink-0 p-0.5 border border-white/20">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] font-bold leading-tight">SMP DARUL ULUM</p>
                  <p className="text-[9px] text-green-200 leading-tight">SURABAYA</p>
                </div>
                <div className="ml-auto">
                  <Shield className="w-5 h-5 text-green-300" />
                </div>
              </div>

              {/* Content */}
              <div className="flex gap-3 flex-1">
                {/* Photo */}
                <div className="w-16 h-20 bg-white/10 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/20">
                  {photo ? (
                    <img src={photo} alt={name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-2xl font-bold text-white/70">{name[0]}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-green-300 uppercase tracking-wider">Siswa Aktif</p>
                  <p className="font-bold text-sm leading-tight mt-0.5 line-clamp-2">{name}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-green-300 w-8">NIS</span>
                      <span className="text-[10px] font-mono font-bold">{nis}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-green-300 w-8">Kelas</span>
                      <span className="text-[10px] font-bold">{className}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-green-300 w-8">TA</span>
                      <span className="text-[10px]">2024/2025</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-[8px] text-green-300 text-center">
                  Kartu ini hanya berlaku untuk tahun ajaran 2024/2025
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card back with QR */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Tampak Belakang</p>
          <div className="w-full max-w-sm mx-auto bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 aspect-[1.58/1] relative">

            <div className="h-full flex flex-col items-center justify-center p-5">
              <div className="w-32 mx-auto mb-3">
                <QRPlaceholder value={`SMP-DARUL-ULUM:${nis}:${name}`} />
              </div>
              <p className="text-xs font-mono font-bold text-gray-900">{nis}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 text-center">Scan untuk verifikasi kehadiran</p>

              <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
                <GraduationCap className="w-3 h-3 text-green-600" />
                <span className="text-[10px] font-semibold text-gray-600">SMP Darul Ulum Surabaya</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-900 text-sm mb-2">Cara Penggunaan Kartu Digital</h3>
        <ul className="space-y-2 text-xs text-blue-700">
          <li className="flex items-start gap-2"><span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-[10px] font-bold">1</span>Tunjukkan QR Code kepada guru/petugas saat absensi</li>
          <li className="flex items-start gap-2"><span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-[10px] font-bold">2</span>Guru akan scan QR Code menggunakan aplikasi sekolah</li>
          <li className="flex items-start gap-2"><span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-[10px] font-bold">3</span>Kartu dapat dicetak atau disimpan di ponsel sebagai softcopy</li>
          <li className="flex items-start gap-2"><span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-[10px] font-bold">4</span>Jangan bagikan QR Code kepada orang lain untuk menjaga keamanan</li>
        </ul>
      </div>
    </div>
  );
}
