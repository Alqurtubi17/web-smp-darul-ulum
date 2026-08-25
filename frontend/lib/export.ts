// ─── EXPORT UTILITIES ─────────────────────────────────────────────────────────
// PDF Rapor + Excel export — client-side, tanpa server

// ══════════════════════════════════════════════════════════════════════════════
// PDF RAPOR SISWA (jsPDF + jsPDF-autotable)
// ══════════════════════════════════════════════════════════════════════════════

export async function generateRaporPDF(data: {
  student: { fullName: string; nis: string; class: string; };
  semester: number;
  academicYear: string;
  grades: { subject: string; tasks: number | null; uts: number | null; uas: number | null; avg: number; grade: string; }[];
  attendance: { hadir: number; izin: number; sakit: number; alpha: number; total: number; };
  teacherName: string;
  principalName: string;
}) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(22, 101, 52); // green-800
  doc.rect(0, 0, W, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SMP DARUL ULUM SURABAYA', W / 2, 12, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Jl. Raya Darul Ulum No. 1, Surabaya, Jawa Timur', W / 2, 18, { align: 'center' });
  doc.text('Telp: (031) XXX-XXXX | info@smpdarululum.sch.id', W / 2, 23, { align: 'center' });

  // ── Title ─────────────────────────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('LAPORAN HASIL BELAJAR SISWA', W / 2, 42, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Semester ${data.semester === 1 ? 'Ganjil' : 'Genap'} Tahun Pelajaran ${data.academicYear}`, W / 2, 49, { align: 'center' });

  // ── Garis ─────────────────────────────────────────────────────────────────
  doc.setDrawColor(22, 101, 52);
  doc.setLineWidth(0.5);
  doc.line(margin, 53, W - margin, 53);

  // ── Info Siswa ────────────────────────────────────────────────────────────
  let y = 58;
  const leftInfo = [
    ['Nama Siswa', data.student.fullName],
    ['NIS', data.student.nis],
    ['Kelas', data.student.class],
  ];
  doc.setFontSize(9);
  leftInfo.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}`, margin, y);
    doc.text(':', margin + 28, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val, margin + 32, y);
    y += 5;
  });

  // ── Tabel Nilai ───────────────────────────────────────────────────────────
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [['No', 'Mata Pelajaran', 'Tugas', 'UTS', 'UAS', 'Rata-rata', 'Predikat']],
    body: data.grades.map((g, i) => [
      i + 1,
      g.subject,
      g.tasks !== null ? g.tasks.toFixed(0) : '-',
      g.uts !== null ? g.uts.toFixed(0) : '-',
      g.uas !== null ? g.uas.toFixed(0) : '-',
      g.avg.toFixed(1),
      g.grade,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center', fontStyle: 'bold' },
      6: { halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // ── Kehadiran ─────────────────────────────────────────────────────────────
  const pct = Math.round((data.attendance.hadir / data.attendance.total) * 100);
  autoTable(doc, {
    startY: y,
    head: [['Keterangan Kehadiran', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Total', '%']],
    body: [['Jumlah Hari', data.attendance.hadir, data.attendance.izin, data.attendance.sakit, data.attendance.alpha, data.attendance.total, `${pct}%`]],
    theme: 'grid',
    headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, halign: 'center' },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Tanda Tangan ──────────────────────────────────────────────────────────
  const sigY = y;
  const cols = [margin, W / 2 - 10];
  ['Wali Kelas', 'Kepala Sekolah'].forEach((title, i) => {
    const x = cols[i];
    const name = i === 0 ? data.teacherName : data.principalName;
    doc.setFontSize(8);
    doc.text(title, x + 20, sigY, { align: 'center' });
    doc.text(name, x + 20, sigY + 22, { align: 'center' });
    doc.setDrawColor(100);
    doc.setLineWidth(0.3);
    doc.line(x, sigY + 24, x + 40, sigY + 24);
  });

  // ── Save ──────────────────────────────────────────────────────────────────
  doc.save(`Rapor_${data.student.fullName.replace(/\s+/g, '_')}_Sem${data.semester}_${data.academicYear.replace('/', '')}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT EXCEL — Nilai & SPP
