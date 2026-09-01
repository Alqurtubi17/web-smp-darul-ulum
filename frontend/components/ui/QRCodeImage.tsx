'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeImageProps {
  text: string;
  size?: number;
  className?: string;
}

export function QRCodeImage({ text, size = 200, className = '' }: QRCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!text) return;
    QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#047857', // Emerald-700 green
        light: '#ffffff',
      },
    })
      .then(url => setDataUrl(url))
      .catch(err => {
        console.error('Error generating local QR code:', err);
      });
  }, [text, size]);

  if (!dataUrl) {
    return (
      <div className={`w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold rounded-lg animate-pulse ${className}`}>
        Generating QR...
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR Code: ${text}`}
      className={`w-full h-full object-contain ${className}`}
    />
  );
}
