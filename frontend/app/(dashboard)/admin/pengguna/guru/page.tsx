'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, GraduationCap, X, UserCheck, Download } from 'lucide-react';
import Image from 'next/image';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';

interface Staff {
  id: string;
  nip: string;
  name: string;
  category: 'Guru' | 'Tendik';
  role: string;
  subject: string;
  phone: string;
  status: boolean;
  joined: string;
  photoUrl?: string;
}

const INITIAL_STAFF: Staff[] = [
  { id:'1', nip:'198501152010011002', name:'Khusnul Khotimah, S.Pd.', category:'Guru', role:'Kepala Sekolah', subject:'Manajemen Sekolah', phone:'081234567890', status:true, joined:'2010-07-15', photoUrl:'' },
  { id:'2', nip:'198803202012022001', name:'Siti Rahayu, S.Pd.', category:'Guru', role:'Waka Akademik', subject:'Matematika', phone:'082345678901', status:true, joined:'2012-07-15', photoUrl:'' },
  { id:'3', nip:'199005102015011003', name:'Ahmad Fauzi, M.Pd.', category:'Guru', role:'Guru Pengajar', subject:'IPA (Fisika & Biologi)', phone:'083456789012', status:true, joined:'2015-07-15', photoUrl:'' },
  { id:'4', nip:'199208252019022004', name:'Nur Hidayah, S.Ag.', category:'Guru', role:'Guru Pengajar', subject:'PAI & Ke-NU-an', phone:'084567890123', status:true, joined:'2019-07-15', photoUrl:'' },
  { id:'5', nip:'199403122020011005', name:'Muhammad Ridwan, S.Kom.', category:'Tendik', role:'Kepala Tata Usaha', subject:'Administrasi & IT', phone:'085678901234', status:true, joined:'2020-07-15', photoUrl:'' },
  { id:'6', nip:'199607182021022006', name:'Siti Maryam, A.Md.', category:'Tendik', role:'Pustakawan Sekolah', subject:'Perpustakaan Digital', phone:'086789012345', status:true, joined:'2021-07-15', photoUrl:'' },
  { id:'7', nip:'199511122021011007', name:'Bambang Kurniawan, S.Pd.', category:'Guru', role:'Guru Pengajar', subject:'Bahasa Indonesia', phone:'087890123456', status:true, joined:'2021-07-15', photoUrl:'' },
  { id:'8', nip:'199709202022011008', name:'Agus Setiawan', category:'Tendik', role:'Staf Keamanan', subject:'Ketertiban & Keamanan', phone:'088901234567', status:true, joined:'2022-07-15', photoUrl:'' },
];

