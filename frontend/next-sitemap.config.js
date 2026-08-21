/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://smpdarululum.sch.id',
  generateRobotsTxt: false, // sudah manual di public/robots.txt
  generateIndexSitemap: false,
  exclude: [
    '/admin/*',
    '/guru/*',
    '/siswa/*',
    '/ortu/*',
    '/auth/*',
    '/api/*',
  ],
  additionalPaths: async () => [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/profil', changefreq: 'monthly', priority: 0.8 },
    { loc: '/berita', changefreq: 'daily', priority: 0.9 },
    { loc: '/pengumuman', changefreq: 'daily', priority: 0.9 },
    { loc: '/agenda', changefreq: 'weekly', priority: 0.7 },
    { loc: '/prestasi', changefreq: 'weekly', priority: 0.7 },
    { loc: '/galeri', changefreq: 'weekly', priority: 0.6 },
    { loc: '/download', changefreq: 'monthly', priority: 0.6 },
    { loc: '/kontak', changefreq: 'monthly', priority: 0.7 },
    { loc: '/ppdb', changefreq: 'weekly', priority: 0.9 },
  ],
};
