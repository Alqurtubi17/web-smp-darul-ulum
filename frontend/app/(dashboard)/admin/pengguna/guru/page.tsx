'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Download, GraduationCap, X } from 'lucide-react';

const TEACHERS = [
  { id:'1', nip:'198501152010011002', name:'Siti Rahayu, S.Pd.', subject:'Matematika', phone:'081234567890', status:true, joined:'2015-07-15' },
  { id:'2', nip:'198803202012022001', name:'Ahmad Fauzi, M.Pd.', subject:'IPA', phone:'082345678901', status:true, joined:'2016-07-15' },
  { id:'3', nip:'199005102015011003', name:'Nur Hidayah, S.Ag.', subject:'PAI & Ke-NU-an', phone:'083456789012', status:true, joined:'2018-07-15' },
  { id:'4', nip:'199208252019022004', name:'Bambang Kurniawan, S.Pd.', subject:'Bahasa Indonesia', phone:'084567890123', status:true, joined:'2019-07-15' },
  { id:'5', nip:'199511122021011005', name:'Rina Kartika, S.Pd.', subject:'Bahasa Inggris', phone:'085678901234', status:true, joined:'2021-07-15' },
];

export default function AdminGuruPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fullName:'', nip:'', email:'', subject:'', phone:'' });

  const filtered = TEACHERS.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) || g.nip.includes(search) || g.subject.toLowerCase().includes(search.toLowerCase())
  );

  const update = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Data Guru &amp; Tendik</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{TEACHERS.length} tenaga pendidik terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">
            <Download className="w-4 h-4 text-emerald-700" /> Export Data
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
            <Plus className="w-4 h-4" /> Tambah Guru Baru
          </button>
        </div>
      </div>

      {/* Modal Form Tambah Guru */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Tambah Guru / Tendik Baru</h2>
                <p className="text-[11px] font-semibold text-slate-500">Lengkapi identitas tenaga pendidik</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label:'NIP / NUPTK *', key:'nip', type:'text', placeholder:'Nomor Induk Pegawai' },
                  { label:'Email Resmi *', key:'email', type:'email', placeholder:'email@sekolah.sch.id' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={(formData as Record<string,string>)[f.key]}
                      onChange={e => update(f.key, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Nama Lengkap &amp; Gelar *</label>
                <input type="text" placeholder="cth: Siti Rahayu, S.Pd." value={formData.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Mata Pelajaran Utama *</label>
                <input type="text" placeholder="cth: Matematika / IPA / Bahasa Indonesia" value={formData.subject}
                  onChange={e => update('subject', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">No. HP / WhatsApp</label>
                <input type="tel" placeholder="08xxxxxxxxxx" value={formData.phone}
                  onChange={e => update('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs font-semibold text-emerald-950">
                Password default: <span className="font-mono font-extrabold text-emerald-700">Guru@123456!</span>. Guru dapat memperbarui password setelah login pertama.
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">
                Batal
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs">
                Simpan Data Guru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-emerald-100 bg-emerald-50/30">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input type="search" placeholder="Cari nama guru, NIP, atau mata pelajaran..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/20">
                {['NIP','Nama Guru','Mata Pelajaran','No. HP','Status','Aksi'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-extrabold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filtered.map(g => (
                <tr key={g.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono font-bold text-slate-600">{g.nip}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-2xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">{g.subject}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 font-semibold font-mono">{g.phone}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${g.status ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {g.status ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
