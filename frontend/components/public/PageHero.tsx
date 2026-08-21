import Link from 'next/link';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs: { label: string; href?: string }[];
}

export function PageHero({ title, subtitle, breadcrumbs }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white py-12 lg:py-14 border-b border-emerald-600/30">
      {/* Grid Pattern & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Breadcrumb: Beranda / Page */}
          <nav className="flex items-center gap-2 text-xs font-bold mb-3 text-emerald-200">
            {breadcrumbs.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                {b.href ? (
                  <Link href={b.href} className="hover:text-white transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-white font-extrabold">{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <span className="text-emerald-400/80">/</span>}
              </div>
            ))}
          </nav>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-2.5 text-emerald-100/90 text-sm sm:text-base font-medium leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
