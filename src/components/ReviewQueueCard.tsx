import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ChevronRight, CheckCircle2 } from 'lucide-react';
import { learningEngineService } from '../lib/learningEngine';

export default function ReviewQueueCard() {
  const queue = learningEngineService.getReviewQueue();
  const allErrors = learningEngineService.getErrors();
  const masteredCount = allErrors.filter(e => e.mastered).length;

  return (
    <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow text-left space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Takrorlash navbati</h3>
        </div>
        {queue.length > 0 && (
          <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full font-bold border border-orange-500/20">
            {queue.length} ta tayyor
          </span>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-4 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-xs text-text-secondary">Bugun takrorlanadigan savollar yo'q!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {queue.slice(0, 3).map((record, idx) => (
            <div
              key={record.questionId}
              className="flex items-start justify-between gap-3 p-3 bg-primary-bg/60 rounded-xl border border-border-card/40"
            >
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-[11px] font-semibold text-text-primary line-clamp-1">
                  {record.questionText}
                </p>
                <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">{record.topic}</p>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                record.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-500' :
                record.difficulty === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {record.difficulty}
              </span>
            </div>
          ))}

          {queue.length > 3 && (
            <p className="text-[10px] text-text-secondary text-center">
              + yana {queue.length - 3} ta savol
            </p>
          )}
        </div>
      )}

      <div className="pt-1 flex items-center justify-between">
        <p className="text-[10px] text-text-secondary">
          O'zlashtirilgan: <span className="font-bold text-emerald-500">{masteredCount} ta</span>
        </p>
        <Link
          to="/attestatsiya/xatolar"
          className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-blue hover:underline"
        >
          <span>Xatolar daftari</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
