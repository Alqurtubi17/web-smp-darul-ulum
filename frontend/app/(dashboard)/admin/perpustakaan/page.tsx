'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, BookOpen, ArrowRightLeft, X, Loader2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import apiClient, { getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';

interface Book { id: string; title: string; author: string; isbn: string|null; category: string|null; stock: number; available: number; cover: string|null; }
interface Borrowing { id: string; book: { title: string; author: string }; student: { fullName: string; nis: string; class: { name: string } }; borrowedAt: string; dueDate: string; returnedAt: string|null; status: string; fine: number; }

const DEF_BOOK = { title:'', author:'', isbn:'', category:'', publisher:'', year:'', stock:'1', description:'', cover:'' };

export default function AdminPerpustakaanPage() {
  const [tab, setTab] = useState<'books'|'borrowings'>('books');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEF_BOOK);
  const [err, setErr] = useState('');
  const [showBorrow, setShowBorrow] = useState<Book|null>(null);
  const [borrowForm, setBorrowForm] = useState({ studentId:'', dueDate:'' });
  const qc = useQueryClient();
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['admin-books', search],
    queryFn: async () => { const { data } = await apiClient.get(`/books?limit=50&search=${search}`); return (data.data||[]) as Book[]; },
  });

  const { data: borrowings = [], isLoading: borrowLoading } = useQuery({
    queryKey: ['admin-borrowings'],
    queryFn: async () => { const { data } = await apiClient.get('/borrowings?limit=50'); return (data.data||[]) as Borrowing[]; },
  });

  const createBook = useMutation({
    mutationFn: (body: Record<string,unknown>) => apiClient.post('/books', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-books'] }); setShowForm(false); setForm(DEF_BOOK); },
    onError: e => setErr(getErrorMessage(e)),
  });

  const borrowBook = useMutation({
    mutationFn: (body: Record<string,unknown>) => apiClient.post('/borrowings', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-borrowings'] }); qc.invalidateQueries({ queryKey: ['admin-books'] }); setShowBorrow(null); setBorrowForm({ studentId:'', dueDate:'' }); },
    onError: e => setErr(getErrorMessage(e)),
  });

  const returnBook = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/borrowings/${id}/return`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-borrowings'] }); qc.invalidateQueries({ queryKey: ['admin-books'] }); },
  });

  const active = borrowings.filter(b => b.status === 'DIPINJAM');
  const overdue = borrowings.filter(b => b.status === 'TERLAMBAT');

  return (
    <div className="space-y-6">
      {/* Add book modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Tambah Koleksi Buku</h2>
                <p className="text-[11px] font-semibold text-slate-500">Masukkan data buku baru &amp; foto sampul ke katalog perpustakaan</p>
              </div>
              <button onClick={()=>setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={e=>{ e.preventDefault(); if(!form.title.trim()||!form.author.trim()) { setErr('Judul dan pengarang wajib diisi'); return; } createBook.mutate({ ...form, stock:parseInt(form.stock), year:form.year?parseInt(form.year):undefined }); }}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {err && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{err}</div>}
                
                {/* Upload Foto Sampul Buku (Opsional) */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-2">Foto Sampul Buku (Opsional)</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-18 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {form.cover ? (
                        <Image src={form.cover} alt="Sampul Buku" fill className="object-cover" />
                      ) : (
                        <BookOpen className="w-7 h-7 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CustomImageUploader
                        endpoint="newsImage"
                        label="Unggah Sampul Buku"
                        onUploadComplete={(url) => set('cover', url)}
                        className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-400 font-medium mt-1">Format JPG, PNG (Maks 4MB)</p>
                    </div>
                  </div>
                </div>

                {[
                  {label:'Judul Buku *',key:'title',placeholder:'cth: Sains & Teknologi SMP Kelas 7'},
                  {label:'Pengarang *',key:'author',placeholder:'Nama penulis / tim penyusun'},
                  {label:'ISBN',key:'isbn',placeholder:'cth: 978-602-1234-56-7'},
                  {label:'Penerbit',key:'publisher',placeholder:'Nama penerbit buku'},
                  {label:'Kategori',key:'category',placeholder:'cth: Sains, Matematika, Fiksi, Keislaman'},
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">{f.label}</label>
                    <input type="text" value={(form as Record<string,string>)[f.key]} onChange={e=>set(f.key,e.target.value)} placeholder={f.placeholder}
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
                  </div>
                ))}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tahun Terbit</label>
                    <input type="number" value={form.year} onChange={e=>set('year',e.target.value)} placeholder="2025" min="1900" max="2099"
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Jumlah Stok</label>
                    <input type="number" value={form.stock} onChange={e=>set('stock',e.target.value)} min="1"
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">Batal</button>
                <button type="submit" disabled={createBook.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold transition-all shadow-xs">
                  {createBook.isPending && <Loader2 className="w-4 h-4 animate-spin"/>} Simpan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow modal */}
      {showBorrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Pinjamkan Buku</h2>
                <p className="text-[11px] font-semibold text-slate-500">Catat transaksi peminjaman siswa</p>
              </div>
              <button onClick={()=>setShowBorrow(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <p className="text-xs font-extrabold text-slate-900">{showBorrow.title}</p>
                <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{showBorrow.author} · Stok Tersedia: {showBorrow.available}</p>
              </div>
              {err && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{err}</div>}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">ID Siswa Peminjam</label>
                <input type="text" value={borrowForm.studentId} onChange={e=>setBorrowForm(p=>({...p,studentId:e.target.value}))} placeholder="Masukkan ID siswa..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Batas Pengembalian</label>
                <input type="date" value={borrowForm.dueDate} onChange={e=>setBorrowForm(p=>({...p,dueDate:e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
              <button onClick={()=>setShowBorrow(null)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">Batal</button>
              <button onClick={()=>borrowBook.mutate({ bookId:showBorrow.id, studentId:borrowForm.studentId, dueDate:new Date(borrowForm.dueDate).toISOString() })}
                disabled={borrowBook.isPending||!borrowForm.studentId||!borrowForm.dueDate}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold transition-all shadow-xs">
                {borrowBook.isPending && <Loader2 className="w-4 h-4 animate-spin"/>} Pinjamkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Perpustakaan Sekolah</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{books.length} buku · {active.length} dipinjam · {overdue.length} terlambat</p>
        </div>
        <button onClick={()=>setShowForm(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
          <Plus className="w-4 h-4"/> Tambah Buku Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label:'Total Koleksi Buku', value:books.length, color:'text-blue-700', bg:'bg-blue-50/80 border-blue-100' },
          { label:'Sedang Dipinjam', value:active.length, color:'text-amber-700', bg:'bg-amber-50/80 border-amber-100' },
          { label:'Terlambat Kembali', value:overdue.length, color:'text-rose-700', bg:'bg-rose-50/80 border-rose-100' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-3xl border p-5 text-center shadow-2xs`}>
            <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-extrabold text-slate-700 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-emerald-50 p-1.5 rounded-2xl border border-emerald-100 w-fit">
        {[{k:'books',l:'📚 Koleksi Katalog Buku'},{k:'borrowings',l:'🔄 Transaksi Peminjaman'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k as 'books'|'borrowings')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${tab===t.k?'bg-white text-emerald-950 shadow-2xs':'text-slate-600 hover:text-emerald-800'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Books list */}
      {tab === 'books' && (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-emerald-100 bg-emerald-50/30">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600"/>
              <input type="search" placeholder="Cari judul buku / pengarang..." value={search} onChange={e=>setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
            </div>
          </div>
          {booksLoading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
          : books.length === 0 ? <div className="text-center py-16 text-slate-400"><BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30"/><p className="text-xs font-semibold text-slate-500">Belum ada buku terdaftar</p></div>
          : <div className="divide-y divide-emerald-50">
              {books.map(b => (
                <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors">
                  <div className="relative w-10 h-14 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-2xs text-emerald-700">
                    {b.cover ? (
                      <Image src={b.cover} alt={b.title} fill className="object-cover" />
                    ) : (
                      <BookOpen className="w-5 h-5"/>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{b.title}</p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{b.author}{b.category && ` · ${b.category}`}</p>
                    {b.isbn && <p className="text-[10px] font-mono text-slate-400 mt-0.5">{b.isbn}</p>}
                  </div>
                  <div className="text-center flex-shrink-0">
                    <p className={`text-xs font-black ${b.available > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{b.available}/{b.stock}</p>
                    <p className="text-[10px] font-bold text-slate-400">Tersedia</p>
                  </div>
                  <button onClick={()=>{ setErr(''); setShowBorrow(b); }} disabled={b.available <= 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-extrabold hover:bg-emerald-100 border border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs">
                    <ArrowRightLeft className="w-3.5 h-3.5"/> Pinjam
                  </button>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* Borrowings */}
      {tab === 'borrowings' && (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
          {borrowLoading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
          : borrowings.length === 0 ? <div className="text-center py-16 text-slate-400"><ArrowRightLeft className="w-10 h-10 mx-auto mb-2 opacity-30"/><p className="text-xs font-semibold text-slate-500">Tidak ada peminjaman aktif</p></div>
          : <div className="divide-y divide-emerald-50">
              {borrowings.map(b => {
                const isOverdue = b.status === 'TERLAMBAT';
                return (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors">
                    <div className={`w-1.5 h-full rounded-full flex-shrink-0 self-stretch ${isOverdue?'bg-rose-500':b.returnedAt?'bg-emerald-500':'bg-amber-500'}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-900">{b.book.title}</p>
                      <p className="text-[11px] font-semibold text-slate-500">{b.student.fullName} · {b.student.class?.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-slate-400">
                        <span>Dipinjam: {formatDate(b.borrowedAt,{day:'numeric',month:'short'})}</span>
                        <span className={isOverdue?'text-rose-600 font-bold':''}>Batas: {formatDate(b.dueDate,{day:'numeric',month:'short'})}</span>
                        {b.fine > 0 && <span className="text-rose-600 font-bold">Denda: Rp{b.fine.toLocaleString('id-ID')}</span>}
                      </div>
                    </div>
                    {!b.returnedAt && (
                      <button onClick={()=>returnBook.mutate(b.id)} disabled={returnBook.isPending}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-extrabold hover:bg-emerald-100 border border-emerald-200 transition-all shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5"/> Dikembalikan
                      </button>
                    )}
                    {b.returnedAt && <span className="text-xs text-emerald-700 font-extrabold">✓ Dikembalikan</span>}
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}
    </div>
  );
}
