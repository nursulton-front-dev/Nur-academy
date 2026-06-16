import React, { useState } from 'react';
import { Target, Award, CheckCircle2, X } from 'lucide-react';
import { userProgressService, goalOptions } from '../lib/userProgress';

interface GoalSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (goal: number) => void;
}

export default function GoalSetupModal({ isOpen, onClose, onSave }: GoalSetupModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(
    userProgressService.getUserGoal()
  );

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedGoal !== null) {
      userProgressService.setUserGoal(selectedGoal);
      if (onSave) onSave(selectedGoal);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-border-card rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden transform scale-100 transition-all">
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-accent-blue/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center">
              <Target className="w-5.5 h-5.5 text-accent-blue" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-lg text-text-primary">Attestatsiya Maqsadi</h3>
              <p className="text-xs text-text-secondary">O'zingiz uchun target ballni tanlang</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {goalOptions.map((option) => {
            const isSelected = selectedGoal === option.value;
            
            // Customize target description labels
            let desc = "";
            if (option.value === 55) desc = "Attestatsiyadan muvaffaqiyatli o'tish va amaldagi toifani saqlash";
            if (option.value === 60) desc = "Ikkinchi toifa imtihon talabini bajarish";
            if (option.value === 70) desc = "Birinchi toifa imtihon talabini bajarish";
            if (option.value === 80) desc = "Oliy toifa imtihon talabini bajarish";
            if (option.value === 86) desc = "Maksimal natija va qo'shimcha ustama foizlarini olish";

            return (
              <button
                key={option.value}
                onClick={() => setSelectedGoal(option.value)}
                className={`w-full text-left p-4.5 rounded-2xl border transition-all flex items-start space-x-4 cursor-pointer group ${
                  isSelected 
                    ? 'bg-accent-blue/10 border-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.12)]' 
                    : 'bg-primary-bg/50 border-border-card hover:bg-surface-hover hover:border-accent-blue/35'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-accent-blue bg-accent-blue' : 'border-border-card group-hover:border-accent-blue/40'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className={`text-sm font-bold ${isSelected ? 'text-accent-blue' : 'text-text-primary group-hover:text-accent-blue'}`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-text-secondary leading-normal">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border-card/45">
          <button
            onClick={onClose}
            className="flex-1 border border-border-card hover:bg-surface-hover text-text-primary py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            disabled={selectedGoal === null}
            className="flex-1 bg-accent-blue hover:bg-accent-blue/95 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/10 transition-all active:scale-97 cursor-pointer"
          >
            Maqsadni belgilash
          </button>
        </div>

      </div>
    </div>
  );
}
