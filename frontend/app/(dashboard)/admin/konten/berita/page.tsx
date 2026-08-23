'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, FileText, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useActivityLogStore } from '@/store/activity-log.store';
import { toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import { contentService } from '@/lib/services/content.service';

type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string | null;
  category: string;
  tags: string[];
  status: NewsStatus;
  viewCount: number;
  author: string;
  publishedAt: string;
}

const CATEGORIES = ['Prestasi', 'PPDB', 'Kegiatan', 'Akademik', 'Teknologi', 'Penghargaan', 'Pengumuman'];

const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Siswa SMP Darul Ulum Raih Medali Emas OSN Matematika Tingkat Kota Surabaya',
    slug: 'siswa-smp-darul-ulum-raih-medali-emas-osn-matematika',
    excerpt: 'Prestasi gemilang diraih oleh ananda Ahmad Fauzi siswa kelas 9A yang berhasil menyabet juara 1 OSN Matematika 2026.',
    content: 'Surabaya, SMP Darul Ulum kembali mengukir prestasi di tingkat kota. Dalam ajang Olimpiade Sains Nasional (OSN) 2026 yang diselenggarakan oleh Dinas Pendidikan Kota Surabaya, ananda Ahmad Fauzi kelas 9A berhasil mempersembahkan Medali Emas bidang Matematika. Kepala Sekolah menyampaikan apresiasi mendalam atas kerja keras tim pembina dan bimbingan guru sains.',
    thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
    category: 'Prestasi',
    tags: ['OSN', 'Matematika', 'Juara 1'],
    status: 'PUBLISHED',
    viewCount: 1420,
    author: 'Humas SMP Darul Ulum',
    publishedAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'news-2',
    title: 'Pembukaan PPDB Online Gelombang 2 T.A. 2026/2027 SMP Darul Ulum',
    slug: 'pembukaan-ppdb-online-gelombang-2-smp-darul-ulum',
    excerpt: 'Pendaftaran peserta didik baru gelombang 2 resmi dibuka secara online via portal admisi sekolah.',
    content: 'SMP Darul Ulum Surabaya resmi membuka pendaftaran peserta didik baru (PPDB) Gelombang 2 untuk Tahun Ajaran 2026/2027. Pendaftaran dilakukan secara mandiri melalui website resmi sekolah. Kuota yang disediakan terbatas untuk 2 kelas paralel.',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    category: 'PPDB',
    tags: ['PPDB', 'Pendaftaran', 'Siswa Baru'],
    status: 'PUBLISHED',
    viewCount: 890,
    author: 'Panitia PPDB',
    publishedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'news-3',
    title: 'Pelaksanaan Workshop Digital Learning & E-Learning Portal Bagi Guru',
    slug: 'pelaksanaan-workshop-digital-learning-guru',
    excerpt: 'Guna meningkatkan mutu pengajaran digital, dewan guru SMP Darul Ulum mengikuti pelatihan LMS modern.',
    content: 'Seluruh bapak ibu guru SMP Darul Ulum mengikuti workshop peningkatan kompetensi mengajar berbasis Learning Management System (LMS). Pelatihan fokus pada penyusunan modul interaktif, e-rubrik Penilaian, dan CBT.',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
    category: 'Akademik',
    tags: ['Workshop', 'Guru', 'Digital Learning'],
    status: 'PUBLISHED',
    viewCount: 530,
    author: 'Tim IT & Kurikulum',
    publishedAt: '2026-08-10T10:30:00Z',
  },
  {
    id: 'news-4',
    title: 'Peringatan Hari Kemerdekaan RI ke-81 & Pawai Budaya Siswa',
    slug: 'peringatan-hari-kemerdekaan-ri-ke-81-pawai-budaya',
    excerpt: 'Peringatan HUT RI ke-81 dimeriahkan dengan lomba busana adat nusantara dan pentas seni.',
    content: 'Kemeriahan peringatan HUT RI ke-81 di SMP Darul Ulum diwarnai dengan Pawai Budaya Nusantara. Siswa-siswi mengenakan pakaian adat dari berbagai daerah di Indonesia serta mengikuti perlombaan keagamaan dan ketangkasan.',
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80',
    category: 'Kegiatan',
    tags: ['HUT RI', 'Pawai Budaya', 'OSIS'],
    status: 'DRAFT',
    viewCount: 0,
    author: 'Pembina OSIS',
    publishedAt: '2026-08-17T07:00:00Z',
  },
];

