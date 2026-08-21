'use client';

import { useUploadThing } from '@/lib/uploadthing';
import { Upload, Loader2 } from 'lucide-react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

interface CustomImageUploaderProps {
  endpoint?: keyof OurFileRouter;
  onUploadComplete: (url: string, name?: string) => void;
  label?: string;
  className?: string;
  accept?: string;
}

export function CustomImageUploader({
  endpoint = 'newsImage',
  onUploadComplete,
  label = '📷 Upload Gambar',
  className = 'px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer',
  accept = 'image/*',
}: CustomImageUploaderProps) {
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        onUploadComplete(res[0].url, res[0].name);
      }
    },
    onUploadError: (e) => {
      alert(`Gagal upload file: ${e.message}`);
    },
  });

  return (
    <label className={className}>
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={isUploading}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            startUpload(Array.from(e.target.files));
          }
        }}
      />
      {isUploading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Mengunggah...</span>
        </>
      ) : (
        <>
          <Upload className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </label>
  );
}
