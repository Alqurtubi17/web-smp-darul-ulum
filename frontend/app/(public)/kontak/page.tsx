'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle, Globe } from 'lucide-react';

const contactInfo = [
  {
    icon: <MapPin className="w-5 h-5" />,
    label: 'Alamat Sekolah',
    value: 'Jl. Raya Manukan Kulon No. 98-100, Tandes, Surabaya 60185',
    href: 'https://maps.google.com/maps?q=-7.256,112.6649&hl=id'
  },
  {
    icon: <Phone className="w-5 h-5" />,
    label: 'Telepon',
    value: '(031) 7417749',
    href: 'tel:0317417749'
  },
  {
    icon: <Globe className="w-5 h-5" />,
    label: 'Website Resmi',
    value: 'sites.google.com/view/smpdarululum/home',
    href: 'https://sites.google.com/view/smpdarululum/home'
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: 'Jam Kerja Sekretariat',
    value: 'Senin–Jumat: 07.00–15.00 WIB\nSabtu: 07.00–12.00 WIB',
    href: null
  },
];

const SUBJECTS = ['Informasi PPDB', 'Informasi Akademik', 'Surat & Administrasi', 'Lainnya'];

import { PageHero } from '@/components/public/PageHero';

export default function KontakPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setError(data.message || 'Gagal mengirim pesan');
      }
    } catch {
      setError('Terjadi kesalahan jaringan, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      
      {/* Header Hero */}
      <PageHero
        title="Kontak SMP Darul Ulum Surabaya"
        subtitle="Alamat lokasi, nomor telepon sekretariat, dan formulir pengiriman pesan."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Kontak' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-10">
          
          {/* Informasi Kontak */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Sekretariat Sekolah</h2>
            
            {contactInfo.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-emerald-100 flex gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors whitespace-pre-line leading-relaxed">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 whitespace-pre-line leading-relaxed">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form & Map */}
          <div className="lg:col-span-3 space-y-6">
            {sent ? (
              <div className="bg-white rounded-3xl border border-emerald-100 p-8 text-center shadow-xs">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Pesan Berhasil Terkirim</h3>
                <p className="text-slate-500 text-sm mb-6 font-medium">
                  Terima kasih. Pesan Anda telah diterima oleh pihak sekolah.
                </p>
                <button onClick={() => setSent(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-emerald-100 p-7 space-y-4 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-2">Formulir Pesan</h2>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-bold">
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                      placeholder="Nama Pengirim"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                    <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">No. Telepon / WA</label>
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Perihal *</label>
                    <select required value={form.subject} onChange={e => update('subject', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600">
                      <option value="">Pilih Perihal</option>
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan *</label>
                  <textarea rows={4} required value={form.message} onChange={e => update('message', e.target.value)}
                    placeholder="Tuliskan isi pesan Anda..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs">
                  <Send className="w-4 h-4" />
                  {loading ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </form>
            )}

            {/* Peta Lokasi */}
            <div className="bg-white rounded-3xl border border-emerald-100 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Peta Lokasi Sekolah
                </span>
                <a href="https://maps.google.com/maps?q=-7.256,112.6649&hl=id" target="_blank" rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:underline">
                  Buka di Google Maps
                </a>

              </div>
              <div className="h-60 rounded-2xl overflow-hidden border border-emerald-100">
                <iframe
                  title="Lokasi SMP Darul Ulum Surabaya"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.940656094628!2d112.6649!3d-7.256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7f3b890f5b9d3%3A0x6b4f74d6c29a8a7!2sJl.+Raya+Manukan+Kulon+No.98-100%2C+Manukan+Kulon%2C+Kec.+Tandes%2C+Surabaya%2C+Jawa+Timur+60185!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
