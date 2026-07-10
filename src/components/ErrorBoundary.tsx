import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

/**
 * Route-level error element for the data router. Catches render/loader errors
 * (and 404s thrown by React Router) and shows a friendly Uzbek screen instead
 * of React Router's raw developer error page.
 */
export default function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  // Surface the technical detail only in the console — never to the student.
  if (!is404) console.error('Route error:', error);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-primary-bg px-4 font-sans">
      <div className="bg-surface border border-border-card rounded-[24px] max-w-md w-full p-8 sm:p-10 text-center space-y-5 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-extrabold text-text-primary">
            {is404 ? 'Sahifa topilmadi' : 'Nimadir xato ketdi'}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            {is404
              ? 'Siz qidirgan sahifa mavjud emas yoki koʻchirilgan.'
              : 'Kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki bosh sahifaga qayting.'}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-blue/95 transition-all active:scale-[0.98]"
        >
          <Home className="w-4.5 h-4.5" />
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
