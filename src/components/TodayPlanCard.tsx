import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckSquare, Sparkles, Play } from 'lucide-react';
import { learningEngineService } from '../lib/learningEngine';

export default function TodayPlanCard() {
  const navigate = useNavigate();
  const plan = learningEngineService.getTodayPlan();

  return (
    <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow text-left space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-accent-blue" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Bugungi tavsiya</h3>
        </div>
        <span className="text-[9px] bg-accent-blue/10 text-accent-blue px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Shaxsiy Reja</span>
        </span>
      </div>

      <div className="space-y-3">
        {plan.recommendations.map((rec) => (
          <div 
            key={rec.id}
            className="flex items-start space-x-3.5 p-3.5 bg-primary-bg rounded-2xl border border-border-card/35 hover:border-accent-blue/30 transition-all"
          >
            <div className="mt-0.5 w-4.5 h-4.5 rounded-full border border-border-card flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-border-card" />
            </div>
            
            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className="text-xs font-bold text-text-primary truncate">{rec.title}</h4>
              <p className="text-[10px] text-text-secondary leading-normal">{rec.desc}</p>
            </div>

            <button
              onClick={() => navigate(rec.link)}
              className="px-3 py-1.5 bg-surface hover:bg-surface-hover text-accent-blue border border-border-card rounded-lg text-[9px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 active:scale-97"
            >
              <span>{rec.actionText}</span>
              <Play className="w-2 h-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
