'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword.length < 8) { setErr('Password minimal 8 karakter'); return; }
    if (form.newPassword !== form.confirm) { setErr('Password tidak cocok'); return; }
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (data.success) { setDone(true); setTimeout(() => router.push('/auth/login'), 3000); }
      else setErr(data.message || 'Gagal reset password');
    } catch { setErr('Terjadi kesalahan'); }
    finally { setLoading(false); }
  };

  if (!token) return (
    <div className="text-center">
      <p className="text-red-600 mb-4">Token tidak valid.</p>
      <Link href="/auth/forgot-password" className="text-green-600 hover:underline text-sm">Minta link baru →</Link>
    </div>
  );

  if (done) return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600"/>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Password Berhasil Diubah!</h2>
      <p className="text-sm text-gray-500 mb-4">Anda akan diarahkan ke halaman login...</p>
      <Link href="/auth/login" className="text-green-600 hover:underline text-sm">Login sekarang →</Link>
    </div>
  );

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h1>
      <p className="text-sm text-gray-500 mb-6">Masukkan password baru Anda.</p>
      {err && <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{err}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {(['newPassword','confirm'] as const).map((k, i) => (
          <div key={k}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {i === 0 ? 'Password Baru' : 'Konfirmasi Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input type={show ? 'text' : 'password'} required minLength={8}
                value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                placeholder="Minimal 8 karakter"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
              {i === 0 && (
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm">
          {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
          {loading ? 'Memproses...' : 'Ubah Password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-green-600"/></div>}>
            <ResetForm/>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
