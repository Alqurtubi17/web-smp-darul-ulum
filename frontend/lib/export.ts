// ─── EXPORT UTILITIES ─────────────────────────────────────────────────────────
// PDF Rapor + Excel export — client-side, tanpa server

// ══════════════════════════════════════════════════════════════════════════════
// PDF RAPOR SISWA (jsPDF + jsPDF-autotable)
// ══════════════════════════════════════════════════════════════════════════════

export async function generateRaporPDF(data: {
  student: { fullName: string; nis: string; class: string; }
  semester: number;
  academicYear: string;
  grades: { subject: string; tasks: number|null; uts: number|null; uas: number|null; avg: number; grade: string; }[];
  attendance: { hadir: number; izin: number; sakit: number; alpha: number; total: number; }
  teacherName: string;
  principalName: string;
}) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; const margin = 15;

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
  doc.text('Telp: (031) XXX-XXXX | info@smpdarul ulum.sch.id', W / 2, 23, { align: 'center' });

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
  doc.save(`Rapor_${data.student.fullName.replace(/\s+/g, '_')}_Sem${data.semester}_${data.academicYear.replace('/','')}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT EXCEL — Nilai, Absensi, SPP
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
  const rows = data.rows.map(r => [
    r.nis, r.name,
    r.score ?? '-',
    r.score !== null ? (r.score >= 75 ? 'Tuntas' : 'Remidi') : '-',
  ]);
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);

  // Style header
  ws['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Nilai');
  XLSX.writeFile(wb, `Nilai_${data.className}_${data.subject}_${data.gradeType}.xlsx`);
}

export async function exportAbsensiExcel(data: {
  className: string;
  month: string;
  rows: { nis: string; name: string; hadir: number; izin: number; sakit: number; alpha: number; pct: number; }[];
}) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const headers = [['NIS', 'Nama Siswa', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Kehadiran (%)']];
  const rows = data.rows.map(r => [r.nis, r.name, r.hadir, r.izin, r.sakit, r.alpha, `${r.pct}%`]);
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Absensi');
  XLSX.writeFile(wb, `Absensi_${data.className}_${data.month}.xlsx`);
}

export async function exportSPPExcel(data: {
  month: string;
  rows: { nis: string; name: string; class: string; amount: number; status: string; paidAt?: string; }[];
}) {
  const XLSX = await import('xlsx');
  const rp = (n: number) => new Intl.NumberFormat('id-ID').format(n);
  const wb = XLSX.utils.book_new();

  const headers = [['NIS', 'Nama Siswa', 'Kelas', 'Tagihan', 'Status', 'Tanggal Bayar']];
  const rows = data.rows.map(r => [r.nis, r.name, r.class, rp(r.amount), r.status, r.paidAt || '-']);
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, 'SPP');
  XLSX.writeFile(wb, `SPP_${data.month}.xlsx`);
}
