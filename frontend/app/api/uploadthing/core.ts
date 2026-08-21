import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/auth';

const f = createUploadthing();

// Helper cek session
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
      console.log('Profile photo uploaded:', file.url, 'by:', metadata.userId);
      return { url: file.url };
    }),

  // Upload gambar berita/pengumuman
  newsImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(requireAuth)
    .onUploadComplete(({ file }) => ({ url: file.url })),

  // Upload galeri (multiple)
  galleryImages: f({ image: { maxFileSize: '8MB', maxFileCount: 20 } })
    .middleware(requireAuth)
    .onUploadComplete(({ file }) => ({ url: file.url })),

  // Upload berkas PPDB
  ppdbDocuments: f({
    image: { maxFileSize: '4MB' },
    pdf: { maxFileSize: '8MB' },
  }, { awaitServerData: false })
    .middleware(() => ({})) // public — tidak perlu login
    .onUploadComplete(({ file }) => ({ url: file.url })),

  // Upload tugas siswa
  assignmentFile: f({
    image: { maxFileSize: '8MB' },
    pdf: { maxFileSize: '16MB' },
    'application/msword': { maxFileSize: '16MB' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '16MB' },
  })
    .middleware(requireAuth)
    .onUploadComplete(({ file }) => ({ url: file.url })),

  // Upload materi pelajaran
  materialFile: f({
    pdf: { maxFileSize: '32MB' },
    image: { maxFileSize: '8MB' },
    video: { maxFileSize: '512MB', maxFileCount: 1 },
    'application/vnd.ms-powerpoint': { maxFileSize: '32MB' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { maxFileSize: '32MB' },
  })
    .middleware(requireAuth)
    .onUploadComplete(({ file }) => ({ url: file.url })),

  // Upload dokumen sekolah (admin)
  schoolDocument: f({
    pdf: { maxFileSize: '16MB' },
    image: { maxFileSize: '8MB' },
  })
    .middleware(requireAuth)
    .onUploadComplete(({ file }) => ({ url: file.url })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