// ══════════════════════════════════════════════════════════════════════════════

export async function exportNilaiExcel(data: {
  className: string;
  subject: string;
  gradeType: string;
  rows: { nis: string; name: string; score: number | null; }[];
}) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const headers = [['NIS', 'Nama Siswa', 'Nilai', 'Keterangan']];
  const rows = data.rows.map((r) => [
    r.nis,
    r.name,
    r.score ?? '-',
    r.score !== null ? (r.score >= 75 ? 'Tuntas' : 'Remidi') : '-',
  ]);
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);

  ws['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Nilai');
  XLSX.writeFile(wb, `Nilai_${data.className}_${data.subject}_${data.gradeType}.xlsx`);
}

export async function exportSPPExcel(data: {
  month: string;
  rows: { nis: string; name: string; class: string; amount: number; status: string; paidAt?: string; }[];
}) {
  const XLSX = await import('xlsx');
  const rp = (n: number) => new Intl.NumberFormat('id-ID').format(n);
  const wb = XLSX.utils.book_new();

  const headers = [['NIS', 'Nama Siswa', 'Kelas', 'Tagihan', 'Status', 'Tanggal Bayar']];
  const rows = data.rows.map((r) => [r.nis, r.name, r.class, rp(r.amount), r.status, r.paidAt || '-']);
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, 'SPP');
  XLSX.writeFile(wb, `SPP_${data.month}.xlsx`);
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT ABSENSI RESMI MULTI-SHEET DENGAN BORDER THIN DUA-ARAH & SHADING (EXCELJS)
// ══════════════════════════════════════════════════════════════════════════════

interface StudentAbsenceSample {
  nis: string;
  name: string;
  gender: 'L' | 'P';
}

