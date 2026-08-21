'use client';
import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

const WA_NUMBER = process.env.NEXT_PUBLIC_SCHOOL_WA || '6281234567890';
const WA_MESSAGE = encodeURIComponent('Halo, saya ingin bertanya tentang SMP Darul Ulum Surabaya.');

export function WAButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 no-print">
      {/* Tooltip */}
      {!dismissed && (
        <div className="flex items-center gap-2 bg-white text-gray-700 text-xs font-medium px-3.5 py-2.5 rounded-2xl shadow-lg border border-gray-200 max-w-[200px] animate-bounce-once">
          <span>💬 Ada pertanyaan? Chat kami!</span>
          <button onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* WA Button */}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
        target="_blank" rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
        aria-label="Chat WhatsApp">
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>
    </div>
  );
}
