// @ts-nocheck
/**
 * Storage utility menggunakan UploadThing
 * 
 * Di backend, kita tidak perlu handle upload langsung —
 * file diupload langsung dari frontend ke UploadThing,
 * lalu URL-nya dikirim ke backend untuk disimpan di DB.
 *
 * File ini berisi helper untuk validasi URL UploadThing.
 */

export interface UploadedFile {
  url: string;
  key: string;
  name: string;
  size: number;
}

/**
 * Validasi apakah URL berasal dari UploadThing (utfs.io)
 */
export const isUploadThingUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('utfs.io') || parsed.hostname.endsWith('uploadthing.com');
  } catch {
    return false;
  }
};

/**
 * Extract file key dari UploadThing URL
 * Format: https://utfs.io/f/{key}
 */
export const getUploadThingKey = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/');
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
};

/**
 * Delete file dari UploadThing (opsional, butuh server SDK)
 * Bisa dipanggil saat admin hapus file lama
 */
export const deleteUploadThingFile = async (key: string): Promise<boolean> => {
  try {
    const res = await fetch(`https://uploadthing.com/api/deleteFile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-uploadthing-api-key': process.env.UPLOADTHING_SECRET || '',
      },
      body: JSON.stringify({ fileKeys: [key] }),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export default { isUploadThingUrl, getUploadThingKey, deleteUploadThingFile };