const CLASS_STUDENTS_MOCK: Record<string, StudentAbsenceSample[]> = {
  '8B': [
    { nis: '7642', name: 'AHMAD FAJRI KURNIAWAN', gender: 'L' },
    { nis: '7655', name: 'AMELIA RAHMAWATI', gender: 'P' },
    { nis: '7658', name: 'ANGGARA SETYA PRATAMA', gender: 'L' },
    { nis: '7663', name: 'ARINI YESINIA PUTRI', gender: 'P' },
    { nis: '7671', name: 'CHINTYA EKA PUTRI ARIYANI', gender: 'P' },
    { nis: '7685', name: 'DYANDRA HILDAN TAUFIKURRAHMAN', gender: 'L' },
    { nis: '7696', name: 'GADIS PRAMANINGTYAS SUSANTO', gender: 'P' },
    { nis: '7707', name: 'JEFRI JUNI WARDANA', gender: 'L' },
    { nis: '7708', name: 'JIHAN ANGGREANI', gender: 'P' },
    { nis: '7709', name: 'KEYZHA RATU HERBA BERLIANA', gender: 'P' },
    { nis: '7713', name: 'M NAIRUSZ REFALDI AL BAIHAQQI', gender: 'L' },
    { nis: '7717', name: 'M. ZUSRO', gender: 'L' },
    { nis: '7725', name: 'MOCH YAZID AL BUSTOMI', gender: 'L' },
    { nis: '7727', name: 'MOCH. ROBET NASRULLAH', gender: 'L' },
    { nis: '7749', name: 'MUHAMMAD AGUNG RAMADHANI', gender: 'L' },
    { nis: '7752', name: 'MUHAMMAD DHARMANSYAH PUTRA', gender: 'L' },
    { nis: '7759', name: 'MUHAMMAD IRSYAD', gender: 'L' },
    { nis: '7766', name: 'MUHAMMAD RIZKY ADITIYA', gender: 'L' },
    { nis: '7779', name: 'NAJMA LAILATUZKAHIRO HAFIDA', gender: 'P' },
    { nis: '7783', name: 'NAYLA LAILATUL MAQFIROH', gender: 'P' },
    { nis: '7785', name: 'NAZWA MAILIKA AZZAHRA', gender: 'P' },
    { nis: '7792', name: 'NUR AISYAH CHANIF', gender: 'P' },
    { nis: '7799', name: 'RAYSYAH PUTRI AZ-ZAHRA', gender: 'P' },
    { nis: '7800', name: 'REHANDIKA DWI PUTRA', gender: 'L' },
    { nis: '7816', name: 'SINTIA EKA ROMADHONI', gender: 'P' },
    { nis: '7821', name: 'SYIFA DEWI AZZAHRA', gender: 'P' },
    { nis: '7823', name: 'THALITA PRAMESWARI', gender: 'P' },
    { nis: '7824', name: 'TRISTAN MARVELINO PRASETYO', gender: 'L' },
    { nis: '7828', name: 'WAFIYUL AHDI', gender: 'L' },
    { nis: '7831', name: 'YULIANA IFATUN NISA', gender: 'P' },
    { nis: '7838', name: 'ZUNI CHILMIYATUR R.', gender: 'P' },
    { nis: '7847', name: 'MUHAMMAD ALVIN UMAM FIRMANSYAH', gender: 'L' },
  ],
  '7A': [
    { nis: '7501', name: 'ABDULLAH AZZAM', gender: 'L' },
    { nis: '7502', name: 'AISYAH AQILA', gender: 'P' },
    { nis: '7503', name: 'BILAL RAMADHAN', gender: 'L' },
    { nis: '7504', name: 'CITRA LESTARI', gender: 'P' },
    { nis: '7505', name: 'DAFFA AFRIZAL', gender: 'L' },
  ],
  '7B': [
    { nis: '7550', name: 'DANI SATRIA', gender: 'L' },
    { nis: '7551', name: 'EVA NURMALASARI', gender: 'P' },
    { nis: '7552', name: 'FAJAR SHIDDIQ', gender: 'L' },
  ],
  '8A': [
    { nis: '7601', name: 'FARHAN MAULANA', gender: 'L' },
    { nis: '7602', name: 'GITA KUSUMA', gender: 'P' },
    { nis: '7603', name: 'HAFIDZ SYAHPUTRA', gender: 'L' },
  ],
  '9A': [
    { nis: '7701', name: 'IRFAN BACHDIM', gender: 'L' },
    { nis: '7702', name: 'JASMINE MAHARANI', gender: 'P' },
  ],
  '9B': [
    { nis: '7801', name: 'KEVIN SANJAYA', gender: 'L' },
    { nis: '7802', name: 'LANI TRIANA', gender: 'P' },
  ],
};

const TEACHERS_BY_CLASS: Record<string, { teacher: string; counselor: string }> = {
  '8B': { teacher: 'Dra Sri Wijayanti, S.Pd.', counselor: 'M Thoha F, S.Pd.' },
  '7A': { teacher: 'Drs. H. M. Ridwan, M.Pd.', counselor: 'Siti Aminah, S.Pd.' },
  '7B': { teacher: 'Endang Rahayu, S.Pd.', counselor: 'M Thoha F, S.Pd.' },
  '8A': { teacher: 'Budi Santoso, S.Pd.', counselor: 'Siti Aminah, S.Pd.' },
  '9A': { teacher: 'Ahmad Dahlan, M.Pd.', counselor: 'M Thoha F, S.Pd.' },
  '9B': { teacher: 'Nur Hasanah, S.Pd.', counselor: 'Siti Aminah, S.Pd.' },
};

const thinBorder = {
  top: { style: 'thin' as const, color: { argb: 'FF000000' } },
  left: { style: 'thin' as const, color: { argb: 'FF000000' } },
  bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
  right: { style: 'thin' as const, color: { argb: 'FF000000' } },
};

const yellowFill = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FFFEF08A' }, // Soft yellow shading for JML
};

const grayHeaderFill = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FFF1F5F9' }, // Light gray header
};

