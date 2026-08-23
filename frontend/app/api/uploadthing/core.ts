import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/auth';

const f = createUploadthing();

// Helper auth check for protected uploads
const requireAuth = async () => {
  const session = await auth();
  if (!session || !session.user) throw new Error('Unauthorized');
  return { userId: session.user.id, role: (session.user as any).role };
};

export const ourFileRouter = {
  // Upload foto profil
  profilePhoto: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(requireAuth)
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.url, name: file.name, key: file.key };
    }),

  // Upload gambar berita / pengumuman / buku
  newsImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(() => ({}))
    .onUploadComplete(({ file }) => ({ url: file.url, name: file.name, key: file.key })),

  // Upload galeri (multiple)
  galleryImages: f({ image: { maxFileSize: '8MB', maxFileCount: 20 } })
    .middleware(requireAuth)
    .onUploadComplete(({ file }) => ({ url: file.url, name: file.name, key: file.key })),

  // Upload berkas PPDB (PDF & Gambar)
  ppdbDocuments: f({
    image: { maxFileSize: '8MB' },
    pdf: { maxFileSize: '16MB' },
  })
    .middleware(() => ({}))
    .onUploadComplete(({ file }) => ({ url: file.url, name: file.name, key: file.key })),

  // Upload tugas siswa (PDF, Word, Excel, Gambar, ZIP)
  assignmentFile: f({
    image: { maxFileSize: '8MB' },
    pdf: { maxFileSize: '16MB' },
    'application/msword': { maxFileSize: '16MB' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '16MB' },
    'application/vnd.ms-excel': { maxFileSize: '16MB' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxFileSize: '16MB' },
  })
    .middleware(() => ({}))
    .onUploadComplete(({ file }) => ({ url: file.url, name: file.name, key: file.key })),

  // Upload materi pelajaran (PDF, Video, PPT, Word, Excel, Gambar)
  materialFile: f({
    pdf: { maxFileSize: '32MB' },
    image: { maxFileSize: '16MB' },
    video: { maxFileSize: '512MB', maxFileCount: 1 },
    'application/vnd.ms-powerpoint': { maxFileSize: '32MB' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { maxFileSize: '32MB' },
    'application/vnd.ms-excel': { maxFileSize: '32MB' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxFileSize: '32MB' },
  })
    .middleware(() => ({}))
    .onUploadComplete(({ file }) => ({ url: file.url, name: file.name, key: file.key })),

  // Upload dokumen sekolah & umum (Excel, PDF, Word, PowerPoint, Gambar)
  generalDocument: f({
    pdf: { maxFileSize: '32MB' },
    image: { maxFileSize: '16MB' },
    'application/vnd.ms-excel': { maxFileSize: '32MB' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxFileSize: '32MB' },
    'application/msword': { maxFileSize: '32MB' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '32MB' },
    'text/csv': { maxFileSize: '16MB' },
  })
    .middleware(() => ({}))
    .onUploadComplete(({ file }) => ({ url: file.url, name: file.name, key: file.key })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
