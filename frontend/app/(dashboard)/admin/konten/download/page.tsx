'use client';

import { useState } from 'react';
import { Plus, Trash2, Download, FileText, X, Search, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useActivityLogStore } from '@/store/activity-log.store';
import { toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';

interface DlFile {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  downloadCount: number;
  isPublic: boolean;
  createdAt: string;
}

const INITIAL_CATEGORIES = [
  'Formulir PPDB',
  'Administrasi Siswa',
  'Panduan & Buku',
  'Keuangan',
  'Akademik',
  'Lainnya',
];

const INITIAL_DOWNLOADS: DlFile[] = [
  {
    id: 'doc-1',
    title: 'Formulir Pendaftaran & Berkas Fisik PPDB T.A. 2026/2027',
    description: 'Dokumen cetak formulir pendaftaran serta kelengkapan syarat berkas calon siswa baru.',
    category: 'Formulir PPDB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '1.4 MB',
    downloadCount: 340,
    isPublic: true,
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'doc-2',
    title: 'Buku Panduan Tata Tertib & Kode Etik Siswa SMP Darul Ulum',
    description: 'Buku saku elektronik panduan disiplin, atribut seragam, dan aturan tata tertib siswa.',
    category: 'Panduan & Buku',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '2.8 MB',
    downloadCount: 820,
    isPublic: true,
    createdAt: '2026-07-15T09:00:00Z',
  },
  {
    id: 'doc-3',
    title: 'Dokumen Kalender Pendidikan Resmi Kota Surabaya 2026/2027',
    description: 'Kalender pendidikan resmi mengenai tanggal libur hari besar dan pekan efektif belajar.',
    category: 'Akademik',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    downloadCount: 1150,
    isPublic: true,
    createdAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'doc-4',
    title: 'Surat Pernyataan Bebas Narkoba & Kesediaan Tatap Muka',
    description: 'Template surat pernyataan wali murid dan persetujuan tata tertib sekolah.',
    category: 'Administrasi Siswa',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'DOCX',
    fileSize: '450 KB',
    downloadCount: 290,
    isPublic: true,
    createdAt: '2026-08-05T11:00:00Z',
  },
];

export default function AdminDownloadPage() {
  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [downloads, setDownloads] = useState<DlFile[]>(INITIAL_DOWNLOADS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categorySelect: 'Formulir PPDB',
    customCategory: '',
    fileUrl: '',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    isPublic: true,
  });

  const updateForm = (k: string, v: unknown) => setFormData((p) => ({ ...p, [k]: v }));

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      categorySelect: categories[0] || 'Formulir PPDB',
      customCategory: '',
      fileUrl: '',
      fileType: 'PDF',
      fileSize: '1.2 MB',
      isPublic: true,
    });
    setShowFormModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Resolve final category (either selected or typed custom category)
    let finalCategory = formData.categorySelect;
    if (formData.categorySelect === '__NEW__') {
      const trimmedCustom = formData.customCategory.trim();
      if (!trimmedCustom) {
        toast.error('Kategori Kosong', 'Harap isi nama kategori baru.');
        return;
      }
      finalCategory = trimmedCustom;
    }

    // Add to categories list if not present
    if (finalCategory && !categories.includes(finalCategory)) {
      setCategories((prev) => [...prev, finalCategory]);
    }

    const newItem: DlFile = {
      id: `doc-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: finalCategory,
      fileUrl: formData.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: formData.fileType,
      fileSize: formData.fileSize,
      downloadCount: 0,
      isPublic: formData.isPublic,
      createdAt: new Date().toISOString(),
    };

    setDownloads((prev) => [newItem, ...prev]);

    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Mengunggah Berkas Unduhan Baru "${formData.title}"`,
      module: 'Pengguna',
      severity: 'SUCCESS',
      details: `Kategori: ${finalCategory}, Tipe: ${formData.fileType}`,
    });

    toast.success('Berkas Ditambahkan', `File unduhan "${formData.title}" berhasil diunggah.`);
    setShowFormModal(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const target = downloads.find((d) => d.id === deletingId);
    setDownloads((prev) => prev.filter((d) => d.id !== deletingId));

    if (target) {
      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menghapus Berkas Unduhan "${target.title}"`,
        module: 'Pengguna',
        severity: 'DANGER',
        details: `ID Berkas: ${target.id}`,
      });
    }

    toast.success('Berkas Dihapus', 'File unduhan berhasil dihapus dari server.');
    setDeletingId(null);
  };

  const filtered = downloads.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === '' || d.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pusat Berkas &amp; Dokumen Unduhan
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola berkas publikasi, formulir PPDB, buku panduan, dan surat edaran sekolah.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Berkas Baru</span>
        </button>
      </div>

      {/* Toolbar Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berkas dokumen..."
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
            value={catFilter}
            onChange={(e) => {
              setCatFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="">Semua Kategori Dokumen</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">NAMA BERKAS DOKUMEN</th>
                <th className="px-5 py-3.5">KATEGORI</th>
                <th className="px-5 py-3.5">FORMAT &amp; UKURAN</th>
                <th className="px-5 py-3.5">TOTAL DIUNDUH</th>
                <th className="px-5 py-3.5">TANGGAL UPLOAD</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-extrabold whitespace-nowrap shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono font-semibold text-slate-700">
                      {item.fileType} ({item.fileSize})
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-900">{item.downloadCount} kali</td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                      {formatDate(item.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors inline-flex items-center"
                          title="Unduh File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title="Hapus Berkas"
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
                    Tidak ada berkas dokumen yang sesuai.
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

      {/* Modal Form Upload */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Upload Berkas Dokumen</h3>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Formulir Pendaftaran PPDB..."
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori Dokumen</label>
                <select
                  value={formData.categorySelect}
                  onChange={(e) => updateForm('categorySelect', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__NEW__">+ Buat Kategori Baru...</option>
                </select>

                {formData.categorySelect === '__NEW__' && (
                  <div className="mt-2 animate-in fade-in zoom-in-95 duration-150">
                    <input
                      type="text"
                      required
                      placeholder="Ketik nama kategori baru (Misal: Ekstrakurikuler, Alumni...)"
                      value={formData.customCategory}
                      onChange={(e) => updateForm('customCategory', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/40 text-xs font-extrabold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-emerald-600/50"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Format File</label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => updateForm('fileType', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="PDF">PDF Document (.pdf)</option>
                    <option value="DOCX">Word Document (.docx)</option>
                    <option value="XLSX">Excel Spreadsheet (.xlsx)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ukuran File</label>
                  <input
                    type="text"
                    placeholder="1.5 MB"
                    value={formData.fileSize}
                    onChange={(e) => updateForm('fileSize', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Link URL File Dokumen</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.fileUrl}
                  onChange={(e) => updateForm('fileUrl', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan ringkas isi dokumen..."
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
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
                  Upload Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
            <h3 className="font-extrabold text-slate-900 text-base">Hapus Berkas Unduhan?</h3>
            <p className="text-xs text-slate-600 font-medium">
              Apakah Anda yakin ingin menghapus dokumen ini dari portal unduhan sekolah?
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
