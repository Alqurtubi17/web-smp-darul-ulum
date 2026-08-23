'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ChevronRight, Upload, AlertCircle, Search, Calendar, Users, FileText, CheckCircle2 } from 'lucide-react';
import { useSubmitAdmission, useAdmissionStatus } from '@/hooks/useApi';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { n: 1, label: 'Data Calon Siswa' },
  { n: 2, label: 'Data Orang Tua' },
  { n: 3, label: 'Upload Berkas' },
  { n: 4, label: 'Konfirmasi' },
];

const REQUIREMENTS = [
  'Fotokopi Ijazah SD/MI (legalisir)',
  'Fotokopi SKHUN / Surat Keterangan Lulus',
  'Fotokopi Akta Kelahiran',
  'Fotokopi Kartu Keluarga (KK)',
  'Pas foto 3×4 (2 lembar)',
];

import { PageHero } from '@/components/public/PageHero';
import { GraduationCap } from 'lucide-react';

export default function PPDBPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'daftar' | 'cek'>('info');
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState<{ registrationNumber: string } | null>(null);
  const [checkNumber, setCheckNumber] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const submitMutation = useSubmitAdmission();
  const { data: statusData, refetch: checkStatus, isLoading: checking } = useAdmissionStatus(checkNumber);

  const update = (k: string, v: string) => {
    setFormError('');
    setFormData((p) => ({ ...p, [k]: v }));
  };

  const handleNextStep = () => {
    setFormError('');
    if (step === 1) {
      if (!formData.fullName?.trim()) {
        setFormError('Nama Lengkap calon siswa wajib diisi');
        return;
      }
      if (!formData.birthPlace?.trim()) {
        setFormError('Tempat Lahir calon siswa wajib diisi');
        return;
      }
      if (!formData.birthDate?.trim()) {
        setFormError('Tanggal Lahir calon siswa wajib diisi');
        return;
      }
      if (!formData.address?.trim()) {
        setFormError('Alamat Lengkap wajib diisi');
        return;
      }
    } else if (step === 2) {
      if (!formData.parentName?.trim()) {
        setFormError('Nama Orang Tua / Wali wajib diisi');
        return;
      }
      if (!formData.parentPhone?.trim()) {
        setFormError('No. HP Orang Tua wajib diisi');
        return;
      }
    }
    setStep((s) => (s + 1) as Step);
  };

  const handleSubmit = async () => {
    try {
      const result = await submitMutation.mutateAsync({
        ...formData,
        gender: formData.gender || 'LAKI_LAKI',
        birthDate: formData.birthDate || new Date().toISOString(),
      });
      setSubmitted(result);
    } catch (e) {
      console.error(e);
      setFormError('Gagal mengirim pendaftaran, pastikan koneksi internet stabil.');
    }
  };

  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      
      {/* Header Banner - Rich PageHero */}
      <PageHero
        title="PPDB SMP Darul Ulum Surabaya"
        subtitle="Alamat lokasi, nomor telepon sekretariat, dan formulir pendaftaran siswa baru."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'PPDB' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation Tabs */}
        <div className="flex border border-emerald-200 rounded-2xl p-1 bg-emerald-50/60 mb-8 w-fit mx-auto">
          {[
            { key: 'info', label: 'Info Pendaftaran' },
            { key: 'daftar', label: 'Formulir Online' },
            { key: 'cek', label: 'Cek Status PPDB' },
          ].map((t) => (
            <button key={t.key}
              onClick={() => setActiveTab(t.key as typeof activeTab)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-800'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── INFO TAB ─── */}
        {activeTab === 'info' && (
          <div id="info" className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs">
                <h2 className="font-extrabold text-base text-slate-900 mb-4 border-b border-emerald-100 pb-2">
                  Jadwal Kegiatan PPDB
                </h2>
                <div className="space-y-3">
                  {[
                    { phase: 'Pendaftaran Online', date: '1 Juni – 31 Juli 2025' },
                    { phase: 'Verifikasi Berkas', date: '1 – 3 Agustus 2025' },
                    { phase: 'Tes / Seleksi', date: '4 Agustus 2025' },
                    { phase: 'Pengumuman Hasil', date: '5 Agustus 2025' },
                    { phase: 'Daftar Ulang', date: '6 – 10 Agustus 2025' },
                  ].map((item) => (
                    <div key={item.phase} className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
                      <span className="font-bold text-slate-800">{item.phase}</span>
                      <span className="text-xs text-slate-500 font-medium">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs">
                <h2 className="font-extrabold text-base text-slate-900 mb-4 border-b border-emerald-100 pb-2">
                  Persyaratan Berkas
                </h2>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {REQUIREMENTS.map((r, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs">
                <h2 className="font-extrabold text-base text-slate-900 mb-4 border-b border-emerald-100 pb-2">
                  Jalur Pendaftaran
                </h2>
                <div className="space-y-3">
                  {[
                    { name: 'Jalur Reguler', desc: 'Nilai Rapor SD/MI Kelas 4–6' },
                    { name: 'Jalur Prestasi', desc: 'Prestasi Akademik / Non-Akademik' },
                    { name: 'Jalur Tahfidz', desc: 'Hafalan Al-Qur’an Minimal 1 Juz' },
                  ].map((j) => (
                    <div key={j.name} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                      <p className="font-bold text-sm text-emerald-950">{j.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">{j.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-emerald-200 p-6 text-center shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Sekretariat PPDB</h3>
                <p className="text-xs text-slate-600 mb-4 font-medium">Jl. Raya Manukan Kulon No. 98-100, Tandes, Surabaya. Telp: (031) 7417749</p>
                <button onClick={() => setActiveTab('daftar')}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2">
                  Pengisian Formulir Online <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── DAFTAR TAB ─── */}
        {activeTab === 'daftar' && (
          <div className="max-w-2xl mx-auto">
            {submitted ? (
              <div className="text-center bg-white rounded-3xl border border-emerald-100 p-10 shadow-xs">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Pendaftaran Berhasil</h2>
                <p className="text-slate-500 text-sm mb-6 font-medium">Nomor pendaftaran Anda telah dibuat:</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
                  <p className="text-2xl font-extrabold text-emerald-950 font-mono">
                    {submitted.registrationNumber}
                  </p>
                </div>
                <button onClick={() => setActiveTab('cek')}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all">
                  Cek Status Pendaftaran
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs">
                {/* Step indicator */}
                <div className="flex border-b border-emerald-100">
                  {STEPS.map((s) => (
                    <div key={s.n} className={`flex-1 py-4 text-center border-b-2 transition-all ${
                      step === s.n ? 'border-emerald-600 text-emerald-950 font-bold' :
                      step > s.n ? 'border-emerald-300 text-emerald-700 font-semibold' : 'border-transparent text-slate-400'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1 ${
                        step > s.n ? 'bg-emerald-600 text-white' : step === s.n ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {step > s.n ? '✓' : s.n}
                      </div>
                      <p className="text-xs hidden sm:block font-semibold">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 space-y-4">
                  {formError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {step === 1 && (
                    <>
                      <h3 className="font-bold text-slate-900 text-sm">Data Calon Siswa</h3>
                      {[
                        { label: 'Nama Lengkap *', key: 'fullName', type: 'text', placeholder: 'Nama calon siswa' },
                        { label: 'Tempat Lahir *', key: 'birthPlace', type: 'text', placeholder: 'Kota tempat lahir' },
                        { label: 'Tanggal Lahir *', key: 'birthDate', type: 'date', placeholder: '' },
                        { label: 'Alamat Lengkap *', key: 'address', type: 'textarea', placeholder: 'Alamat tempat tinggal' },
                        { label: 'No. Telepon / WA', key: 'phone', type: 'tel', placeholder: '08xxxxxxxxxx' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{field.label}</label>
                          {field.type === 'textarea' ? (
                            <textarea rows={3} placeholder={field.placeholder} value={formData[field.key] || ''}
                              onChange={(e) => update(field.key, e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none font-medium" />
                          ) : (
                            <input type={field.type} placeholder={field.placeholder} value={formData[field.key] || ''}
                              onChange={(e) => update(field.key, e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium" />
                          )}
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
                        <div className="flex gap-4">
                          {[{ v: 'LAKI_LAKI', l: 'Laki-laki' }, { v: 'PEREMPUAN', l: 'Perempuan' }].map((g) => (
                            <label key={g.v} className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                              <input type="radio" name="gender" value={g.v}
                                checked={formData.gender === g.v}
                                onChange={() => update('gender', g.v)}
                                className="text-emerald-600" />
                              <span>{g.l}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h3 className="font-bold text-slate-900 text-sm">Data Orang Tua / Wali</h3>
                      {[
                        { label: 'Nama Orang Tua / Wali *', key: 'parentName', type: 'text', placeholder: 'Nama orang tua/wali' },
                        { label: 'No. HP Orang Tua *', key: 'parentPhone', type: 'tel', placeholder: '08xxxxxxxxxx' },
                        { label: 'Email Orang Tua', key: 'parentEmail', type: 'email', placeholder: 'email@contoh.com' },
                        { label: 'Asal Sekolah SD/MI', key: 'previousSchool', type: 'text', placeholder: 'Nama SD/MI asal' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{field.label}</label>
                          <input type={field.type} placeholder={field.placeholder} value={formData[field.key] || ''}
                            onChange={(e) => update(field.key, e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium" />
                        </div>
                      ))}
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h3 className="font-bold text-slate-900 text-sm">Upload Berkas Persyaratan</h3>
                      {[
                        { label: 'Foto 3×4 *', key: 'photoUrl' },
                        { label: 'Ijazah / Surat Keterangan Lulus SD/MI *', key: 'ijazahUrl' },
                        { label: 'Akta Kelahiran *', key: 'aktaUrl' },
                        { label: 'Kartu Keluarga *', key: 'kkUrl' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{field.label}</label>
                          <div className="border border-dashed border-emerald-300 rounded-xl p-4 text-center hover:bg-emerald-50/50 transition-colors cursor-pointer bg-slate-50">
                            <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                            <p className="text-xs text-slate-500 font-medium">Pilih file berkas (JPG/PDF max 5MB)</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {step === 4 && (
                    <>
                      <h3 className="font-bold text-slate-900 text-sm">Konfirmasi Pendaftaran</h3>
                      <div className="bg-emerald-50/60 rounded-xl p-5 space-y-2.5 text-sm">
                        {[
                          { label: 'Nama Calon Siswa', value: formData.fullName || '-' },
                          { label: 'Tempat, Tgl Lahir', value: `${formData.birthPlace || '-'}, ${formData.birthDate || '-'}` },
                          { label: 'Jenis Kelamin', value: formData.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan' },
                          { label: 'Nama Orang Tua', value: formData.parentName || '-' },
                          { label: 'No. HP Orang Tua', value: formData.parentPhone || '-' },
                          { label: 'Asal Sekolah', value: formData.previousSchool || '-' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between border-b border-emerald-100 pb-1.5">
                            <span className="text-slate-500 font-medium">{label}</span>
                            <span className="font-bold text-slate-900 text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  {step > 1 && (
                    <button onClick={() => { setFormError(''); setStep((s) => (s - 1) as Step); }}
                      className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
                      Kembali
                    </button>
                  )}
                  {step < 4 ? (
                    <button onClick={handleNextStep}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors">
                      Lanjut
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={submitMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm transition-colors">
                      {submitMutation.isPending ? 'Mengirim...' : 'Kirim Pendaftaran'}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ─── CEK STATUS TAB ─── */}
        {activeTab === 'cek' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs">
              <h2 className="font-bold text-base text-slate-900 mb-2">Cek Status Pendaftaran</h2>
              <p className="text-xs text-slate-500 mb-5 font-medium">
                Masukkan nomor pendaftaran PPDB Anda (contoh: PDG-2025-00001)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="PDG-2025-00001"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
                <button onClick={() => checkStatus()} disabled={!checkNumber || checking}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold text-sm transition-colors flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  {checking ? '...' : 'Cek'}
                </button>
              </div>

              {statusData && (
                <div className="mt-5 border-t border-emerald-100 pt-5 space-y-2 text-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-900">Status Pendaftaran:</span>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {(statusData as { status?: string }).status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
