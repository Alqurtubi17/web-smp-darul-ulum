import { UTApi } from 'uploadthing/server';
import { NextResponse } from 'next/server';

const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileKey, fileKeys } = body || {};

    if (fileKeys && Array.isArray(fileKeys) && fileKeys.length > 0) {
      await utapi.deleteFiles(fileKeys);
      return NextResponse.json({ success: true, deleted: fileKeys });
    }

    if (fileKey) {
      await utapi.deleteFiles(fileKey);
      return NextResponse.json({ success: true, deleted: [fileKey] });
    }

    return NextResponse.json(
      { error: 'Parameter fileKey atau fileKeys wajib diisi.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Gagal menghapus berkas dari UploadThing:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat menghapus berkas dari server UploadThing.' },
      { status: 500 }
    );
  }
}
