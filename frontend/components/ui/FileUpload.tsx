'use client';

import { useState } from 'react';
import { UploadButton, UploadDropzone } from '@/lib/uploadthing';
import { X, FileText, Image, CheckCircle, AlertCircle } from 'lucide-react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

interface FileUploadProps {
  endpoint: keyof OurFileRouter;
  onUploadComplete: (url: string, name?: string) => void;
  onUploadError?: (error: Error) => void;
  label?: string;
  hint?: string;
  value?: string;
  onClear?: () => void;
  mode?: 'button' | 'dropzone';
}

export function FileUpload({
  endpoint,
  onUploadComplete,
  onUploadError,
  label,
  hint,
  value,
  onClear,
  mode = 'button',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = (res: { url: string; name: string }[]) => {
    setUploading(false);
    setError(null);
    if (res && res[0]) {
      onUploadComplete(res[0].url, res[0].name);
    }
  };

  const handleError = (err: Error) => {
    setUploading(false);
    setError(err.message || 'Upload gagal');
    onUploadError?.(err);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Preview jika sudah ada file */}
      {value ? (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-green-200 bg-green-50">
          {value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img src={value} alt="preview" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <p className="text-xs font-medium text-green-700">File berhasil diupload</p>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{value}</p>
          </div>
          {onClear && (
            <button type="button" onClick={onClear}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : mode === 'dropzone' ? (
        <UploadDropzone
          endpoint={endpoint}
          onClientUploadComplete={handleComplete}
          onUploadError={handleError}
          onUploadBegin={() => { setUploading(true); setError(null); }}
          appearance={{
            container: 'border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:border-green-400 transition-colors cursor-pointer',
            uploadIcon: 'text-gray-400',
            label: 'text-sm text-gray-500',
            allowedContent: 'text-xs text-gray-400',
            button: 'bg-green-600 hover:bg-green-700 text-white rounded-xl px-5 py-2 text-sm font-semibold mt-3',
          }}
        />
      ) : (
        <UploadButton
          endpoint={endpoint}
          onClientUploadComplete={handleComplete}
          onUploadError={handleError}
          onUploadBegin={() => { setUploading(true); setError(null); }}
          appearance={{
            button: 'bg-green-600 hover:bg-green-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold',
            allowedContent: 'text-xs text-gray-400 mt-1',
          }}
          content={{
            button: uploading ? 'Mengupload...' : 'Pilih File',
          }}
        />
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}

      {hint && !error && !value && (
        <p className="text-xs text-gray-400 mt-1.5">{hint}</p>
      )}
    </div>
  );
}

// Komponen khusus upload gambar dengan preview langsung
export function ImageUpload({
  endpoint = 'newsImage',
  onUploadComplete,
  value,
  onClear,
  label = 'Upload Gambar',
  hint = 'JPG, PNG, WebP maksimal 8MB',
}: {
  endpoint?: keyof OurFileRouter;
  onUploadComplete: (url: string) => void;
  value?: string;
  onClear?: () => void;
  label?: string;
  hint?: string;
}) {
  return (
    <FileUpload
      endpoint={endpoint}
      onUploadComplete={onUploadComplete}
      value={value}
      onClear={onClear}
      label={label}
      hint={hint}
      mode="dropzone"
    />
  );
}
