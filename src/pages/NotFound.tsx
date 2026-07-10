import { Link } from 'react-router-dom';
import { Compass, Home, MapPinned } from 'lucide-react';
import { Seo } from '../components/Seo';

/**
 * Custom 404 for unmatched routes. Academic-calm styling: soft gradient halo,
 * oversized 404, friendly Uzbek copy, two clear ways back. Fully responsive.
 */
export default function NotFound() {
  return (
    <div className="min-h-[78vh] flex items-center justify-center bg-primary-bg px-4 py-12 font-sans">
      <Seo title="Sahifa topilmadi" description="Siz qidirgan sahifa mavjud emas." />

      <div className="relative w-full max-w-lg">
        {/* Ambient halos */}
        <div className="absolute -top-20 -left-16 w-72 h-72 bg-accent-blue/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute -bottom-24 -right-12 w-72 h-72 bg-success-green/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="bg-surface border border-border-card rounded-[32px] p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
            <MapPinned className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-7xl sm:text-8xl font-serif font-extrabold leading-none bg-gradient-to-br from-accent-blue to-success-green bg-clip-text text-transparent">
              404
            </p>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-extrabold text-text-primary">Sahifa topilmadi</h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
              Bu sahifa mavjud emas yoki koʻchirilgan. Quyidagi tugmalar orqali davom eting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-blue/95 transition-all active:scale-[0.98]"
            >
              <Home className="w-4.5 h-4.5" />
              Bosh sahifaga
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface border border-border-card text-text-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-surface-hover transition-all"
            >
              <Compass className="w-4.5 h-4.5" />
              Mening kurslarim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
