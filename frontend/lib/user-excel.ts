import * as XLSX from 'xlsx';

export interface StudentExcelRow {
  id?: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  class: string;
  birthPlace?: string;
  birthDate?: string;
  religion?: string;
  phone?: string;
  address?: string;
  status?: boolean;
  enrolled?: string;
  isAlumni?: boolean;
  graduationYear?: string;
}

export interface TeacherExcelRow {
  id?: string;
  nip: string;
  name: string;
  category: 'Guru' | 'Tendik';
  role: string;
  subject: string;
  phone: string;
  email?: string;
  status?: boolean;
  joined?: string;
  photoUrl?: string;
}

// ─── DOWNLOAD TEMPLATE EXCEL SISWA ───────────────────────────────────────────
export function downloadSiswaTemplate() {
  const headers = [
    ['NISN', 'NIPD_NIS', 'Nama Lengkap', 'Jenis Kelamin (L/P)', 'Kelas', 'Tempat Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'Agama', 'No HP / WA', 'Alamat']
  ];
  const sampleRows = [
    ['0123456789', '2024001', 'Ahmad Evan Fajar Albaqi', 'L', '7A', 'Surabaya', '2011-05-12', 'Islam', '081234567890', 'Jl. Darul Ulum No. 10'],
    ['0123456790', '2024002', 'Aisyah Rahma Asmara Putri', 'P', '7A', 'Sidoarjo', '2011-08-20', 'Islam', '082345678901', 'Jl. Ahmad Yani No. 45'],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleRows]);

  ws['!cols'] = [
    { wch: 15 }, { wch: 14 }, { wch: 30 }, { wch: 20 },
    { wch: 10 }, { wch: 16 }, { wch: 25 }, { wch: 12 },
    { wch: 16 }, { wch: 35 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
  XLSX.writeFile(wb, 'Template_Import_Siswa_SMP_Darul_Ulum.xlsx');
}

// ─── DOWNLOAD TEMPLATE EXCEL GURU & TENDIK ───────────────────────────────────
export function downloadGuruTemplate() {
  const headers = [
    ['NIP / NUPTK', 'Nama Lengkap & Gelar', 'Kategori (Guru/Tendik)', 'Jabatan / Peran', 'Mata Pelajaran / Bidang', 'No HP / WA', 'Email']
  ];
  const sampleRows = [
    ['198501152010011002', 'Khusnul Khotimah, S.Pd.', 'Guru', 'Kepala Sekolah', 'Manajemen Sekolah', '081234567890', 'khusnul@smpdarululum.sch.id'],
    ['199403122020011005', 'Muhammad Ridwan, S.Kom.', 'Tendik', 'Kepala Tata Usaha', 'Administrasi & IT', '085678901234', 'ridwan@smpdarululum.sch.id'],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleRows]);

  ws['!cols'] = [
    { wch: 22 }, { wch: 32 }, { wch: 22 }, { wch: 22 },
    { wch: 26 }, { wch: 16 }, { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template Guru');
  XLSX.writeFile(wb, 'Template_Import_Guru_Tendik_SMP_Darul_Ulum.xlsx');
}

// ─── EXPORT EXCEL SISWA ──────────────────────────────────────────────────────
export function exportSiswaExcel(students: StudentExcelRow[], filename = 'Data_Siswa_SMP_Darul_Ulum.xlsx') {
  const headers = [['No', 'NISN', 'NIPD/NIS', 'Nama Siswa', 'Kelas', 'L/P', 'Tgl Lahir', 'Agama', 'No. HP', 'Status']];
  const rows = students.map((s, idx) => [
    idx + 1,
    s.nisn || '-',
    s.nis || '-',
    s.name,
    s.class || '-',
    s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    s.birthDate || '-',
    s.religion || 'Islam',
    s.phone || '-',
    s.status !== false ? 'Aktif' : 'Non-aktif',
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 30 },
    { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
    { wch: 16 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
  XLSX.writeFile(wb, filename);
}

// ─── EXPORT EXCEL GURU ───────────────────────────────────────────────────────
export function exportGuruExcel(teachers: TeacherExcelRow[], filename = 'Data_Guru_Tendik_SMP_Darul_Ulum.xlsx') {
  const headers = [['No', 'NIP / NUPTK', 'Nama & Gelar', 'Kategori', 'Jabatan / Peran', 'Mata Pelajaran', 'No. HP', 'Status']];
  const rows = teachers.map((g, idx) => [
    idx + 1,
    g.nip || '-',
    g.name,
    g.category,
    g.role,
    g.subject,
    g.phone || '-',
    g.status !== false ? 'Aktif' : 'Non-aktif',
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
  ws['!cols'] = [
    { wch: 6 }, { wch: 22 }, { wch: 32 }, { wch: 12 },
    { wch: 22 }, { wch: 26 }, { wch: 16 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Guru & Tendik');
  XLSX.writeFile(wb, filename);
}

// ─── PARSE EXCEL / CSV FILE ──────────────────────────────────────────────────
export async function parseExcelFile<T = any>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<T>(worksheet, { defval: '' });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
