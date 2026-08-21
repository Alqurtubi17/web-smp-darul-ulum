'use client';
import { useState } from 'react';
import { Wallet, CheckCircle, AlertCircle, Download, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const PAYMENTS = [
  {id:'1',month:'Juli 2025',amount:350000,status:'PENDING',due:'2025-07-10',type:'SPP'},
  {id:'2',month:'Juni 2025',amount:350000,status:'PAID',paid:'2025-06-08',receipt:'RC-2025-06-001',type:'SPP'},
  {id:'3',month:'Mei 2025',amount:350000,status:'PAID',paid:'2025-05-05',receipt:'RC-2025-05-001',type:'SPP'},
  {id:'4',month:'April 2025',amount:350000,status:'PAID',paid:'2025-04-07',receipt:'RC-2025-04-001',type:'SPP'},
  {id:'5',month:'Kegiatan Ekskul 2025',amount:150000,status:'PAID',paid:'2025-06-01',receipt:'RC-KEG-001',type:'KEGIATAN'},
];
const pending = PAYMENTS.filter(p=>p.status==='PENDING');
const paid = PAYMENTS.filter(p=>p.status==='PAID');
const totalPaid = paid.reduce((a,b)=>a+b.amount,0);

export default function OrtuPembayaranPage() {
  const [showQRIS, setShowQRIS] = useState<string|null>(null);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pembayaran</h1>
        <p className="text-sm text-gray-500 mt-0.5">Riwayat dan tagihan pembayaran sekolah</p>
      </div>
      {/* QRIS Modal */}
      {showQRIS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Bayar via QRIS</h2>
              <button onClick={() => setShowQRIS(null)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <div className="grid grid-cols-8 gap-0.5 w-36 h-36">
                  {Array.from({length:64},(_,i) => (
                    <div key={i} className={`rounded-sm ${Math.sin(i*2.1+0.5)>0.2?'bg-gray-900':'bg-white'}`}/>
                  ))}
                </div>
              </div>
              <p className="font-bold text-2xl text-green-600 mb-1">{formatCurrency(350000)}</p>
              <p className="text-sm text-gray-500 mb-1">SPP {showQRIS}</p>
              <p className="text-xs text-gray-400 mb-4">Scan dengan aplikasi e-wallet atau m-banking</p>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                Setelah pembayaran, status akan diperbarui otomatis dalam 1×24 jam.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Pending alerts */}
      {pending.map(p => (
        <div key={p.id} className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">Tagihan {p.type} {p.month} belum dibayar</p>
            <p className="text-xs text-yellow-600 mt-0.5">
              {formatCurrency(p.amount)} · Jatuh tempo: {formatDate((p as {due?:string}).due||'', {day:'numeric',month:'long',year:'numeric'})}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setShowQRIS(p.month)}
              className="flex items-center gap-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-medium">
              <CreditCard className="w-3 h-3"/> QRIS
            </button>
          </div>
        </div>
      ))}
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Total Tagihan',value:formatCurrency(PAYMENTS.reduce((a,b)=>a+b.amount,0)),color:'text-gray-900'},
          {label:'Sudah Dibayar',value:formatCurrency(totalPaid),color:'text-green-600'},
          {label:'Belum Dibayar',value:formatCurrency(pending.reduce((a,b)=>a+b.amount,0)),color:'text-yellow-600'},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
          <Wallet className="w-4 h-4 text-green-600"/>
          <h2 className="font-semibold text-gray-900 text-sm">Riwayat Pembayaran</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {PAYMENTS.map(p => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${p.status==='PAID'?'bg-green-100':'bg-yellow-100'}`}>
                {p.status==='PAID'?<CheckCircle className="w-4 h-4 text-green-600"/>:<AlertCircle className="w-4 h-4 text-yellow-600"/>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{p.type} — {p.month}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p.status==='PAID'?`Dibayar: ${formatDate((p as {paid?:string}).paid||'',{day:'numeric',month:'short',year:'numeric'})}`:
                  `Jatuh tempo: ${formatDate((p as {due?:string}).due||'',{day:'numeric',month:'short',year:'numeric'})}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</p>
                <span className={`text-xs ${p.status==='PAID'?'text-green-600':'text-yellow-600'}`}>
                  {p.status==='PAID'?'Lunas':'Belum Bayar'}
                </span>
              </div>
              {p.status==='PAID' && (
                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Download bukti">
                  <Download className="w-4 h-4"/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
