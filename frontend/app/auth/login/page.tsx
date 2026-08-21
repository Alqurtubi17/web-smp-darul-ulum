'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ROLE_REDIRECT: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  ADMIN: '/admin',
  GURU: '/guru',
  SISWA: '/siswa',
  ORANG_TUA: '/ortu',
};

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@smpdarululum.sch.id', pass: 'Admin@123456!' },
  { role: 'Guru', email: 'siti.rahayu@smpdarululum.sch.id', pass: 'Guru@123456!' },
  { role: 'Siswa', email: 'ahmad.rizki@siswa.smpdarululum.sch.id', pass: 'Siswa@2024001' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/session');
      const session = await res.json();
      const role = (session?.user as any)?.role;
      const redirect = ROLE_REDIRECT[role] || '/';
      router.push(redirect);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan, coba lagi');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="relative w-16 h-16 bg-white border border-emerald-100 rounded-2xl overflow-hidden p-1 shadow-xs">
              <Image src="/logo.png" alt="Logo SMP Darul Ulum" fill sizes="64px" className="object-cover" priority />
            </div>
            <div>
              <p className="text-slate-900 font-extrabold text-xl leading-tight">SMP Darul Ulum</p>
              <p className="text-emerald-700 font-semibold text-xs">Surabaya</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-8">
          <h1 className="text-lg font-extrabold text-slate-900 mb-1">Masuk ke Portal Sekolah</h1>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Masukkan akun email dan password terdaftar
          </p>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@sekolah.sch.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-emerald-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2">
              {loading ? 'Memproses...' : 'Masuk Portal'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-emerald-100">
            <p className="text-xs text-center font-bold text-slate-400 mb-3 uppercase tracking-wider">Akun Uji Coba</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.role} type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
                  className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 hover:border-emerald-300 text-center transition-colors">
                  <p className="text-xs font-bold text-emerald-950">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 font-semibold mt-6">
          <Link href="/" className="hover:text-emerald-700 transition-colors">← Kembali ke Halaman Utama</Link>
        </p>
      </div>
    </div>
  );
}
