'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setErr(data.message || 'Gagal mengirim link reset');
    } catch { setErr('Terjadi kesalahan jaringan'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600"/>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Email Terkirim!</h1>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Link reset password telah dikirim ke <strong>{email}</strong>. Cek inbox (dan folder spam) Anda.
              </p>
              <p className="text-xs text-gray-400 mb-6">Link berlaku selama 1 jam.</p>
              <Link href="/auth/login" className="block w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold text-center transition-colors">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Lupa Password?</h1>
                <p className="text-sm text-gray-500">Masukkan email Anda dan kami akan kirim link reset password.</p>
              </div>

              {err && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {err}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                      placeholder="email@sekolah.sch.id"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors">
                  {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>

              <Link href="/auth/login" className="flex items-center justify-center gap-2 mt-5 text-sm text-gray-500 hover:text-green-600 transition-colors">
                <ArrowLeft className="w-4 h-4"/> Kembali ke Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
