'use client';
import { useState } from 'react';
import { Wallet, Plus, Download, Search, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const BILLS = [
  {id:'1',student:'Ahmad Rizki Pratama',class:'7A',type:'SPP',month:'Juli 2025',amount:350000,status:'PENDING',due:'2025-07-10'},
  {id:'2',student:'Siti Nurhaliza',class:'7A',type:'SPP',month:'Juli 2025',amount:350000,status:'PAID',paid:'2025-07-03'},
  {id:'3',student:'Budi Permana',class:'7B',type:'SPP',month:'Juli 2025',amount:350000,status:'PENDING',due:'2025-07-10'},
  {id:'4',student:'Dewi Anggraini',class:'8A',type:'SPP',month:'Juli 2025',amount:350000,status:'PAID',paid:'2025-07-05'},
  {id:'5',student:'Reza Firmansyah',class:'9A',type:'SPP',month:'Juli 2025',amount:350000,status:'PENDING',due:'2025-07-10'},
];

const total = BILLS.reduce((a,b)=>a+b.amount,0);
const paid = BILLS.filter(b=>b.status==='PAID').reduce((a,b)=>a+b.amount,0);
const pending = BILLS.filter(b=>b.status==='PENDING').reduce((a,b)=>a+b.amount,0);

export default function AdminKeuanganPage() {
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState('SEMUA');
  const filtered = BILLS.filter(b =>
    (filter==='SEMUA'||b.status===filter) &&
    (b.student.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Keuangan Sekolah</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manajemen SPP dan pembayaran</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4"/> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold">
            <Plus className="w-4 h-4"/> Buat Tagihan SPP
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Total Tagihan',value:formatCurrency(total),icon:<Wallet className="w-5 h-5"/>,color:'bg-gray-900 text-white'},
          {label:'Sudah Dibayar',value:formatCurrency(paid),icon:<CheckCircle className="w-5 h-5"/>,color:'bg-green-500 text-white'},
          {label:'Belum Dibayar',value:formatCurrency(pending),icon:<AlertCircle className="w-5 h-5"/>,color:'bg-yellow-500 text-white'},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{BILLS.filter(b=>s.label.includes('Sudah')?b.status==='PAID':s.label.includes('Belum')?b.status==='PENDING':true).length} tagihan</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress Pembayaran SPP Juli 2025</span>
          <span className="text-sm font-bold text-green-600">{Math.round((paid/total)*100)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{width:`${(paid/total)*100}%`}}/>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">{formatCurrency(paid)} terkumpul</span>
          <span className="text-xs text-gray-400">Target: {formatCurrency(total)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input type="search" placeholder="Cari nama siswa..." value={search} onChange={e=>setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
          </div>
          <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
            {['SEMUA','PAID','PENDING'].map(f => (
              <button key={f} onClick={()=>setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===f?'bg-white text-green-700 shadow-sm':'text-gray-500'}`}>
                {f==='SEMUA'?'Semua':f==='PAID'?'Lunas':'Belum Bayar'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Siswa','Kelas','Tagihan','Jumlah','Jatuh Tempo','Status','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{b.student}</td>
                  <td className="px-4 py-3.5"><span className="text-xs font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{b.class}</span></td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{b.type} — {b.month}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{formatCurrency(b.amount)}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    {b.status==='PAID'?formatDate((b as {paid?:string}).paid||'',{day:'numeric',month:'short'}):formatDate((b as {due?:string}).due||'',{day:'numeric',month:'short'})}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${b.status==='PAID'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                      {b.status==='PAID'?'✓ Lunas':'⚠ Belum Bayar'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {b.status==='PENDING' && (
                      <button className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg">
                        <CreditCard className="w-3 h-3"/> Konfirmasi
                      </button>
                    )}
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
