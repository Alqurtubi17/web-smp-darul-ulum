'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api';
import { generateRaporPDF } from '@/lib/export';

interface Grade { subject: { name: string }; type: string; score: number; }
interface Att { status: string; }

export default function SiswaRaporPage() {
  const { user } = useAuth();
  const [semester, setSemester] = useState(1);
  const [generating, setGenerating] = useState(false);
  const studentId = (user as any)?.student?.id;

  const { data: grades = [], isLoading: gl } = useQuery({
    queryKey: ['student-grades', studentId, semester],
    queryFn: async () => { const { data } = await apiClient.get(`/grades/student/${studentId}?semester=${semester}`); return (data.data||[]) as Grade[]; },
    enabled: !!studentId,
  });

  const { data: att = [], isLoading: al } = useQuery({
    queryKey: ['student-att', studentId],
    queryFn: async () => { const { data } = await apiClient.get(`/attendance/student/${studentId}`); return (data.data||[]) as Att[]; },
    enabled: !!studentId,
  });

  const bySubject = grades.reduce((acc, g) => {
    if (!acc[g.subject.name]) acc[g.subject.name] = { tasks:[] as number[], uts:null as number|null, uas:null as number|null };
    if (['TUGAS','ULANGAN_HARIAN'].includes(g.type)) acc[g.subject.name].tasks.push(g.score);
    if (g.type==='UTS') acc[g.subject.name].uts = g.score;
    if (g.type==='UAS') acc[g.subject.name].uas = g.score;
    return acc;
  }, {} as Record<string, { tasks: number[]; uts: number|null; uas: number|null }>);

  const gradeRows = Object.entries(bySubject).map(([subject, v]) => {
    const taskAvg = v.tasks.length ? v.tasks.reduce((a,b)=>a+b,0)/v.tasks.length : null;
    const scores = [taskAvg, v.uts, v.uas].filter(s=>s!==null) as number[];
    const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0;
    const grade = avg>=93?'A':avg>=84?'B+':avg>=75?'B':avg>=65?'C':'D';
    return { subject, tasks:taskAvg, uts:v.uts, uas:v.uas, avg, grade };
  });

  const attCount = {
    hadir:att.filter(a=>a.status==='HADIR').length,
    izin: att.filter(a=>a.status==='IZIN').length,
    sakit:att.filter(a=>a.status==='SAKIT').length,
    alpha:att.filter(a=>a.status==='ALPHA').length,
    total:att.length||1,
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      await generateRaporPDF({
        student: { fullName:(user as any)?.student?.fullName||'Siswa', nis:(user as any)?.student?.nis||'-', class:(user as any)?.student?.class?.name||'-' },
        semester, academicYear:'2024/2025',
        grades: gradeRows, attendance: attCount,
        teacherName:'Wali Kelas', principalName:'H. Ahmad Fauzi, M.Pd.',
      });
    } finally { setGenerating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rapor Digital</h1>
          <p className="text-sm text-gray-500 mt-0.5">Laporan Hasil Belajar 2024/2025</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[1,2].map(s=>(
              <button key={s} onClick={()=>setSemester(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium ${semester===s?'bg-white text-green-700 shadow-sm':'text-gray-500'}`}>
                Semester {s}
              </button>
            ))}
          </div>
          <button onClick={handleDownload} disabled={generating||gl||al||gradeRows.length===0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold">
            {generating?<Loader2 className="w-4 h-4 animate-spin"/>:<Download className="w-4 h-4"/>}
            {generating?'Membuat PDF...':'Download PDF'}
          </button>
        </div>
      </div>

      {gl||al ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-green-600"/></div>
      ) : gradeRows.length===0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30"/>
          <p className="text-sm">Belum ada nilai untuk semester {semester}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-green-800 text-white p-5 text-center">
            <p className="font-bold text-lg">SMP DARUL ULUM SURABAYA</p>
            <p className="text-green-200 text-xs mt-0.5">Semester {semester===1?'Ganjil':'Genap'} 2024/2025</p>
          </div>
          <div className="p-5 border-b border-gray-100 grid sm:grid-cols-3 gap-3 text-sm">
            {[{l:'Nama',v:(user as any)?.student?.fullName||'-'},{l:'NIS',v:(user as any)?.student?.nis||'-'},{l:'Kelas',v:(user as any)?.student?.class?.name||'-'}].map(f=>(
              <div key={f.l}><span className="text-xs text-gray-400">{f.l}</span><p className="font-semibold text-gray-900">{f.v}</p></div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50">
                {['No','Mata Pelajaran','Tugas','UTS','UAS','Rata-rata','Predikat'].map(h=>(
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {gradeRows.map((g,i)=>(
                  <tr key={g.subject} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-400 text-center">{i+1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{g.subject}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{g.tasks?.toFixed(0)||'-'}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{g.uts?.toFixed(0)||'-'}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{g.uas?.toFixed(0)||'-'}</td>
                    <td className="px-4 py-3 text-center"><span className={`text-sm font-bold ${g.avg>=75?'text-green-600':'text-red-500'}`}>{g.avg.toFixed(1)}</span></td>
                    <td className="px-4 py-3 text-center"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${g.grade==='A'?'bg-green-100 text-green-700':g.grade.startsWith('B')?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>{g.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Rekap Kehadiran</p>
            <div className="grid grid-cols-4 gap-3">
              {[{l:'Hadir',v:attCount.hadir,c:'text-green-600'},{l:'Izin',v:attCount.izin,c:'text-blue-600'},{l:'Sakit',v:attCount.sakit,c:'text-yellow-600'},{l:'Alpha',v:attCount.alpha,c:'text-red-600'}].map(s=>(
                <div key={s.l} className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-xs text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