export async function exportAbsensiExcel(data?: { className?: string; month?: string; rows?: any[] }) {
  const ExcelJS = await import('exceljs');
  const wb = new ExcelJS.Workbook();

  const classKeys = ['7A', '7B', '8A', '8B', '9A', '9B'];

  classKeys.forEach((clsKey) => {
    const students = CLASS_STUDENTS_MOCK[clsKey] || CLASS_STUDENTS_MOCK['7A'];
    const staff = TEACHERS_BY_CLASS[clsKey] || { teacher: 'Wali Kelas S.Pd.', counselor: 'Konselor S.Pd.' };

    const ws = wb.addWorksheet(`Kelas ${clsKey}`, {
      views: [{ showGridLines: true }],
    });

    // Set Landscape Page Setup
    ws.pageSetup = {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      margins: { left: 0.25, right: 0.25, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    };

    // ── Row 1, 2, 3: Header Kop Utama ─────────────────────────────────────────
    ws.getCell('A1').value = 'PROSENTASE KETIDAK HADIRAN SISWA';
    ws.getCell('A2').value = 'SMP DARUL ULUM SURABAYA';
    ws.getCell('A3').value = 'TAHUN PELAJARAN 2026 / 2027';

    ['A1:AH1', 'A2:AH2', 'A3:AH3'].forEach((range) => {
      ws.mergeCells(range);
      const c = ws.getCell(range.split(':')[0]);
      c.font = { name: 'Calibri', size: 11, bold: true };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // ── Row 5, 6: Metadata Info Kelas & Pengampu ──────────────────────────────
    ws.getCell('A5').value = 'KELAS : ' + clsKey;
    ws.getCell('Y5').value = 'SEMESTER : GANJIL';
    ws.getCell('A6').value = 'WALI KELAS : ' + staff.teacher;
    ws.getCell('Y6').value = 'KONSELOR : ' + staff.counselor;

    ['A5', 'A6', 'Y5', 'Y6'].forEach((pos) => {
      const c = ws.getCell(pos);
      c.font = { name: 'Calibri', size: 10, bold: true };
    });

    // ── Row 8, 9, 10: Header Tabel Bertingkat ──────────────────────────────────
    ws.getCell('A8').value = 'NO';
    ws.getCell('B8').value = 'INDUK';
    ws.getCell('C8').value = 'NAMA';
    ws.getCell('D8').value = 'L/P';

    ws.getCell('E8').value = 'JUMLAH KETIDAK HADIRAN';
    ws.mergeCells('E8:AB8');

    // Months (Row 9 - EYD standard)
    const months = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    months.forEach((m, idx) => {
      const colStart = 5 + idx * 4; // E=5, I=9, M=13, Q=17, U=21, Y=25
      const colEnd = colStart + 3;
      ws.mergeCells(9, colStart, 9, colEnd); // Row 9 (1-based!)
      const c = ws.getCell(9, colStart);
      c.value = m;
    });

    // Month Detail Headers S, I, A, JML (Row 10)
    for (let m = 0; m < 6; m++) {
      const base = 5 + m * 4;
      ws.getCell(10, base).value = 'S';
      ws.getCell(10, base + 1).value = 'I';
      ws.getCell(10, base + 2).value = 'A';
      ws.getCell(10, base + 3).value = 'JML';
    }

    // Totals Headers (Header AC8: "JUMLAH" sesuai instruksi pengguna)
    ws.getCell('AC8').value = 'JUMLAH';
    ws.mergeCells('AC8:AE8');
    ws.getCell('AC9').value = 'TOTAL';
    ws.mergeCells('AC9:AE9');
    ws.getCell('AC10').value = 'S';
    ws.getCell('AD10').value = 'I';
    ws.getCell('AE10').value = 'A';

    ws.getCell('AF8').value = 'JML TOTAL';
    ws.getCell('AG8').value = 'Jml Tdk Hadir';
    ws.getCell('AH8').value = 'Jml Prosentase Hadir (%)';

    // Vertical Merges for Main Headers
    ws.mergeCells('A8:A10');
    ws.mergeCells('B8:B10');
    ws.mergeCells('C8:C10');
    ws.mergeCells('D8:D10');
    ws.mergeCells('AF8:AF10');
    ws.mergeCells('AG8:AG10');
    ws.mergeCells('AH8:AH10');

    // Format Headers (Row 8 to 10)
    for (let r = 8; r <= 10; r++) {
      for (let c = 1; c <= 34; c++) {
        const cell = ws.getCell(r, c);
        cell.font = { name: 'Calibri', size: 9, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.fill = grayHeaderFill;
        cell.border = thinBorder;
      }
    }

    // Highlight JML Header Cells in Light Yellow
    [8, 12, 16, 20, 24, 28, 32].forEach((colIdx) => {
      ws.getCell(10, colIdx).fill = yellowFill;
    });

    let sumS = 0;
    let sumI = 0;
    let sumA = 0;
    let sumAllTdkHadir = 0;

    // ── Row 11+: Student Rows ──────────────────────────────────────────────────
    students.forEach((st, idx) => {
      const rIdx = 11 + idx;
      const hash = parseInt(st.nis, 10) || 100;
      const s_jul = hash % 3 === 0 ? 1 : 0;
      const i_jul = hash % 5 === 0 ? 1 : 0;
      const a_jul = 0;
      const jml_jul = s_jul + i_jul + a_jul;

      const s_agu = hash % 2 === 0 ? 1 : 0;
      const i_agu = hash % 7 === 0 ? 1 : 0;
      const a_agu = hash % 11 === 0 ? 1 : 0;
      const jml_agu = s_agu + i_agu + a_agu;

      const s_sep = hash % 4 === 0 ? 1 : 0;
      const i_sep = hash % 6 === 0 ? 1 : 0;
      const a_sep = 0;
      const jml_sep = s_sep + i_sep + a_sep;

      const s_okt = 0; const i_okt = 0; const a_okt = 0; const jml_okt = 0;
      const s_nov = 0; const i_nov = 0; const a_nov = 0; const jml_nov = 0;
      const s_des = 0; const i_des = 0; const a_des = 0; const jml_des = 0;

      const total_s = s_jul + s_agu + s_sep + s_okt + s_nov + s_des;
      const total_i = i_jul + i_agu + i_sep + i_okt + i_nov + i_des;
      const total_a = a_jul + a_agu + a_sep + a_okt + a_nov + a_des;
      const total_absent = total_s + total_i + total_a;
      const effectiveDays = 100;
      const pctHadir = Math.round(((effectiveDays - total_absent) / effectiveDays) * 100);

      sumS += total_s;
      sumI += total_i;
      sumA += total_a;
      sumAllTdkHadir += total_absent;

      ws.getCell(rIdx, 1).value = idx + 1;
      ws.getCell(rIdx, 2).value = Number(st.nis) || st.nis;
      ws.getCell(rIdx, 3).value = st.name;
      ws.getCell(rIdx, 4).value = st.gender;

      // Months S/I/A/JML values
      const vals = [
        s_jul, i_jul, a_jul, jml_jul,
        s_agu, i_agu, a_agu, jml_agu,
        s_sep, i_sep, a_sep, jml_sep,
        s_okt, i_okt, a_okt, jml_okt,
        s_nov, i_nov, a_nov, jml_nov,
        s_des, i_des, a_des, jml_des,
        total_s, total_i, total_a,
        total_absent, total_absent, pctHadir
      ];

      vals.forEach((v, i) => {
        ws.getCell(rIdx, 5 + i).value = v || '';
      });

      // Format Student Row Cells with Thin Borders & Alignments
      for (let c = 1; c <= 34; c++) {
        const cell = ws.getCell(rIdx, c);
        cell.font = { name: 'Calibri', size: 9 };
        cell.border = thinBorder;
        cell.alignment = {
          horizontal: c === 3 ? 'left' : 'center',
          vertical: 'middle',
        };
      }

      // Yellow Fill on JML Columns H, L, P, T, X, AB
      [8, 12, 16, 20, 24, 28].forEach((colIdx) => {
        if (ws.getCell(rIdx, colIdx).value !== '') {
          ws.getCell(rIdx, colIdx).fill = yellowFill;
        }
      });
    });

    // ── Summary Rows ──────────────────────────────────────────────────────────
    const summaryRow1 = 11 + students.length;
    const summaryRow2 = summaryRow1 + 1;
    const summaryRow3 = summaryRow1 + 2;

    const avgPctHadir = Math.round(100 - (sumAllTdkHadir / (students.length * 100)) * 100);
    const avgPctTdkHadir = 100 - avgPctHadir;

    // JUMLAH
    ws.getCell(summaryRow1, 1).value = 'JUMLAH';
    ws.mergeCells(summaryRow1, 1, summaryRow1, 4);
    ws.getCell(summaryRow1, 29).value = sumS;
    ws.getCell(summaryRow1, 30).value = sumI;
    ws.getCell(summaryRow1, 31).value = sumA;
    ws.getCell(summaryRow1, 32).value = sumAllTdkHadir;
    ws.getCell(summaryRow1, 33).value = sumAllTdkHadir;

    // Prosentase Ketidakhadiran
    ws.getCell(summaryRow2, 1).value = 'Prosentase Ketidakhadiran';
    ws.mergeCells(summaryRow2, 1, summaryRow2, 4);
    ws.getCell(summaryRow2, 33).value = `${avgPctTdkHadir}%`;

    // Prosentase Kehadiran
    ws.getCell(summaryRow3, 1).value = 'Prosentase Kehadiran';
    ws.mergeCells(summaryRow3, 1, summaryRow3, 4);
    ws.getCell(summaryRow3, 34).value = `${avgPctHadir}%`;

    // Format Summary Cells with Thin Borders & Bold Text
    [summaryRow1, summaryRow2, summaryRow3].forEach((r) => {
      for (let c = 1; c <= 34; c++) {
        const cell = ws.getCell(r, c);
        cell.font = { name: 'Calibri', size: 9, bold: true };
        cell.border = thinBorder;
        cell.alignment = { horizontal: c <= 4 ? 'left' : 'center', vertical: 'middle' };
      }
    });

    // ── Signature Block ───────────────────────────────────────────────────────
    const sigRow1 = summaryRow3 + 2;
    ws.getCell(sigRow1, 29).value = 'Surabaya, 31 Agustus 2026';
    ws.mergeCells(sigRow1, 29, sigRow1, 34);

    ws.getCell(sigRow1 + 1, 29).value = `Wali Kelas ${clsKey}`;
    ws.mergeCells(sigRow1 + 1, 29, sigRow1 + 1, 34);

    ws.getCell(sigRow1 + 4, 29).value = `( ${staff.teacher} )`;
    ws.mergeCells(sigRow1 + 4, 29, sigRow1 + 4, 34);

    [sigRow1, sigRow1 + 1, sigRow1 + 4].forEach((r) => {
      const c = ws.getCell(r, 29);
      c.font = { name: 'Calibri', size: 9, bold: r === sigRow1 + 4 };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // ── Column Widths ─────────────────────────────────────────────────────────
    ws.columns = [
      { width: 4 },  // A: NO
      { width: 8 },  // B: INDUK
      { width: 28 }, // C: NAMA
      { width: 5 },  // D: L/P
      // E to AB: S, I, A, JML (6 months * 4 cols = 24 cols)
      { width: 3 }, { width: 3 }, { width: 3 }, { width: 4 },
      { width: 3 }, { width: 3 }, { width: 3 }, { width: 4 },
      { width: 3 }, { width: 3 }, { width: 3 }, { width: 4 },
      { width: 3 }, { width: 3 }, { width: 3 }, { width: 4 },
      { width: 3 }, { width: 3 }, { width: 3 }, { width: 4 },
      { width: 3 }, { width: 3 }, { width: 3 }, { width: 4 },
      // AC to AH: Total S, I, A, JML TOTAL, Jml Tdk Hadir, % Hadir
      { width: 3 }, { width: 3 }, { width: 3 },
      { width: 5 },
      { width: 6 },
      { width: 8 },
    ];
  });

  // Client-Side Blob Download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rekap_Absensi_Sekolah_Resmi_TA2026_2027.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}
