'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage;

  // Generate page numbers
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/20 text-xs font-semibold text-slate-600">
      <div>
        {totalItems !== undefined ? (
          <span>
            Menampilkan <strong className="text-slate-900">{startItem}</strong> - <strong className="text-slate-900">{endItem}</strong> dari <strong className="text-slate-900">{totalItems}</strong> data
          </span>
        ) : (
          <span>
            Halaman <strong className="text-slate-900">{currentPage}</strong> dari <strong className="text-slate-900">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-700 transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        {pages.map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all ${
                currentPage === p
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'border border-emerald-200 bg-white hover:bg-emerald-50 text-slate-700'
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={`dots-${idx}`} className="px-1 text-slate-400 font-bold">
              ...
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-700 transition-colors shadow-2xs"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
