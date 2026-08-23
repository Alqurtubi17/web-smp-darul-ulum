'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, ArrowRightLeft, Plus, Search, CheckCircle, Clock,
  Filter, ChevronLeft, ChevronRight, X, Edit2, Trash2, Tag,
  BookCheck, UserPlus
} from 'lucide-react';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import { toast } from '@/store/toast.store';
import { useActivityLogStore } from '@/store/activity-log.store';
import { libraryService } from '@/lib/services/library.service';

interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  stock: number;
  available: number;
  cover?: string | null;
  location?: string;
}

interface BorrowingItem {
  id: string;
  bookTitle: string;
  studentName: string;
  studentNis: string;
  studentClass: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT';
}

const INITIAL_BOOKS: BookItem[] = [
  { id: '1', title: 'Fisika Dasar untuk SMP Kelas 7', author: 'Dr. Bambang Sutrisno', isbn: '978-602-01-1234-5', category: 'Sains', publisher: 'Erlangga', year: 2024, stock: 10, available: 7, cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80', location: 'Rak A-01' },
  { id: '2', title: 'Matematika Terpadu Kurikulum Merdeka', author: 'Prof. Endang Setyowati', isbn: '978-602-01-5678-9', category: 'Matematika', publisher: 'Yudhistira', year: 2025, stock: 12, available: 10, cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80', location: 'Rak B-03' },
  { id: '3', title: 'Bahasa Indonesia: Apresiasi Sastra & Bahasa', author: 'Siti Nurjanah, M.Pd.', isbn: '978-602-01-9101-1', category: 'Bahasa', publisher: 'Balai Pustaka', year: 2023, stock: 8, available: 5, cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', location: 'Rak C-02' },
  { id: '4', title: 'Sejarah Kebudayaan Islam Nusantara', author: 'K.H. Ahmad Dahlan', isbn: '978-602-01-3141-5', category: 'Agama Islam', publisher: 'Pustaka Islam', year: 2024, stock: 15, available: 12, cover: null, location: 'Rak D-05' },
  { id: '5', title: 'Ilmu Pengetahuan Sosial: Geografi & Ekonomi', author: 'Drs. Hendro Utomo', isbn: '978-602-01-6171-8', category: 'IPS & Sejarah', publisher: 'Ganesha', year: 2023, stock: 9, available: 8, cover: null, location: 'Rak E-01' },
  { id: '6', title: 'Biologi Lingkungan & Ekosistem SMP', author: 'Dra. Rina Karlina', isbn: '978-602-01-2233-4', category: 'Sains', publisher: 'Erlangga', year: 2025, stock: 6, available: 4, cover: null, location: 'Rak A-04' },
];

const INITIAL_BORROWINGS: BorrowingItem[] = [
  { id: '1', bookTitle: 'Fisika Dasar untuk SMP Kelas 7', studentName: 'Ahmad Rizki Pratama', studentNis: '2026001', studentClass: '7A', borrowDate: '2026-08-10', dueDate: '2026-08-17', status: 'TERLAMBAT' },
  { id: '2', bookTitle: 'Matematika Terpadu Kurikulum Merdeka', studentName: 'Siti Nur Aisyah', studentNis: '2026002', studentClass: '7A', borrowDate: '2026-08-15', dueDate: '2026-08-22', status: 'DIPINJAM' },
  { id: '3', bookTitle: 'Bahasa Indonesia: Apresiasi Sastra & Bahasa', studentName: 'Budi Permana', studentNis: '2026003', studentClass: '7B', borrowDate: '2026-08-01', dueDate: '2026-08-08', returnDate: '2026-08-07', status: 'DIKEMBALIKAN' },
  { id: '4', bookTitle: 'Sejarah Kebudayaan Islam Nusantara', studentName: 'Dewi Anggraini', studentNis: '2026004', studentClass: '8A', borrowDate: '2026-08-12', dueDate: '2026-08-19', status: 'TERLAMBAT' },
];

const DEFAULT_CATEGORIES = ['Sains', 'Matematika', 'Bahasa', 'IPS & Sejarah', 'Agama Islam', 'Komputer & IT', 'Seni & Budaya', 'Fiksi & Novel', 'Ensiklopedia'];

export default function AdminPerpustakaanPage() {
  const { addLog } = useActivityLogStore();

  const [books, setBooks] = useState<BookItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Load live data from Backend API

  useEffect(() => {
    const fetchLibraryBackend = async () => {
      try {
        const booksRes = await libraryService.getBooks();
        if (booksRes?.data && Array.isArray(booksRes.data)) {
          const mappedBooks: BookItem[] = booksRes.data.map((b: any) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            isbn: b.isbn || '-',
            category: b.category || 'Sains',
            publisher: b.publisher || 'Erlangga',
            year: b.year || 2026,
            stock: b.totalStock || 5,
            available: b.availableStock || 5,
            cover: b.cover,
            location: b.location || 'Rak A-01',
          }));
          setBooks(mappedBooks);
        }

        const borrowingsRes = await libraryService.getBorrowings();
        if (borrowingsRes?.data && Array.isArray(borrowingsRes.data)) {

          const mappedBorrowings: BorrowingItem[] = borrowingsRes.data.map((br: any) => ({
            id: br.id,
            bookTitle: br.book?.title || 'Buku Perpustakaan',
            studentName: br.student?.fullName || 'Siswa',
            studentNis: br.student?.nis || '-',
            studentClass: br.student?.class?.name || '7A',
            borrowDate: br.borrowedAt ? String(br.borrowedAt).split('T')[0] : '2026-08-10',
            dueDate: br.dueDate ? String(br.dueDate).split('T')[0] : '2026-08-17',
            returnDate: br.returnedAt ? String(br.returnedAt).split('T')[0] : undefined,
            status: br.status,
          }));
          setBorrowings(mappedBorrowings);
        }
      } catch (err) {
        console.warn('Menggunakan data perpustakaan lokal:', err);
      }
    };
    fetchLibraryBackend();
  }, []);


  const [tab, setTab] = useState<'books' | 'borrowings'>('books');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modal States for Books
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState<BookItem | null>(null);
  const [showDeleteBookModal, setShowDeleteBookModal] = useState<BookItem | null>(null);

  // Modal States for Borrowings
  const [showCreateBorrowingModal, setShowCreateBorrowingModal] = useState(false);
  const [editingBorrowing, setEditingBorrowing] = useState<BorrowingItem | null>(null);
  const [showDeleteBorrowingModal, setShowDeleteBorrowingModal] = useState<BorrowingItem | null>(null);

  // Form New / Edit Book
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newCategory, setNewCategory] = useState('Sains');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [newPublisher, setNewPublisher] = useState('Erlangga');
  const [newYear, setNewYear] = useState('2026');
  const [newStock, setNewStock] = useState('5');
  const [newCover, setNewCover] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState('Rak A-01');

  // Form Borrow
  const [selectedBookId, setSelectedBookId] = useState('');
  const [borrowStudentName, setBorrowStudentName] = useState('');
  const [borrowNis, setBorrowNis] = useState('');
  const [borrowClass, setBorrowClass] = useState('7A');
  const [borrowDueDate, setBorrowDueDate] = useState('2026-08-28');
  const [borrowStatus, setBorrowStatus] = useState<'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT'>('DIPINJAM');

  // Computed Summaries
  const totalStockSum = books.reduce((acc, b) => acc + b.stock, 0);
  const totalAvailableSum = books.reduce((acc, b) => acc + b.available, 0);
  const activeBorrowings = borrowings.filter((b) => b.status === 'DIPINJAM' || b.status === 'TERLAMBAT');
  const overdueBorrowings = borrowings.filter((b) => b.status === 'TERLAMBAT');

  // Filtered Lists
  const filteredBooks = books.filter((b) => {
    const matchCat = filterCat === 'ALL' || b.category === filterCat;
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.includes(search);
    return matchCat && matchSearch;
  });

  const filteredBorrowings = borrowings.filter((b) => {
    return (
      b.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.studentName.toLowerCase().includes(search.toLowerCase()) ||
      b.studentNis.includes(search)
    );
  });

  const currentListLength = tab === 'books' ? filteredBooks.length : filteredBorrowings.length;
  const totalPages = Math.max(Math.ceil(currentListLength / pageSize), 1);

  const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedBorrowings = filteredBorrowings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handlers for Books
  const handleOpenAdd = () => {
    setEditingBook(null);
    setNewTitle('');
    setNewAuthor('');
    setNewIsbn('');
    setNewCategory(categories[0] || 'Sains');
    setIsCustomCategoryMode(false);
    setCustomCategoryInput('');
    setNewPublisher('Erlangga');
    setNewYear('2026');
    setNewStock('5');
    setNewCover(null);
    setNewLocation('Rak A-01');
    setShowAddModal(true);
  };

  const handleOpenEdit = (b: BookItem) => {
    setEditingBook(b);
    setNewTitle(b.title);
    setNewAuthor(b.author);
    setNewIsbn(b.isbn);
    setNewCategory(b.category);
    setIsCustomCategoryMode(false);
    setCustomCategoryInput('');
    setNewPublisher(b.publisher);
    setNewYear(String(b.year));
    setNewStock(String(b.stock));
    setNewCover(b.cover || null);
    setNewLocation(b.location || 'Rak A-01');
    setShowAddModal(true);
  };

  const handleConfirmDeleteBook = async () => {
    if (!showDeleteBookModal) return;
    const targetId = showDeleteBookModal.id;
    setBooks((prev) => prev.filter((b) => b.id !== targetId));

    try {
      await libraryService.deleteBook(targetId);
    } catch (err) {
      console.warn('Backend delete book API failed:', err);
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Penghapusan Buku Perpustakaan',
      module: 'Perpustakaan',
      severity: 'DANGER',
      details: `Menghapus buku "${showDeleteBookModal.title}" (Pengarang: ${showDeleteBookModal.author}) dari katalog`,
    });

    toast.success('Buku Berhasil Dihapus', `Buku "${showDeleteBookModal.title}" telah dihapus dari perpustakaan.`);
    setShowDeleteBookModal(null);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) {
      toast.error('Data Belum Lengkap', 'Judul buku dan Pengarang wajib diisi.');
      return;
    }

    let finalCategory = newCategory;
    if (isCustomCategoryMode || newCategory === 'CUSTOM') {
      if (!customCategoryInput.trim()) {
        toast.error('Kategori Kosong', 'Silakan ketik nama kategori buku baru.');
        return;
      }
      finalCategory = customCategoryInput.trim();
      if (!categories.includes(finalCategory)) {
        setCategories([...categories, finalCategory]);
      }
    }

    const stockNum = parseInt(newStock, 10) || 5;

    if (editingBook) {
      const diffStock = stockNum - editingBook.stock;
      const updatedAvailable = Math.max(editingBook.available + diffStock, 0);

      setBooks((prev) =>
        prev.map((b) =>
          b.id === editingBook.id
            ? {
                ...b,
                title: newTitle,
                author: newAuthor,
                isbn: newIsbn || b.isbn,
                category: finalCategory,
                publisher: newPublisher,
                year: parseInt(newYear, 10) || 2026,
                stock: stockNum,
                available: updatedAvailable,
                cover: newCover,
                location: newLocation,
              }
            : b
        )
      );

      try {
        await libraryService.updateBook(editingBook.id, {
          title: newTitle,
          author: newAuthor,
          isbn: newIsbn,
          category: finalCategory,
          publisher: newPublisher,
          year: parseInt(newYear, 10) || 2026,
          totalStock: stockNum,
          availableStock: updatedAvailable,
          cover: newCover,
        });
      } catch (err) {
        console.warn('Backend update book API failed:', err);
      }

      addLog({
        user: 'Admin Utama',
        role: 'ADMIN',
        action: 'Pembaruan Data Buku',
        module: 'Perpustakaan',
        severity: 'SUCCESS',
        details: `Memperbarui data buku "${newTitle}" (Kategori: ${finalCategory})`,
      });

      toast.success('Buku Diperbarui', `Informasi buku "${newTitle}" berhasil diperbarui.`);
    } else {
      const newBook: BookItem = {
        id: String(Date.now()),
        title: newTitle,
        author: newAuthor,
        isbn: newIsbn || `978-602-${Math.floor(1000 + Math.random() * 9000)}-0`,
        category: finalCategory,
        publisher: newPublisher,
        year: parseInt(newYear, 10) || 2026,
        stock: stockNum,
        available: stockNum,
        cover: newCover,
        location: newLocation,
      };
      setBooks([newBook, ...books]);

      try {
        await libraryService.createBook({
          title: newTitle,
          author: newAuthor,
          isbn: newBook.isbn,
          category: finalCategory,
          publisher: newPublisher,
          year: parseInt(newYear, 10) || 2026,
          totalStock: stockNum,
          availableStock: stockNum,
          cover: newCover,
        });
      } catch (err) {
        console.warn('Backend create book API failed:', err);
      }

      addLog({
        user: 'Admin Utama',
        role: 'ADMIN',
        action: 'Penambahan Koleksi Buku',
        module: 'Perpustakaan',
        severity: 'SUCCESS',
        details: `Menambahkan buku baru "${newTitle}" (Pengarang: ${newAuthor}, Kategori: ${finalCategory})`,
      });

      toast.success('Buku Ditambahkan', `Buku "${newTitle}" berhasil dimasukkan ke perpustakaan.`);
    }

    setShowAddModal(false);
  };

  // Handlers for Borrowings
  const handleOpenCreateBorrowing = () => {
    const availBooks = books.filter((b) => b.available > 0);
    if (availBooks.length === 0) {
      toast.error('Stok Buku Habis', 'Tidak ada buku yang tersedia untuk dipinjam saat ini.');
      return;
    }
    setSelectedBookId(availBooks[0].id);
    setBorrowStudentName('');
    setBorrowNis('');
    setBorrowClass('7A');
    setBorrowDueDate('2026-08-28');
    setShowCreateBorrowingModal(true);
  };

  const handleSaveNewBorrowing = async (e: React.FormEvent) => {
    e.preventDefault();
    const book = books.find((b) => b.id === selectedBookId);
    if (!book) {
      toast.error('Pilih Buku', 'Silakan pilih buku yang akan dipinjam.');
      return;
    }
    if (!borrowStudentName.trim() || !borrowNis.trim()) {
      toast.error('Data Belum Lengkap', 'Nama Siswa dan NIS wajib diisi.');
      return;
    }

    const newBorrowing: BorrowingItem = {
      id: String(Date.now()),
      bookTitle: book.title,
      studentName: borrowStudentName,
      studentNis: borrowNis,
      studentClass: borrowClass,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: borrowDueDate,
      status: 'DIPINJAM',
    };

    setBorrowings([newBorrowing, ...borrowings]);
    setBooks((prev) =>
      prev.map((b) => (b.id === book.id ? { ...b, available: Math.max(b.available - 1, 0) } : b))
    );

    try {
      await libraryService.borrowBook({
        bookId: book.id,
        studentName: borrowStudentName,
        nis: borrowNis,
        dueDate: borrowDueDate,
      });
    } catch (err) {
      console.warn('Backend borrow book API failed:', err);
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Pencatatan Peminjaman Buku',
      module: 'Perpustakaan',
      severity: 'INFO',
      details: `Mencatat peminjaman buku "${book.title}" oleh siswa ${borrowStudentName} (NIS: ${borrowNis}, Kelas: ${borrowClass})`,
    });

    setShowCreateBorrowingModal(false);
    toast.success('Peminjaman Dicatat', `Buku "${book.title}" berhasil dipinjamkan kepada ${borrowStudentName}.`);
  };

  const handleCreateBorrowing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBorrowModal) return;
    if (!borrowStudentName.trim() || !borrowNis.trim()) {
      toast.error('Data Belum Lengkap', 'Nama Siswa dan NIS wajib diisi.');
      return;
    }

    const newBorrowing: BorrowingItem = {
      id: String(Date.now()),
      bookTitle: showBorrowModal.title,
      studentName: borrowStudentName,
      studentNis: borrowNis,
      studentClass: borrowClass,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: borrowDueDate,
      status: 'DIPINJAM',
    };

    setBorrowings([newBorrowing, ...borrowings]);
    setBooks((prev) =>
      prev.map((b) => (b.id === showBorrowModal.id ? { ...b, available: Math.max(b.available - 1, 0) } : b))
    );

    try {
      await libraryService.borrowBook({
        bookId: showBorrowModal.id,
        studentName: borrowStudentName,
        nis: borrowNis,
        dueDate: borrowDueDate,
      });
    } catch (err) {
      console.warn('Backend borrow book API failed:', err);
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Pencatatan Peminjaman Buku',
      module: 'Perpustakaan',
      severity: 'INFO',
      details: `Mencatat peminjaman buku "${showBorrowModal.title}" oleh siswa ${borrowStudentName} (NIS: ${borrowNis}, Kelas: ${borrowClass})`,
    });

    setShowBorrowModal(null);
    setBorrowStudentName('');
    setBorrowNis('');
    toast.success('Peminjaman Dicatat', `Buku "${showBorrowModal.title}" berhasil dipinjamkan kepada ${borrowStudentName}.`);
  };

  const handleOpenEditBorrowing = (br: BorrowingItem) => {
    setEditingBorrowing(br);
    setBorrowStudentName(br.studentName);
    setBorrowNis(br.studentNis);
    setBorrowClass(br.studentClass);
    setBorrowDueDate(br.dueDate);
    setBorrowStatus(br.status);
  };

  const handleSaveEditBorrowing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBorrowing) return;

    setBorrowings((prev) =>
      prev.map((b) =>
        b.id === editingBorrowing.id
          ? {
              ...b,
              studentName: borrowStudentName,
              studentNis: borrowNis,
              studentClass: borrowClass,
              dueDate: borrowDueDate,
              status: borrowStatus,
              returnDate: borrowStatus === 'DIKEMBALIKAN' ? (b.returnDate || new Date().toISOString().split('T')[0]) : undefined,
            }
          : b
      )
    );

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Pembaruan Data Peminjaman',
      module: 'Perpustakaan',
      severity: 'SUCCESS',
      details: `Memperbarui data peminjaman buku "${editingBorrowing.bookTitle}" atas nama ${borrowStudentName}`,
    });

    toast.success('Data Peminjaman Diperbarui', `Informasi peminjaman atas nama ${borrowStudentName} berhasil diperbarui.`);
    setEditingBorrowing(null);
  };

  const handleConfirmDeleteBorrowing = () => {
    if (!showDeleteBorrowingModal) return;

    const targetId = showDeleteBorrowingModal.id;
    const target = showDeleteBorrowingModal;

    setBorrowings((prev) => prev.filter((b) => b.id !== targetId));

    if (target.status !== 'DIKEMBALIKAN') {
      setBooks((prev) =>
        prev.map((b) => (b.title === target.bookTitle ? { ...b, available: Math.min(b.available + 1, b.stock) } : b))
      );
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Penghapusan Catatan Peminjaman',
      module: 'Perpustakaan',
      severity: 'DANGER',
      details: `Menghapus data peminjaman buku "${target.bookTitle}" oleh siswa ${target.studentName} (NIS: ${target.studentNis})`,
    });

    toast.success('Peminjaman Dihapus', `Catatan peminjaman atas nama ${target.studentName} berhasil dihapus.`);
    setShowDeleteBorrowingModal(null);
  };

  const handleReturnBook = async (id: string) => {
    const item = borrowings.find((b) => b.id === id);
    if (!item) return;

    setBorrowings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: 'DIKEMBALIKAN', returnDate: new Date().toISOString().split('T')[0] } : b
      )
    );

    setBooks((prev) =>
      prev.map((b) => (b.title === item.bookTitle ? { ...b, available: Math.min(b.available + 1, b.stock) } : b))
    );

    try {
      await libraryService.returnBook(id);
    } catch (err) {
      console.warn('Backend return book API failed:', err);
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Pengembalian Buku Perpustakaan',
      module: 'Perpustakaan',
      severity: 'SUCCESS',
      details: `Konfirmasi pengembalian buku "${item.bookTitle}" oleh ${item.studentName}`,
    });

    toast.success('Pengembalian Dikonfirmasi', `Buku "${item.bookTitle}" telah berhasil dikembalikan.`);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Header Page Title & Responsive Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100/80 text-emerald-800 border border-emerald-200/80">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Perpustakaan &amp; Katalog Buku
            </h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5 pl-0 sm:pl-8">
            Kelola koleksi perpustakaan, sirkulasi peminjaman siswa, dan kategori buku secara terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateBorrowing}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs font-extrabold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Catat Peminjaman</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-extrabold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Buku Baru</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards — Compact Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-2xl"></div>
          <div className="flex items-center justify-between pl-1">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Koleksi</span>
              <p className="text-xl font-black text-slate-900 tracking-tight">{books.length} Judul</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>{totalStockSum} eksemplar ({totalAvailableSum} siap pinjam)</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 rounded-l-2xl"></div>
          <div className="flex items-center justify-between pl-1">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sedang Dipinjam</span>
              <p className="text-xl font-black text-amber-700 tracking-tight">{activeBorrowings.length} Buku</p>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Beredar aktif pada siswa</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 rounded-l-2xl"></div>
          <div className="flex items-center justify-between pl-1">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terlambat Kembali</span>
              <p className="text-xl font-black text-rose-700 tracking-tight">{overdueBorrowings.length} Buku</p>
              <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-semibold pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                <span>Memerlukan penagihan</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'books', l: 'Katalog Buku', c: books.length },
            { id: 'borrowings', l: 'Peminjaman', c: borrowings.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id as any);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                tab === t.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{t.l}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${tab === t.id ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {t.c}
              </span>
            </button>
          ))}
        </div>

        {tab === 'books' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600" />
              <input
                type="text"
                placeholder="Cari judul, pengarang, ISBN..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-emerald-200/90 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs shrink-0">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={filterCat}
                onChange={(e) => {
                  setFilterCat(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tab Content: Tight & Compact Grid Card Book Catalog */}
      {tab === 'books' && (
        <div className="space-y-4">
          {paginatedBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {paginatedBooks.map((b) => {
                const availPct = Math.round((b.available / b.stock) * 100);
                const isOut = b.available === 0;

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Book Card Header Cover & Badges */}
                    <div className="p-3.5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
                      <div className="flex gap-3 items-start">
                        {/* Cover Image */}
                        <div className="w-20 h-28 rounded-xl bg-slate-100 border border-slate-200/90 shrink-0 overflow-hidden shadow-2xs relative group-hover:scale-102 transition-transform duration-200 flex items-center justify-center">
                          {b.cover ? (
                            <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-300 p-1.5 text-center">
                              <BookOpen className="w-6 h-6 mb-0.5" />
                              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">SMP DU</span>
                            </div>
                          )}
                        </div>

                        {/* Title, Category & Author Details */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-extrabold truncate">
                              {b.category}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                              {b.location || 'Rak A-01'}
                            </span>
                          </div>

                          <h3 className="text-xs font-extrabold text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                            {b.title}
                          </h3>

                          <p className="text-[11px] text-slate-500 font-semibold truncate">
                            {b.author}
                          </p>

                          <p className="text-[10px] text-slate-400 font-medium">
                            {b.publisher} ({b.year})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stock Progress & Availability Indicators */}
                    <div className="p-3 space-y-2 bg-white">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className="text-slate-500">Stok Tersedia</span>
                          <span className={isOut ? 'text-rose-600 font-extrabold' : 'text-emerald-700 font-extrabold'}>
                            {b.available} / {b.stock} eksemplar
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isOut ? 'bg-rose-500' : availPct < 30 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${availPct}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-0.5 border-t border-slate-100">
                        <span>ISBN: <strong className="text-slate-600 font-semibold">{b.isbn}</strong></span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${isOut ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                          {isOut ? 'Habis' : 'Tersedia'}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => setShowBorrowModal(b)}
                        disabled={isOut}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs disabled:opacity-40 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <BookCheck className="w-3.5 h-3.5" />
                        <span>Pinjamkan</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
                        title="Edit Buku"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setShowDeleteBookModal(b)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 shadow-2xs transition-colors cursor-pointer"
                        title="Hapus Buku"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 space-y-2">
              <BookOpen className="w-9 h-9 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Tidak ada buku dalam katalog</p>
              <p className="text-[11px] text-slate-400">Coba ubah kata kunci pencarian atau filter kategori di atas.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Borrowings (Peminjaman) Transaksi dengan Aksi Edit & Hapus */}
      {tab === 'borrowings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <input
                type="text"
                placeholder="Cari nama siswa, NIS, atau judul buku..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-emerald-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              onClick={handleOpenCreateBorrowing}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Catat Peminjaman</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">JUDUL BUKU</th>
                  <th className="px-4 py-3">PEMINJAM</th>
                  <th className="px-4 py-3">TGL PINJAM</th>
                  <th className="px-4 py-3">TENGGAT</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBorrowings.length > 0 ? (
                  paginatedBorrowings.map((br) => (
                    <tr key={br.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-slate-900">{br.bookTitle}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-slate-900">{br.studentName}</p>
                        <p className="text-[11px] text-slate-400 font-medium">NIS: {br.studentNis} · Kelas {br.studentClass}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                        {br.borrowDate}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                        {br.dueDate}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            br.status === 'DIKEMBALIKAN'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : br.status === 'TERLAMBAT'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {br.status === 'DIKEMBALIKAN'
                            ? 'Dikembalikan'
                            : br.status === 'TERLAMBAT'
                            ? 'Terlambat'
                            : 'Dipinjam'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {br.status !== 'DIKEMBALIKAN' && (
                            <button
                              onClick={() => handleReturnBook(br.id)}
                              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                              title="Kembalikan Buku"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Kembalikan
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditBorrowing(br)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Edit Data Peminjaman"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteBorrowingModal(br)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Hapus Record Peminjaman"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500 font-medium">
                      Tidak ada data transaksi peminjaman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-2xl text-xs font-semibold text-slate-500 border border-slate-200/80">
        <p>
          Menampilkan Halaman <strong className="text-slate-900">{currentPage}</strong> dari{' '}
          <strong className="text-slate-900">{totalPages}</strong>
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal: Catat Peminjaman Baru */}
      {showCreateBorrowingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" /> Catat Peminjaman Baru
              </h3>
              <button onClick={() => setShowCreateBorrowingModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewBorrowing} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pilih Buku yang Dipinjam</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {books.filter(b => b.available > 0).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Sisa Stok: {b.available})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Siswa Peminjam</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ahmad Rizki Pratama"
                  value={borrowStudentName}
                  onChange={(e) => setBorrowStudentName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">NIS Siswa</label>
                  <input
                    type="text"
                    required
                    placeholder="2026001"
                    value={borrowNis}
                    onChange={(e) => setBorrowNis(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={borrowClass}
                    onChange={(e) => setBorrowClass(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="7A">Kelas 7A</option>
                    <option value="7B">Kelas 7B</option>
                    <option value="8A">Kelas 8A</option>
                    <option value="8B">Kelas 8B</option>
                    <option value="9A">Kelas 9A</option>
                    <option value="9B">Kelas 9B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tenggat Pengembalian</label>
                <input
                  type="date"
                  required
                  value={borrowDueDate}
                  onChange={(e) => setBorrowDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateBorrowingModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Proses Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Peminjaman */}
      {showDeleteBorrowingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                Hapus Record Peminjaman
              </h3>
              <button onClick={() => setShowDeleteBorrowingModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-900">{showDeleteBorrowingModal.bookTitle}</p>
              <p className="text-xs text-slate-500 font-medium">
                Peminjam: {showDeleteBorrowingModal.studentName} (NIS: {showDeleteBorrowingModal.studentNis})
              </p>
            </div>

            <p className="text-xs font-medium text-slate-600">
              Apakah Anda yakin ingin menghapus catatan peminjaman ini? Jika buku belum dikembalikan, stok buku akan dikembalikan otomatis.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteBorrowingModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBorrowing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Hapus Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Peminjaman */}
      {editingBorrowing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                Edit Data Peminjaman
              </h3>
              <button onClick={() => setEditingBorrowing(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/80">
              <p className="text-xs font-bold text-slate-900">{editingBorrowing.bookTitle}</p>
            </div>

            <form onSubmit={handleSaveEditBorrowing} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Siswa Peminjam</label>
                <input
                  type="text"
                  required
                  value={borrowStudentName}
                  onChange={(e) => setBorrowStudentName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">NIS Siswa</label>
                  <input
                    type="text"
                    required
                    value={borrowNis}
                    onChange={(e) => setBorrowNis(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={borrowClass}
                    onChange={(e) => setBorrowClass(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="7A">Kelas 7A</option>
                    <option value="7B">Kelas 7B</option>
                    <option value="8A">Kelas 8A</option>
                    <option value="8B">Kelas 8B</option>
                    <option value="9A">Kelas 9A</option>
                    <option value="9B">Kelas 9B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tenggat Kembali</label>
                  <input
                    type="date"
                    required
                    value={borrowDueDate}
                    onChange={(e) => setBorrowDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={borrowStatus}
                    onChange={(e) => setBorrowStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="DIPINJAM">Dipinjam</option>
                    <option value="TERLAMBAT">Terlambat</option>
                    <option value="DIKEMBALIKAN">Dikembalikan</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBorrowing(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Pembaruan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Buku */}
      {showDeleteBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                Konfirmasi Hapus Buku
              </h3>
              <button onClick={() => setShowDeleteBookModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-900">{showDeleteBookModal.title}</p>
              <p className="text-xs text-slate-500 font-medium">
                Pengarang: {showDeleteBookModal.author} · Kategori: {showDeleteBookModal.category}
              </p>
            </div>

            <p className="text-xs font-medium text-slate-600">
              Apakah Anda yakin ingin menghapus buku ini dari katalog perpustakaan?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteBookModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBook}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Hapus Buku
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit Koleksi Buku dengan Custom Category */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" /> {editingBook ? 'Edit Data Buku' : 'Tambah Koleksi Buku Baru'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sampul / Cover Buku</label>
                <CustomImageUploader
                  value={newCover}
                  onChange={(url) => setNewCover(url)}
                  endpoint="newsImage"
                  aspectRatio="portrait"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Buku</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Fisika Dasar untuk SMP Kelas 7"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pengarang / Penulis</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Bambang Sutrisno"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Custom Category Selection & Input Container */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Kategori Buku</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategoryMode(!isCustomCategoryMode);
                        if (!isCustomCategoryMode) {
                          setNewCategory('CUSTOM');
                        } else {
                          setNewCategory(categories[0] || 'Sains');
                        }
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer underline flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {isCustomCategoryMode ? 'Pilih dari List' : '+ Custom Kategori'}
                    </button>
                  </div>

                  {!isCustomCategoryMode ? (
                    <select
                      value={newCategory}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') {
                          setIsCustomCategoryMode(true);
                        } else {
                          setNewCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="CUSTOM">+ Tambah Kategori Custom...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Ketik nama kategori baru..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/50 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:font-normal"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Penerbit</label>
                  <input
                    type="text"
                    placeholder="Erlangga"
                    value={newPublisher}
                    onChange={(e) => setNewPublisher(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tahun Terbit</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stok Fisik</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingBook ? 'Simpan Pembaruan' : 'Tambah Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pinjamkan Buku dari Card */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                Pencatatan Peminjaman Buku
              </h3>
              <button onClick={() => setShowBorrowModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-900">{showBorrowModal.title}</p>
              <p className="text-xs text-slate-500 font-medium">Pengarang: {showBorrowModal.author}</p>
              <p className="text-xs text-emerald-700 font-bold pt-1">Sisa Stok: {showBorrowModal.available} eksemplar</p>
            </div>

            <form onSubmit={handleCreateBorrowing} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Siswa Peminjam</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ahmad Rizki Pratama"
                  value={borrowStudentName}
                  onChange={(e) => setBorrowStudentName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">NIS Siswa</label>
                  <input
                    type="text"
                    required
                    placeholder="2026001"
                    value={borrowNis}
                    onChange={(e) => setBorrowNis(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={borrowClass}
                    onChange={(e) => setBorrowClass(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="7A">Kelas 7A</option>
                    <option value="7B">Kelas 7B</option>
                    <option value="8A">Kelas 8A</option>
                    <option value="8B">Kelas 8B</option>
                    <option value="9A">Kelas 9A</option>
                    <option value="9B">Kelas 9B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tenggat Pengembalian</label>
                <input
                  type="date"
                  required
                  value={borrowDueDate}
                  onChange={(e) => setBorrowDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Proses Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
