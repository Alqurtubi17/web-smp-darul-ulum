'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-2xs">
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-emerald-700 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-xs text-slate-600 font-medium leading-relaxed border-t border-emerald-50 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
