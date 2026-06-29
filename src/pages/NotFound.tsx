import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Seo } from '../components/Seo';

/**
 * Custom 404 for unmatched routes. Friendly Uzbek copy in the project style,
 * with clear ways back into the app.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-primary-bg px-4 font-sans">
      <Seo title="Sahifa topilmadi" description="Siz qidirgan sahifa mavjud emas." />
      <div className="bg-surface border border-border-card rounded-[24px] max-w-md w-full p-8 sm:p-12 text-center space-y-6 shadow-sm">
        <p className="text-6xl font-serif font-extrabold text-accent-blue/80 tracking-tight">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-extrabold text-text-primary">Sahifa topilmadi</h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
            Siz qidirgan sahifa mavjud emas yoki koʻchirilgan boʻlishi mumkin.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-blue/95 transition-all active:scale-[0.98]"
          >
            <Home className="w-4.5 h-4.5" />
            Bosh sahifa
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-surface border border-border-card text-text-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-surface-hover transition-all"
          >
            <Compass className="w-4.5 h-4.5" />
            Mening kurslarim
          </Link>
        </div>
      </div>
    </div>
  );
}