export default function AdminGuruTendikPage() {
  const [staffList, setStaffList] = useState<Staff[]>(INITIAL_STAFF);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'SEMUA' | 'Guru' | 'Tendik'>('SEMUA');
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ fullName:'', nip:'', email:'', category:'Guru' as 'Guru'|'Tendik', role:'Guru Pengajar', subject:'', phone:'', photoUrl:'' });

  const filtered = staffList.filter(s => {
    const matchCat = filterCategory === 'SEMUA' || s.category === filterCategory;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nip.includes(search) || s.subject.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const update = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  const handleOpenForm = (staff?: Staff) => {
    if (staff) {
      setSelectedStaff(staff);
      setFormData({ fullName: staff.name, nip: staff.nip, email: '', category: staff.category, role: staff.role, subject: staff.subject, phone: staff.phone, photoUrl: staff.photoUrl || '' });
    } else {
      setSelectedStaff(null);
      setFormData({ fullName: '', nip: '', email: '', category: 'Guru', role: 'Guru Pengajar', subject: '', phone: '', photoUrl: '' });
    }
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.nip || !formData.subject) return;

    if (selectedStaff) {
      setStaffList(prev => prev.map(t => t.id === selectedStaff.id ? { ...t, name: formData.fullName, nip: formData.nip, category: formData.category, role: formData.role, subject: formData.subject, phone: formData.phone, photoUrl: formData.photoUrl } : t));
    } else {
      const newStaff: Staff = {
        id: Date.now().toString(),
        nip: formData.nip,
        name: formData.fullName,
        category: formData.category,
        role: formData.role,
        subject: formData.subject,
        phone: formData.phone,
        status: true,
        joined: new Date().toISOString().split('T')[0],
        photoUrl: formData.photoUrl,
      };
      setStaffList(prev => [newStaff, ...prev]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setStaffList(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Guru &amp; Tenaga Kependidikan (Tendik)</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{staffList.length} total pendidik &amp; staf sekolah terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">
            <Download className="w-4 h-4 text-emerald-700" /> Export Data
          </button>
          <button onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
            <Plus className="w-4 h-4" /> Tambah Personel
          </button>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Personel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">{selectedStaff ? 'Edit Data Personel' : 'Tambah Guru / Tendik Baru'}</h2>
                <p className="text-[11px] font-semibold text-slate-500">Unggah foto dan isi data tenaga pendidik / staf kependidikan</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* Upload Foto */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-2">Foto Profil Personel</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {formData.photoUrl ? (
                        <Image src={formData.photoUrl} alt="Foto Profil" fill className="object-cover" />
                      ) : (
                        <GraduationCap className="w-8 h-8 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CustomImageUploader
                        endpoint="profilePhoto"
                        label="Unggah Foto Profil"
                        onUploadComplete={(url) => update('photoUrl', url)}
                        className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-400 font-medium mt-1">Format JPG, PNG (Maks 4MB)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Kategori Personel *</label>
                    <select value={formData.category} onChange={e => update('category', e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
                      <option value="Guru">Guru (Tenaga Pendidik)</option>
                      <option value="Tendik">Tendik (Staf Kependidikan)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">NIP / NUPTK *</label>
                    <input type="text" required placeholder="Nomor Induk Pegawai" value={formData.nip}
                      onChange={e => update('nip', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Nama Lengkap &amp; Gelar *</label>
                  <input type="text" required placeholder="cth: Siti Rahayu, S.Pd. / Muhammad Ridwan, S.Kom." value={formData.fullName}
                    onChange={e => update('fullName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Jabatan / Peran *</label>
                    <input type="text" required placeholder="cth: Guru Pengajar / Ka. TU / Pustakawan" value={formData.role}
                      onChange={e => update('role', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Mata Pelajaran / Bidang Tugas *</label>
                    <input type="text" required placeholder="cth: Matematika / Administrasi TU" value={formData.subject}
                      onChange={e => update('subject', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">No. HP / WhatsApp</label>
                  <input type="tel" placeholder="08xxxxxxxxxx" value={formData.phone}
                    onChange={e => update('phone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs">
                  Simpan Personel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-emerald-100 bg-emerald-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input type="search" placeholder="Cari nama, NIP, jabatan, atau mata pelajaran..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {(['SEMUA','Guru','Tendik'] as const).map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${filterCategory === cat ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white border border-emerald-200 text-slate-700 hover:bg-emerald-50'}`}>
                {cat === 'SEMUA' ? 'Semua (' + staffList.length + ')' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/20">
                {['Foto & Nama','Kategori & Peran','NIP','Bidang / Mapel','No. HP','Status','Aksi'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-extrabold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filtered.map(g => (
                <tr key={g.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-black shrink-0 shadow-2xs overflow-hidden">
                        {g.photoUrl ? (
                          <Image src={g.photoUrl} alt={g.name} fill className="object-cover" />
                        ) : (
                          <GraduationCap className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${g.category === 'Guru' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {g.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">{g.role}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono font-bold text-slate-600">{g.nip}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-extrabold text-emerald-900 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">{g.subject}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 font-semibold font-mono">{g.phone}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${g.status ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {g.status ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenForm(g)} className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors" title="Edit & Unggah Foto">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(g.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="Hapus Personel">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
