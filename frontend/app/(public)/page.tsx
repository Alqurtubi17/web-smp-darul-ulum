import type { Metadata } from 'next';
import { InteractiveHome } from '@/components/public/InteractiveHome';

export const metadata: Metadata = {
  title: 'Beranda | SMP Darul Ulum Surabaya',
  description: 'Website resmi SMP Darul Ulum Surabaya. Informasi sekolah, PPDB, berita, dan kegiatan akademik.',
};

export default function HomePage() {
  return <InteractiveHome />;
}
