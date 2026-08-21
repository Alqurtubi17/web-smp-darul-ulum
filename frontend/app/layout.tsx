import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SCHOOL_NAME = 'SMP Darul Ulum Surabaya';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SCHOOL_NAME,
    template: `%s | ${SCHOOL_NAME}`,
  },
  description: 'Portal resmi SMP Darul Ulum Surabaya — PPDB online, akademik, berita, dan informasi sekolah Islam terpadu di Surabaya.',
  keywords: ['SMP Darul Ulum', 'sekolah islam surabaya', 'PPDB', 'pendaftaran siswa baru', 'SMP surabaya'],
  authors: [{ name: SCHOOL_NAME, url: SITE_URL }],
  creator: SCHOOL_NAME,
  publisher: SCHOOL_NAME,
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: SCHOOL_NAME,
    title: SCHOOL_NAME,
    description: 'Portal resmi SMP Darul Ulum Surabaya — PPDB online, akademik, dan informasi sekolah.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: SCHOOL_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SCHOOL_NAME,
    description: 'Portal resmi SMP Darul Ulum Surabaya',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SCHOOL_NAME,
  },
  formatDetection: { telephone: true, email: true },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#166534' },
    { media: '(prefers-color-scheme: dark)', color: '#14532d' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ─── JSON-LD Structured Data ─────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: SCHOOL_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'SMP Darul Ulum Surabaya adalah sekolah menengah pertama Islam terpadu di Surabaya.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jl. Raya Darul Ulum No. 1',
    addressLocality: 'Surabaya',
    addressRegion: 'Jawa Timur',
    postalCode: '60000',
    addressCountry: 'ID',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+62-31-XXX-XXXX',
    contactType: 'admissions',
    availableLanguage: 'Indonesian',
  },
  sameAs: [
    `https://www.instagram.com/smpdarululum_sby`,
    `https://www.facebook.com/smpdarululumsurabaya`,
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} antialiased bg-[#fcfdfd] text-slate-900`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
