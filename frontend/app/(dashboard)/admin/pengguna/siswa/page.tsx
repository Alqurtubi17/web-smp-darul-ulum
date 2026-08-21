'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Download, ChevronDown, X } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

const STUDENTS = [
  { id:'1', nis:'2024001', name:'Ahmad Rizki Pratama', gender:'L', class:'7A', phone:'081234567890', status:true, enrolled:'2024-07-15' },
  { id:'2', nis:'2024002', name:'Siti Nurhaliza',      gender:'P', class:'7A', phone:'082345678901', status:true, enrolled:'2024-07-15' },
  { id:'3', nis:'2024003', name:'Budi Permana',         gender:'L', class:'7B', phone:'-',           status:true, enrolled:'2024-07-15' },
  { id:'4', nis:'2023001', name:'Dewi Anggraini',       gender:'P', class:'8A', phone:'083456789012', status:true, enrolled:'2023-07-17' },
  { id:'5', nis:'2022001', name:'Reza Firmansyah',      gender:'L', class:'9A', phone:'084567890123', status:true, enrolled:'2022-07-18' },
  { id:'6', nis:'2024004', name:'Fatimah Az-Zahra',    gender:'P', class:'7C', phone:'-',           status:false,enrolled:'2024-07-15' },
  { id:'7', nis:'2024005', name:'Galih Permadi',       gender:'L', class:'7A', phone:'085678901234', status:true, enrolled:'2024-07-15' },
  { id:'8', nis:'2024006', name:'Hani Ramadhani',      gender:'P', class:'7B', phone:'086789012345', status:true, enrolled:'2024-07-15' },
  { id:'9', nis:'2023002', name:'Indra Kusuma',        gender:'L', class:'8B', phone:'087890123456', status:true, enrolled:'2023-07-17' },
  { id:'10',nis:'2022002', name:'Jasmine Putri',       gender:'P', class:'9B', phone:'088901234567', status:true, enrolled:'2022-07-18' },
  { id:'11',nis:'2024007', name:'Kafi Maulana',        gender:'L', class:'7C', phone:'089012345678', status:true, enrolled:'2024-07-15' },
  { id:'12',nis:'2023003', name:'Larasati Utami',      gender:'P', class:'8A', phone:'081123456789', status:true, enrolled:'2023-07-17' },
];

const CLASSES = ['Semua','7A','7B','7C','8A','8B','8C','9A','9B','9C'];
const ITEMS_PER_PAGE = 5;

export default function AdminSiswaPage() {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fullName:'', nis:'', email:'', gender:'LAKI_LAKI', classId:'', birthPlace:'', birthDate:'', address:'', phone:'' });

  const filtered = STUDENTS.filter(s =>
    (classFilter === 'Semua' || s.class === classFilter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search))
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const update = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Data Siswa</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{STUDENTS.length} peserta didik terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">
            <Download className="w-4 h-4 text-emerald-700" /> Export Data
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
            <Plus className="w-4 h-4" /> Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* Modal Form Tambah Siswa */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Tambah Siswa Baru</h2>
                <p className="text-[11px] font-semibold text-slate-500">Lengkapi identitas peserta didik baru</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label:'NIS *', key:'nis', type:'text', placeholder:'Nomor Induk Siswa' },
                  { label:'Email *', key:'email', type:'email', placeholder:'email@siswa.sch.id' },
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
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Nama Lengkap *</label>
                <input type="text" placeholder="Nama lengkap sesuai akta kelahiran" value={formData.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Jenis Kelamin *</label>
                  <select value={formData.gender} onChange={e => update('gender', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Rombel Kelas</label>
                  <select value={formData.classId} onChange={e => update('classId', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
                    <option value="">Pilih Kelas</option>
                    {CLASSES.filter(c => c !== 'Semua').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label:'Tempat Lahir', key:'birthPlace', type:'text', placeholder:'Kota Kelahiran' },
                  { label:'Tanggal Lahir', key:'birthDate', type:'date', placeholder:'' },
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
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">No. HP / WhatsApp</label>
                <input type="tel" placeholder="08xxxxxxxxxx" value={formData.phone}
                  onChange={e => update('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs font-semibold text-emerald-950">
                Password default: <span className="font-mono font-extrabold text-emerald-700">Siswa@{formData.nis || '[NIS]'}</span>. Siswa dapat memperbarui password setelah login pertama.
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">
                Batal
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs">
                Simpan Data Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-emerald-100 bg-emerald-50/30 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input type="search" placeholder="Cari nama atau NIS siswa..." value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
          </div>
          <div className="relative">
            <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setCurrentPage(1); }}
              className="pl-4 pr-9 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/20">
                {['NIS','Nama Siswa','L/P','Kelas','No. HP','Status','Aksi'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-extrabold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {paginated.map(s => (
                <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono font-bold text-slate-600">{s.nis}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-2xs">
                        {s.name[0]}
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600 font-bold">{s.gender === 'L' ? '👦 L' : '👧 P'}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">{s.class}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 font-semibold font-mono">{s.phone}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${s.status ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {s.status ? 'Aktif' : 'Non-aktif'}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  );
}