export default function AdminBeritaPage() {

  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [newsList, setNewsList] = useState<NewsItem[]>(INITIAL_NEWS);

  // Fetch live backend news
  useEffect(() => {
    const fetchNewsBackend = async () => {
      try {
        const res = await contentService.getNews();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: NewsItem[] = res.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            slug: n.slug || n.title.toLowerCase().replace(/\s+/g, '-'),
            excerpt: n.excerpt || n.title,
            content: n.content || n.excerpt || n.title,
            thumbnail: n.imageUrl || n.thumbnail || null,
            category: n.category || 'Prestasi',
            tags: Array.isArray(n.tags) ? n.tags : ['Berita'],
            status: n.published ? 'PUBLISHED' : 'DRAFT',
            viewCount: n.views || 0,
            author: n.author?.fullName || 'Admin',
            publishedAt: n.createdAt ? String(n.createdAt).split('T')[0] : '2026-08-01',
          }));
          setNewsList(mapped);
        }
      } catch (err) {
        console.warn('Backend news load warning:', err);
      }

    };
    fetchNewsBackend();
  }, []);


  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [detailNews, setDetailNews] = useState<NewsItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Prestasi',
    tags: '',
    status: 'PUBLISHED' as NewsStatus,
    thumbnail: '' as string | null,
  });

  const updateForm = (key: string, val: any) => setFormData((p) => ({ ...p, [key]: val }));

  const filteredNews = newsList.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '' || n.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(Math.ceil(filteredNews.length / pageSize), 1);
  const paginatedNews = filteredNews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Prestasi',
      tags: 'Sekolah, Kegiatan',
      status: 'PUBLISHED',
      thumbnail: null,
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      category: item.category,
      tags: item.tags.join(', '),
      status: item.status,
      thumbnail: item.thumbnail,
    });
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    const tagArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const generatedSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (editingNews) {
      setNewsList((prev) =>
        prev.map((n) =>
          n.id === editingNews.id
            ? {
                ...n,
                title: formData.title,
                slug: generatedSlug,
                excerpt: formData.excerpt,
                content: formData.content,
                category: formData.category,
                tags: tagArray,
                status: formData.status,
                thumbnail: formData.thumbnail,
              }
            : n
        )
      );

      try {
        await contentService.updateNews(editingNews.id, {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          imageUrl: formData.thumbnail,
          published: formData.status === 'PUBLISHED',
        });
      } catch (err) {
        console.warn('Backend update news failed:', err);
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Memperbarui Artikel Berita "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Kategori: ${formData.category}, Status: ${formData.status}`,
      });

      toast.success('Berita Diperbarui', `Artikel "${formData.title}" berhasil diperbarui.`);
    } else {
      const newItem: NewsItem = {
        id: `news-${Date.now()}`,
        title: formData.title,
        slug: generatedSlug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: tagArray,
        status: formData.status,
        thumbnail: formData.thumbnail,
        viewCount: 0,
        author: actorName,
        publishedAt: new Date().toISOString(),
      };

      setNewsList((prev) => [newItem, ...prev]);

      try {
        await contentService.createNews({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          imageUrl: formData.thumbnail,
          published: formData.status === 'PUBLISHED',
        });
      } catch (err) {
        console.warn('Backend create news failed:', err);
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Mempublikasikan Artikel Berita Baru "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Kategori: ${formData.category}, Status: ${formData.status}`,
      });

      toast.success('Berita Ditambahkan', `Artikel baru "${formData.title}" berhasil disimpan.`);
    }

    setShowFormModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const target = newsList.find((n) => n.id === deletingId);
    setNewsList((prev) => prev.filter((n) => n.id !== deletingId));

    try {
      await contentService.deleteNews(deletingId);
    } catch (err) {
      console.warn('Backend delete news failed:', err);
    }

    if (target) {
      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menghapus Artikel Berita "${target.title}"`,
        module: 'Pengguna',
        severity: 'DANGER',
        details: `ID Berita: ${target.id}`,
      });
    }

    toast.success('Berita Dihapus', 'Artikel berita berhasil dihapus dari sistem.');
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Berita &amp; Artikel
          </h1>

          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola publikasi berita, rilis kabar prestasi, dan warta kegiatan sekolah.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Berita Baru</span>
        </button>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul berita, ringkasan, kategori..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none cursor-pointer"
          >
            <option value="">Semua Status Publikasi</option>
            <option value="PUBLISHED">Published (Terbit)</option>
            <option value="DRAFT">Draft (Konsep)</option>
            <option value="ARCHIVED">Archived (Arsip)</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">BERITA &amp; JUDUL</th>
                <th className="px-5 py-3.5">KATEGORI</th>
                <th className="px-5 py-3.5">PENULIS</th>
                <th className="px-5 py-3.5">TANGGAL TERBIT</th>
                <th className="px-5 py-3.5">STATUS</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedNews.length > 0 ? (
                paginatedNews.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {n.thumbnail ? (
                            <img src={n.thumbnail} alt={n.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{n.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-emerald-700">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px]">
                        {n.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-700">{n.author}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                      {formatDate(n.publishedAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          n.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : n.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {n.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailNews(n)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Lihat Detail Berita"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(n)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Edit Berita"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(n.id)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title="Hapus Berita"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-500 font-medium">
                    Tidak ada berita yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl text-xs font-semibold text-slate-500">
          <p>
            Halaman <strong className="text-slate-900">{currentPage}</strong> dari{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Berita */}
      {detailNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Detail Artikel Berita</h3>
              <button onClick={() => setDetailNews(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailNews.thumbnail && (
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={detailNews.thumbnail} alt={detailNews.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                {detailNews.category}
              </span>
              <h2 className="text-lg font-black text-slate-900">{detailNews.title}</h2>
              <p className="text-xs text-slate-400 font-medium">
                Ditulis oleh <strong>{detailNews.author}</strong> · {formatDate(detailNews.publishedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {detailNews.content}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailNews(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingNews ? 'Edit Artikel Berita' : 'Tambah Artikel Berita Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Foto Sampul / Gambar Berita</label>
                <CustomImageUploader
                  value={formData.thumbnail}
                  onChange={(url) => updateForm('thumbnail', url)}
                  endpoint="newsImage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Berita</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Siswa SMP Darul Ulum Raih Medali Emas..."
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Publikasi</label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateForm('status', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="PUBLISHED">Published (Terbit)</option>
                    <option value="DRAFT">Draft (Konsep)</option>
                    <option value="ARCHIVED">Archived (Arsip)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ringkasan (Excerpt)</label>
                <input
                  type="text"
                  placeholder="Ringkasan singkat berita..."
                  value={formData.excerpt}
                  onChange={(e) => updateForm('excerpt', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Isi Konten Berita</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tuliskan berita secara lengkap di sini..."
                  value={formData.content}
                  onChange={(e) => updateForm('content', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tags (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="OSN, Matematika, Juara 1"
                  value={formData.tags}
                  onChange={(e) => updateForm('tags', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingNews ? 'Simpan Berita' : 'Terbitkan Berita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Berita */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
            <h3 className="font-extrabold text-slate-900 text-base">Hapus Artikel Berita?</h3>
            <p className="text-xs text-slate-600 font-medium">
              Apakah Anda yakin ingin menghapus berita ini secara permanen dari portal sekolah?
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
