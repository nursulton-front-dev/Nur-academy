import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { TileCorner } from '../components/brand/Ornaments';

// Placeholder certificates page. Completed-course tracking isn't wired yet, so this
// shows an empty state. Wire real certificates once lesson/module completion is in DB.
export default function Certificates() {
  const certificates: { id: string; title: string }[] = [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="mb-8">
        <h1 className="text-[31px] font-extrabold text-text-primary">Sertifikatlar</h1>
        <p className="text-text-primary text-base mt-3">Yakunlangan kurslaringiz uchun olingan sertifikatlar</p>
      </div>

      {certificates.length === 0 ? (
        <div className="relative overflow-hidden bg-surface-muted border border-border-card rounded-[18px] p-12 text-center">
          <TileCorner className="h-[140px] w-[154px]" />
          <div className="relative w-16 h-16 rounded-2xl bg-mint flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-on-mint" />
          </div>
          <h2 className="relative text-2xl text-text-primary mb-2">Hozircha sertifikatlar yo‘q</h2>
          <p className="relative text-text-primary mb-6 max-w-md mx-auto">
            Platformaning beta bosqichida sertifikat berilmaydi. Sertifikatlar tizimi keyingi yangilanishlarda qo‘shiladi.
          </p>
          <Link
            to="/courses"
            className="relative inline-flex h-[52px] items-center gap-3 bg-accent-blue text-white px-7 rounded-[10px] font-bold text-base hover:bg-accent-hover transition-colors"
          >
            <span>Kurslarga o‘tish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
