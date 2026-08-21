'use client';

import Link from 'next/link';
import { Users, GraduationCap, ArrowRight } from 'lucide-react';

export default function AdminPenggunaOverviewPage() {
  const userModules = [
    { title: 'Data Siswa', desc: 'Manajemen data peserta didik aktif, rombel kelas, NIS, dan status siswa', href: '/admin/pengguna/siswa', count: '226 Siswa', icon: Users, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { title: 'Data Guru & Pendidik', desc: 'Manajemen data tenaga pendidik, NIP/NUPTK, mata pelajaran, dan jadwal', href: '/admin/pengguna/guru', count: '22 Guru', icon: GraduationCap, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Kelola akun dan data civitas akademika sekolah</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {userModules.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-6 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${item.color} shadow-2xs`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full">
                    {item.count}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-4 border-t border-emerald-50 flex items-center justify-between text-xs font-extrabold text-emerald-700">
                <span>Kelola Data {item.title}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
