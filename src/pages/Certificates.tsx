import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';

// Placeholder certificates page. Completed-course tracking isn't wired yet, so this
// shows an empty state. Wire real certificates once lesson/module completion is in DB.
export default function Certificates() {
  const certificates: { id: string; title: string }[] = [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-text-primary">Sertifikatlar</h1>
        <p className="text-text-secondary mt-2">Yakunlangan kurslaringiz uchun olingan sertifikatlar</p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-surface border border-border-card rounded-[24px] p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-accent-blue" />
          </div>
          <h2 className="text-xl font-serif font-bold text-text-primary mb-2">Hozircha sertifikatlaringiz yoʻq</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Kursni yakunlang va sertifikat oling.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-blue/95 shadow-md transition-all active:scale-97 cursor-pointer"
          >
            <span>Kurslarga oʻtish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
