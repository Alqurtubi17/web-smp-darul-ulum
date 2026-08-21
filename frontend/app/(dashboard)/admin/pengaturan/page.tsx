'use client';
import { useState } from 'react';
import { Save, School, Phone, Mail, Globe, Bell, Shield, Palette } from 'lucide-react';

const TABS = [
  {id:'sekolah',label:'Profil Sekolah',icon:<School className="w-4 h-4"/>},
  {id:'kontak',label:'Kontak',icon:<Phone className="w-4 h-4"/>},
  {id:'ppdb',label:'Pengaturan PPDB',icon:<Globe className="w-4 h-4"/>},
  {id:'notifikasi',label:'Notifikasi',icon:<Bell className="w-4 h-4"/>},
  {id:'keamanan',label:'Keamanan',icon:<Shield className="w-4 h-4"/>},
];

export default function AdminPengaturanPage() {
  const [tab, setTab] = useState('sekolah');
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    school_name:'SMP Darul Ulum Surabaya',
    school_npsn:'20000001',
    school_address:'Jl. Raya Darul Ulum No. 1, Surabaya',
    school_phone:'031-XXXXXXX',
    school_email:'info@smpdarul ulum.sch.id',
    school_wa:'6281234567890',
    school_instagram:'smpdarul ulum_sby',
    school_facebook:'smpdarul ulumsurabaya',
    ppdb_open:'true',
    ppdb_year:'2025/2026',
    ppdb_quota:'300',
    ppdb_start:'2025-06-01',
    ppdb_end:'2025-07-31',
    email_notif:'true',
    wa_notif:'false',
    push_notif:'false',
  });

  const update = (k: string, v: string) => setSettings(p => ({...p,[k]:v}));
  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Konfigurasi website sekolah</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
          <Save className="w-4 h-4"/>
          {saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors text-left ${
                  tab === t.id ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6">
          {tab === 'sekolah' && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 mb-4">Profil Sekolah</h2>
              {[
                {label:'Nama Sekolah',key:'school_name'},{label:'NPSN',key:'school_npsn'},
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                  <input type="text" value={(settings as Record<string,string>)[f.key]} onChange={e => update(f.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Alamat</label>
                <textarea rows={3} value={settings.school_address} onChange={e => update('school_address', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"/>
              </div>
            </div>
          )}

          {tab === 'kontak' && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 mb-4">Informasi Kontak</h2>
              {[
                {label:'Telepon',key:'school_phone'},{label:'Email',key:'school_email'},
                {label:'WhatsApp (format: 628xxx)',key:'school_wa'},{label:'Instagram',key:'school_instagram'},
                {label:'Facebook',key:'school_facebook'},
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                  <input type="text" value={(settings as Record<string,string>)[f.key]} onChange={e => update(f.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
                </div>
              ))}
            </div>
          )}

          {tab === 'ppdb' && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 mb-4">Pengaturan PPDB</h2>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={settings.ppdb_open==='true'} onChange={e => update('ppdb_open', e.target.checked?'true':'false')}
                  className="w-4 h-4 rounded text-green-600"/>
                <div>
                  <p className="text-sm font-medium text-gray-900">PPDB Dibuka</p>
                  <p className="text-xs text-gray-400">Formulir pendaftaran dapat diakses publik</p>
                </div>
              </label>
              {[
                {label:'Tahun Ajaran PPDB',key:'ppdb_year'},{label:'Kuota Siswa',key:'ppdb_quota'},
                {label:'Tanggal Mulai',key:'ppdb_start',type:'date'},{label:'Tanggal Selesai',key:'ppdb_end',type:'date'},
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                  <input type={(f as {type?:string}).type||'text'} value={(settings as Record<string,string>)[f.key]} onChange={e => update(f.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
                </div>
              ))}
            </div>
          )}

          {tab === 'notifikasi' && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">Pengaturan Notifikasi</h2>
              {[
                {key:'email_notif',label:'Notifikasi Email',desc:'Kirim notifikasi via email ke siswa, guru, dan orang tua'},
                {key:'wa_notif',label:'Notifikasi WhatsApp',desc:'Kirim pesan WhatsApp otomatis (memerlukan token Fonnte)'},
                {key:'push_notif',label:'Push Notification',desc:'Notifikasi browser untuk pengguna yang login'},
              ].map(n => (
                <label key={n.key} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={(settings as Record<string,string>)[n.key]==='true'} onChange={e => update(n.key, e.target.checked?'true':'false')}
                    className="w-4 h-4 rounded text-green-600"/>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{n.label}</p>
                    <p className="text-xs text-gray-400">{n.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {tab === 'keamanan' && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">Keamanan & Akses</h2>
              <div className="space-y-3">
                {[
                  {label:'Rate Limiting',desc:'Batasi 100 request per 15 menit per IP',active:true},
                  {label:'JWT Authentication',desc:'Token kadaluarsa dalam 15 menit',active:true},
                  {label:'HTTPS Enforced',desc:'Redirect semua HTTP ke HTTPS',active:true},
                  {label:'Two-Factor Authentication',desc:'Verifikasi dua langkah untuk admin',active:false},
                  {label:'IP Whitelist Admin',desc:'Batasi akses admin dari IP tertentu',active:false},
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200">
                    <div className={`w-2 h-2 rounded-full ${s.active?'bg-green-500':'bg-gray-300'}`}/>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{s.label}</p>
                      <p className="text-xs text-gray-400">{s.desc}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.active?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                      {s.active?'Aktif':'Nonaktif'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
