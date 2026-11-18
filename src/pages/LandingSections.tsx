import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Timer,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Layers,
  Award,
  Clock,
  Compass
} from 'lucide-react';
import type { CourseMeta } from '../lib/courses';
import { upcomingCourses } from '../data/upcomingCourses';

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 2: DUAL-THEME PLATFORM SHOWCASE (LIGHT & DARK SIDE-BY-SIDE)
   "Barcha tayyorgarlik vositalari — bir joyda"
───────────────────────────────────────────────────────────────────────────── */
export function PlatformShowcase() {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'lessons' | 'mentor' | 'exam'>('diagnostic');

  return (
    <section id="platform-showcase" className="py-20 sm:py-28 bg-surface border-y border-border-card relative overflow-hidden scroll-mt-16">
      {/* Background subtle ornamental pattern */}
      <div className="absolute inset-0 bg-uzbek-ornament opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Barcha tayyorgarlik vositalari — bir joyda
          </span>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight leading-tight">
            Tayyorgarlik vositalari har tomonlama qo‘lingizda
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            Qaysi mavzularni takrorlash kerakligini bilib oling. Darslarni o‘qing, test yeching va natijangizni kuzating.
          </p>

          {/* Interactive view selector tabs */}
          <div className="inline-flex flex-wrap justify-center gap-2 mt-8 p-1.5 bg-primary-bg border border-border-card rounded-2xl shadow-inner">
            {[
              { id: 'diagnostic', label: '1. Diagnostika', icon: Activity },
              { id: 'lessons', label: '2. Darslar & Reja', icon: BookOpen },
              { id: 'mentor', label: '3. AI Mentor', icon: Brain },
              { id: 'exam', label: '4. Sinov Imtihoni', icon: Timer },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-accent-blue text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── EXPANSIVE DUAL THEME SHOWCASE (LIGHT & DARK SIDE-BY-SIDE) ── */}
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">

          {/* ── LEFT PANE: LIGHT ENVIRONMENT ── */}
          <div className="bg-[#F8FAFC] text-[#0B1B3B] border border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(11,27,59,0.08)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100/60 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              {/* Environment Header Badge */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm ring-4 ring-amber-100" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Yorug‘ rejim · Kunduzgi mashg‘ulot
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Faol interfeys
                </span>
              </div>

              {/* Dynamic Tab Body: Light Theme */}
              {activeTab === 'diagnostic' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#0B1B3B]">Diagnostika tahlili</h3>
                      <p className="text-xs text-slate-500 mt-1">50 savolli boshlang‘ich sinov natijalari</p>
                    </div>
                    <span className="text-xl font-bold font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      84 ball
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { name: 'Raqamli savodxonlik', val: 88, status: 'Yuqori' },
                      { name: 'Sanoq sistemalari & axborot', val: 56, status: 'Takrorlash lozim' },
                      { name: 'Algoritmlar & dasturlash', val: 74, status: 'O‘rta' },
                    ].map((item) => (
                      <div key={item.name} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <span className="text-slate-800">{item.name}</span>
                          <span className={item.val >= 80 ? 'text-emerald-600' : item.val >= 60 ? 'text-blue-600' : 'text-amber-600'}>
                            {item.val}% · {item.status}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              item.val >= 80 ? 'bg-emerald-500' : item.val >= 60 ? 'bg-blue-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/70 text-xs text-slate-700 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Shaxsiy tavsiya:</strong> 2-modul (Sanoq sistemalari) bo‘yicha 4 ta darsni takrorlash tavsiya etiladi.</span>
                  </div>
                </div>
              )}

              {activeTab === 'lessons' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#0B1B3B]">O‘quv rejasi va darslar</h3>
                      <p className="text-xs text-slate-500 mt-1">Ketma-ket ochiluvchi 8 ta modul</p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                      M2 · 2-dars
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { num: '01', title: 'Pozitsion va nopozitsion sanoq sistemalari', done: true },
                      { num: '02', title: 'Ikkilik sanoq sistemasida amallar', active: true },
                      { num: '03', title: 'Sakkizlik va o‘n oltilik sistemalarga o‘tish', locked: true },
                    ].map((l) => (
                      <div
                        key={l.num}
                        className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                          l.active
                            ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-100'
                            : l.done
                            ? 'bg-slate-50 border-slate-200 text-slate-600'
                            : 'bg-slate-50/50 border-dashed border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                            l.active ? 'bg-blue-600 text-white' : l.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {l.done ? '✓' : l.num}
                          </span>
                          <span className="font-semibold text-slate-800">{l.title}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {l.active ? 'Hozirgi' : l.done ? 'Tugallangan' : 'Qulflangan'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                    <p className="font-bold text-slate-800 mb-1">Dars konspekti:</p>
                    <p>Ikkilik sanoq sistemasida har bir xona 2 ning darajasini ($2^0, 2^1, 2^2\dots$) bildiradi.</p>
                  </div>
                </div>
              )}

              {activeTab === 'mentor' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#0B1B3B]">AI Mentor tushuntirishi</h3>
                      <p className="text-xs text-slate-500 mt-1">Har bir xatoga mos shaxsiy izoh</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5" /> 24/7 Yordamchi
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs space-y-2">
                    <div className="font-bold text-slate-800">
                      Savol: 25 soni ikkilik sanoq sistemasida qanday yoziladi?
                    </div>
                    <div className="p-2 rounded bg-red-50 text-red-700 border border-red-200">
                      ✗ Sizning javobingiz: <strong>11100₂ (28)</strong>
                    </div>
                    <div className="p-3 bg-blue-50/70 text-slate-700 rounded-lg border border-blue-200/60 leading-relaxed">
                      <p className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Mentor:
                      </p>
                      25 sonini 2 ga ketma-ket bo‘lib, qoldiqlarni teskari tartibda yozamiz:
                      $25 = 16 + 8 + 1 = 2^4 + 2^3 + 2^0 \rightarrow \mathbf{11001_2}$.
                      Siz 4 qiymatli pozitsiyani noto‘g‘ri qo‘shgansiz.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'exam' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#0B1B3B]">Attestatsiya Mock Imtihoni</h3>
                      <p className="text-xs text-slate-500">Davlat attestatsiyasi simulyatori</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                      01:42:15
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                    <p className="font-semibold text-slate-800">
                      12-savol. IP-manzilning qaysi sinfida tarmoq identifikatori uchun 16 bit ajratilgan?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {['A sinf', 'B sinf (To‘g‘ri)', 'C sinf', 'D sinf'].map((opt, i) => (
                        <div
                          key={opt}
                          className={`p-2.5 rounded-lg border ${
                            i === 1
                              ? 'bg-blue-50 border-blue-400 font-bold text-blue-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Realistic Screenshot Integration */}
              <div className="mt-6 pt-4 border-t border-slate-200/80">
                <img
                  src="/assets/brand/dashboard/platform_dashboard_light.png"
                  alt="Nur Academy platformasi yorug‘ interfeysi"
                  className="w-full rounded-xl border border-slate-200 shadow-sm object-cover max-h-[220px]"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Kunduzgi o‘rganish uchun optimallashtirilgan</span>
              <span className="font-bold text-blue-700">Yorug‘lik balansi: 100%</span>
            </div>
          </div>

          {/* ── RIGHT PANE: DARK ENVIRONMENT ── */}
          <div className="bg-[#0B1B3B] text-slate-100 border border-blue-900/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-600/20 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              {/* Environment Header Badge */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-blue-900/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-blue-400 shadow-sm ring-4 ring-blue-950" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Qorong‘i rejim · Tungi qulay tayyorgarlik
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  Ko‘zni toliqtirmaydi
                </span>
              </div>

              {/* Dynamic Tab Body: Dark Theme */}
              {activeTab === 'diagnostic' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-white">Shaxsiy diagnostika xaritasi</h3>
                      <p className="text-xs text-slate-400 mt-1">Modullar bo‘yicha aniq foizlar</p>
                    </div>
                    <span className="text-xl font-bold font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
                      84 ball
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { name: 'Raqamli savodxonlik', val: 88, status: 'O‘zlashtirildi' },
                      { name: 'Sanoq sistemalari & axborot', val: 56, status: 'Takrorlash lozim' },
                      { name: 'Algoritmlar & dasturlash', val: 74, status: 'O‘rta' },
                    ].map((item) => (
                      <div key={item.name} className="bg-[#112347] p-3.5 rounded-xl border border-blue-900/60 shadow-xs">
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <span className="text-slate-200">{item.name}</span>
                          <span className={item.val >= 80 ? 'text-emerald-400' : item.val >= 60 ? 'text-blue-400' : 'text-amber-400'}>
                            {item.val}% · {item.status}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-blue-950 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              item.val >= 80 ? 'bg-emerald-400' : item.val >= 60 ? 'bg-blue-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${item.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3.5 bg-blue-950/70 rounded-xl border border-blue-800/60 text-xs text-slate-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Tungi rejim ustunligi:</strong> Kontrast to‘liq saqlangan holda ko‘z charchoqsiz uzoqroq o‘qish imkoniyati.</span>
                  </div>
                </div>
              )}

              {activeTab === 'lessons' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-white">Tizimli darslar konspekti</h3>
                      <p className="text-xs text-slate-400 mt-1">Har bir modul uchun qisqa xulosalar</p>
                    </div>
                    <span className="text-xs font-bold text-blue-300 bg-blue-950 px-3 py-1 rounded-lg border border-blue-800">
                      M2 · 2-dars
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { num: '01', title: 'Pozitsion va nopozitsion sanoq sistemalari', done: true },
                      { num: '02', title: 'Ikkilik sanoq sistemasida amallar', active: true },
                      { num: '03', title: 'Sakkizlik va o‘n oltilik sistemalarga o‘tish', locked: true },
                    ].map((l) => (
                      <div
                        key={l.num}
                        className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                          l.active
                            ? 'bg-[#152A55] border-blue-400 shadow-md ring-1 ring-blue-400/50'
                            : l.done
                            ? 'bg-[#0E1E40] border-blue-950 text-slate-400'
                            : 'bg-[#0E1E40]/40 border-dashed border-blue-950 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                            l.active ? 'bg-blue-500 text-white' : l.done ? 'bg-emerald-900/60 text-emerald-400' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {l.done ? '✓' : l.num}
                          </span>
                          <span className="font-semibold text-slate-200">{l.title}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {l.active ? 'Hozirgi' : l.done ? 'Tugallangan' : 'Qulflangan'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#112347] p-3.5 rounded-xl border border-blue-900/60 text-xs text-slate-300">
                    <p className="font-bold text-amber-300 mb-1">Qoida:</p>
                    <p>Ikkilik ko‘paytirish amali ikkilik siljish (shift) va qo‘shish orqali bajariladi.</p>
                  </div>
                </div>
              )}

              {activeTab === 'mentor' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-white">AI Mentor tahliliy javobi</h3>
                      <p className="text-xs text-slate-400 mt-1">Interaktiv tushuntirish va yechim</p>
                    </div>
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5" /> 24/7 Yordamchi
                    </span>
                  </div>

                  <div className="bg-[#112347] p-4 rounded-xl border border-blue-900/60 shadow-xs text-xs space-y-2">
                    <div className="font-bold text-slate-200">
                      Savol: 25 soni ikkilik sanoq sistemasida qanday yoziladi?
                    </div>
                    <div className="p-2 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                      ✗ Noto‘g‘ri javob tanlangan edi: 11100₂
                    </div>
                    <div className="p-3 bg-blue-950/80 text-slate-200 rounded-lg border border-blue-800/70 leading-relaxed">
                      <p className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Mentor xulosasi:
                      </p>
                      To‘g‘ri formula: $25 = 16 + 8 + 1 \Rightarrow \mathbf{11001_2}$. Har bir xato sizga qaysi qoidani unutganingizni aniq ko‘rsatib beradi.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'exam' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-white">Mock Imtihon Sinovi</h3>
                      <p className="text-xs text-slate-400">90 daqiqalik davlat attestatsiyasi me’yori</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                      01:42:15
                    </span>
                  </div>

                  <div className="bg-[#112347] p-4 rounded-xl border border-blue-900/60 shadow-xs space-y-3 text-xs">
                    <p className="font-semibold text-slate-200">
                      12-savol. IP-manzilning qaysi sinfida tarmoq identifikatori uchun 16 bit ajratilgan?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {['A sinf', 'B sinf (To‘g‘ri)', 'C sinf', 'D sinf'].map((opt, i) => (
                        <div
                          key={opt}
                          className={`p-2.5 rounded-lg border ${
                            i === 1
                              ? 'bg-blue-600/30 border-blue-400 font-bold text-blue-200'
                              : 'bg-blue-950/40 border-blue-900/40 text-slate-400'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Realistic Screenshot Integration */}
              <div className="mt-6 pt-4 border-t border-blue-900/60">
                <img
                  src="/assets/brand/dashboard/platform_dashboard_dark.png"
                  alt="Nur Academy platformasi qorong‘i interfeysi"
                  className="w-full rounded-xl border border-blue-900/60 shadow-sm object-cover max-h-[220px]"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>Tungi o‘qish uchun chuqur navy tonlar</span>
              <span className="font-bold text-blue-300">Moviy-oltin aksentlar</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA for Section 2 */}
        <div className="mt-12 text-center">
          <Link
            to="/kurs/attestatsiya"
            className="inline-flex items-center gap-2.5 bg-accent-blue text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-accent-blue/95 transition-all shadow-md shadow-accent-blue/20"
          >
            <span>Informatika kursi dasturiga kirish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 3: WHY NUR ACADEMY? (4 SPACIOUS BENEFIT CARDS)
   "Nega aynan Nur Academy?"
───────────────────────────────────────────────────────────────────────────── */
export function BenefitsSection() {
  const benefits = [
    {
      title: 'Diagnostika',
      badge: 'Bilimingizni aniqlang',
      desc: 'Kursdagi 50 savolli diagnostika orqali barcha modullar bo‘yicha boshlang‘ich bilimingizni tahlil qiling va zaif mavzularni ko‘ring.',
      img: '/assets/brand/features/benefit_diagnostics.png',
      icon: Activity,
    },
    {
      title: 'Darslar va konspektlar',
      badge: 'Mavzularni o‘rganing',
      desc: 'Har bir mavzuni darslar orqali bosqichma-bosqich o‘rganing va asosiy qoidalarni ixcham konspekt bilan tez yodda saqlang.',
      img: '/assets/brand/features/benefit_lessons.png',
      icon: BookOpen,
    },
    {
      title: 'AI Mentor',
      badge: 'Xatodan saboq oling',
      desc: 'Mavzu testlarini yeching va xato qilganingizda AI Mentor yordamida to‘g‘ri yechim mantiqini chuqur tushunib oling.',
      img: '/assets/brand/features/benefit_ai_mentor.png',
      icon: Brain,
    },
    {
      title: 'Sinov imtihoni',
      badge: 'Tayyorgarlikni sinang',
      desc: 'Haqiqiy attestatsiya talablariga mos vaqt nazorati ostidagi mock imtihon topshiring va yakuniy tayyorgarligingizni tekshiring.',
      img: '/assets/brand/features/benefit_exam.png',
      icon: Timer,
    },
  ];

  return (
    <section id="afzalliklar" className="py-20 sm:py-28 bg-primary-bg scroll-mt-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold tracking-widest text-accent-blue uppercase mb-3">
            METODIK AFZALLIKLAR
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight">
            Nega aynan Nur Academy?
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            Pedagoglar vaqti cheklangan. Shuning uchun platformamiz faqat muhim mavzular va davlat attestatsiyasi talablariga qaratilgan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="premium-card p-6 flex flex-col justify-between group hover:border-accent-blue/50"
              >
                <div>
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-muted/30 mb-5 border border-border-card/60 flex items-center justify-center p-2">
                    <img
                      src={b.img}
                      alt={b.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-bold uppercase tracking-wider mb-3">
                    <Icon className="w-3.5 h-3.5" />
                    {b.badge}
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-text-primary mt-1 mb-3">
                    {b.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {b.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-card/60 flex items-center text-xs font-bold text-accent-blue group-hover:translate-x-1 transition-transform">
                  <span>Batafsil tanishish</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 4: HOW IT WORKS (4 STEPS WITH MASCOTS)
   "Qanday ishlaydi?"
───────────────────────────────────────────────────────────────────────────── */
export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Ro‘yxatdan o‘ting',
      desc: 'O‘zingizga mos faol kurs dasturi bilan tanishing va tayyorgarlik rejasini ko‘rib chiqing.',
      mascot: '/assets/brand/mascot/step_registration_mascot.png',
    },
    {
      num: '02',
      title: 'Diagnostika topshiring',
      desc: 'Diagnostika testi yordamida qaysi mavzularda bilimingiz yetarli va qayerda kamchilik borligini aniqlang.',
      mascot: '/assets/brand/mascot/step_diagnostics_mascot.png',
    },
    {
      num: '03',
      title: 'Reja bo‘yicha o‘qing',
      desc: 'Tizimli darslar, konspektlar va mavzu testlari yordamida har bir bo‘limni puxta o‘zlashtiring.',
      mascot: '/assets/brand/mascot/step_study_mascot.png',
    },
    {
      num: '04',
      title: 'Imtihonga tayyor bo‘ling',
      desc: 'Vaqt nazorati ostidagi mock imtihonlarni topshirib, haqiqiy attestatsiya sinoviga tayyor ekaningizga ishonch hosil qiling.',
      mascot: '/assets/brand/mascot/step_exam_mascot.png',
    },
  ];

  return (
    <section id="bosqichlar" className="py-20 sm:py-28 bg-surface border-y border-border-card scroll-mt-16 relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold tracking-widest text-accent-blue uppercase mb-3">
            ODDIY VA TIZIMLI BOSQICHLAR
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight">
            Qanday ishlaydi?
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            Attestatsiyaga tayyorgarlik 4 ta aniq ketma-ket qadamdan iborat. Hech qanday chalkashliksiz, maqsad sari to‘g‘ri harakat.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className="premium-card p-6 flex flex-col justify-between relative group hover:border-accent-blue/50"
            >
              <div>
                {/* Step Mascot illustration */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-primary-bg p-3 mb-5 border border-border-card/60 flex items-center justify-center">
                  <img
                    src={s.mascot}
                    alt={s.title}
                    className="max-h-36 object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-accent-blue/10 text-accent-blue font-bold text-sm flex items-center justify-center font-mono">
                    {s.num}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {idx === 0 ? 'Boshlash' : idx === 1 ? 'Tekshirish' : idx === 2 ? 'Mashg‘ulot' : 'Sinov'}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl text-text-primary mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border-card/60 flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Bosqich talabi aniq belgilangan</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 5: COURSES CATALOG (2x2 DESKTOP GRID, 1-COL MOBILE)
   "Kurslar katalogi"
───────────────────────────────────────────────────────────────────────────── */
export function CourseSection({ course }: { course?: CourseMeta }) {
  return (
    <section id="kurslar" className="py-20 sm:py-28 bg-primary-bg scroll-mt-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-12">
          <div>
            <p className="text-xs font-bold tracking-widest text-accent-blue uppercase mb-3">
              TA’LIM YO‘NALISHLARI
            </p>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight">
              Kurslar katalogi
            </h2>
            <p className="text-base sm:text-lg text-text-secondary mt-3 leading-relaxed max-w-2xl">
              Hozir mavjud kurs bilan tanishing. Yangi fanlar bosqichma-bosqich tayyorlanmoqda.
            </p>
          </div>
          <Link
            to="/courses"
            className="font-bold text-accent-blue inline-flex items-center gap-2 py-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent-blue"
          >
            Barcha kurslarni ko‘rish <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Desktop 2x2 grid, Mobile 1-column layout */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* 1. Informatika Card */}
          <article className="bg-surface border border-border-card rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full aspect-video overflow-hidden bg-primary-bg">
              <img
                src="/images/landing/course-informatika.webp"
                alt="Informatika fani attestatsiyasiga tayyorgarlik kursi"
                width="960"
                height="540"
                loading="lazy"
                className="w-full max-w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full">
                  Mavjud kurs
                </span>
                <span className="text-xs text-text-secondary">8 ta modul · 50+ dars</span>
              </div>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl mt-4 text-text-primary">
                Informatika attestatsiyasi
              </h3>
              <p className="text-base text-text-secondary leading-relaxed mt-3 mb-6 flex-1">
                Informatikadan bilimingizni tekshiring, qiyin mavzularni darslarda takrorlang va testlarda mashq qiling. Sinov imtihonida esa tayyorgarligingizni tekshirib ko‘ring.
              </p>
              <div className="flex flex-wrap gap-3 pt-5 border-t border-border-card">
                <Link
                  to="/kurs/attestatsiya"
                  className="inline-flex justify-center items-center gap-2 bg-accent-blue text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-accent-blue/95 transition-all shadow-sm"
                >
                  Kursga kirish <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-5 py-3.5 font-bold text-accent-blue border border-border-card hover:bg-surface-hover rounded-xl text-sm transition-colors"
                >
                  Diagnostikadan boshlash
                </Link>
              </div>
              <div className="mt-5 pt-4 border-t border-border-card/60 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-xs sm:text-sm">
                <span className="text-text-secondary font-medium">Ustozlar:</span>
                <span className="font-semibold text-text-primary">Qudratova Adolat &amp; Maxramov Nursulton</span>
              </div>
            </div>
          </article>

          {/* 2. Tarix Card */}
          <article className="bg-surface border border-border-card rounded-3xl overflow-hidden flex flex-col shadow-sm">
            <div className="w-full aspect-video overflow-hidden bg-primary-bg">
              <img
                src="/images/landing/course-tarix.webp"
                alt="Tarix fani attestatsiyasiga tayyorgarlik kursi"
                width="960"
                height="540"
                loading="lazy"
                className="w-full max-w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                  Tez kunda
                </span>
                <span className="text-xs text-text-secondary">Tayyorlanmoqda</span>
              </div>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl mt-4 text-text-primary">
                Tarix attestatsiyasi
              </h3>
              <p className="text-base text-text-secondary leading-relaxed mt-3 mb-6 flex-1">
                Tarix o‘qituvchilari uchun ham kurs tayyorlayapmiz. Dastur va darslar haqida kurs ochilganda shu yerda ma’lumot beramiz.
              </p>
              <div className="pt-5 border-t border-border-card">
                <span className="inline-flex items-center gap-2 text-text-secondary font-semibold text-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Dastur ishlab chiqilmoqda
                </span>
              </div>
              <div className="mt-5 pt-4 border-t border-border-card/60 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-xs sm:text-sm">
                <span className="text-text-secondary font-medium">Ustozlar:</span>
                <span className="font-semibold text-text-primary">Xamrayeva Mahliyo</span>
              </div>
            </div>
          </article>

          {/* 3 & 4. Geografiya and Ona tili Cards from upcomingCourses */}
          {upcomingCourses.map((item) => (
            <article
              key={item.id}
              className="bg-surface border border-border-card rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-full aspect-video overflow-hidden bg-primary-bg">
                <img
                  src={item.cover_url}
                  alt={`${item.title} kursi`}
                  width="960"
                  height="540"
                  loading="lazy"
                  className="w-full max-w-full h-full object-cover"
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl mt-4 text-text-primary">
                  {item.title}
                </h3>
                <p className="text-base text-text-secondary leading-relaxed mt-3 mb-6 flex-1">
                  {item.description}
                </p>
                <div className="pt-5 border-t border-border-card">
                  <span className="inline-flex items-center gap-2 text-text-secondary font-semibold text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                    {item.notice}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 6: PLATFORM STATISTICS (NON-FABRICATED)
   "Platforma ko‘rsatkichlari"
───────────────────────────────────────────────────────────────────────────── */
export function StatisticsSection() {
  const stats = [
    { num: '4', label: 'Fan yo‘nalishi', desc: 'Informatika, Tarix, Geografiya va Ona tili dasturlari' },
    { num: '10', label: 'Bo‘limli standart', desc: 'Attestatsiya spetsifikatsiyasi bo‘yicha to‘liq qamrov' },
    { num: '24/7', label: 'AI Mentor', desc: 'Har bir xatoga shaxsiy mantiqiy tushuntirish' },
    { num: '100%', label: 'Moslashuvchanlik', desc: 'O‘zingizga qulay vaqtda mustaqil shaxsiy tezlikda o‘rganish' },
  ];

  return (
    <section className="py-20 sm:py-24 bg-[#0B1B3B] text-white relative overflow-hidden">
      {/* Uzbek ornamental pattern */}
      <div className="absolute inset-0 bg-uzbek-ornament opacity-[0.06] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Tizimli yondashuv
          </span>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-white">
            Platforma ko‘rsatkichlari
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            Platformadagi barcha kurslar O‘zbekiston Respublikasi Vazirlar Mahkamasining tegishli qarorlari va rasmiy attestatsiya talablari asosida loyihalashtirilgan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((st) => (
            <div
              key={st.label}
              className="bg-[#112347]/80 border border-blue-800/40 rounded-2xl p-6 text-center backdrop-blur-xs hover:border-amber-400/50 transition-colors"
            >
              <div className="font-serif font-extrabold text-4xl sm:text-5xl text-amber-400 mb-2 font-mono">
                {st.num}
              </div>
              <h3 className="font-bold text-base text-white mb-2">{st.label}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 8: FAQ ACCORDION
   "Ko‘p beriladigan savollar"
───────────────────────────────────────────────────────────────────────────── */
const faqGroups = [
  {
    id: 'boshlash',
    title: 'Boshlash',
    items: [
      {
        q: 'Nur Academy kimlar uchun mo‘ljallangan?',
        a: 'Nur Academy umumiy o‘rta ta’lim maktablari va litsey o‘qituvchilari uchun mo‘ljallangan. Hozirda informatika fani o‘qituvchilari uchun to‘liq attestatsiya dasturi ishlab chiqilgan.'
      },
      {
        q: 'Hozir qaysi fanlar bo‘yicha kurslar mavjud?',
        a: 'Hozir informatika kursida o‘qishni boshlashingiz mumkin. Tarix, geografiya va ona tili kurslari esa bosqichma-bosqich tayyorlanmoqda.'
      },
      {
        q: 'Tayyorgarlikni nimadan boshlash kerak?',
        a: 'Ro‘yxatdan o‘ting va informatika kursidagi 50 savolli diagnostika testini yeching. Natijada qaysi mavzularni yaxshi bilishingiz va qaysilarini takrorlash kerakligini ko‘rasiz.'
      },
      {
        q: 'Tarix, geografiya va ona tili kurslari qachon ochiladi?',
        a: 'Hozircha ochilish sanasi aniq emas. Tarix kursini tayyorlayapmiz, geografiya va ona tili kurslari esa rejada. Yangiliklarni shu sahifada e’lon qilamiz.'
      }
    ]
  },
  {
    id: 'jarayon',
    title: 'O‘qish jarayoni',
    items: [
      {
        q: 'Diagnostika testi qanday yordam beradi?',
        a: 'Informatika kursi diagnostikasi barcha 8 ta modul bo‘yicha bilimingizni tahlil qiladi va har bir yo‘nalish bo‘yicha foiz ko‘rsatkichini beradi. Bu sizga vaqtingizni eng zaif mavzularga yo‘naltirishga yordam beradi.'
      },
      {
        q: 'AI Mentor qanday ishlaydi?',
        a: 'Test yechishda xato qilganingizda, AI Mentor savolning to‘g‘ri javobini va aynan nima uchun boshqa variantlar xato ekanini o‘zbek tilida mantiqiy tushuntirib beradi.'
      },
      {
        q: 'Darslar va konspektlar qanday tuzilgan?',
        a: 'Har bir dars amaliy va tushunarli matn, asosiy formulalar, sxemalar va qisqa konspekt bilan ta’minlangan. Dars so‘ngida mavzu bo‘yicha testlar mavjud.'
      },
      {
        q: 'Mock imtihon nima?',
        a: 'Mock imtihon — bu haqiqiy attestatsiya sinovi sharoitini yaratib beruvchi test. Unda savollar soni va vaqt chegarasi rasmiy imtihon talablariga to‘liq mos keladi.'
      }
    ]
  }
];

export function FaqSection() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'boshlash-0': true,
    'boshlash-1': true,
  });

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="savollar" className="py-20 sm:py-28 bg-surface border-t border-border-card scroll-mt-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Heading and Mascot illustration */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Savol-javoblar
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-text-primary leading-tight">
              Ko‘p beriladigan savollar
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Platforma, o‘qish jarayoni va kurslar bo‘yicha eng muhim ma’lumotlar bilan tanishing.
            </p>

            <div className="rounded-2xl bg-primary-bg p-4 border border-border-card flex items-center justify-center">
              <img
                src="/assets/brand/mascot/faq_mascot_scene.png"
                alt="Nur Academy mentori"
                className="max-h-56 object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Column: Interactive Accordion */}
          <div className="lg:col-span-8 space-y-8">
            {faqGroups.map((group) => (
              <div key={group.id} className="space-y-4">
                <h3 className="font-serif font-bold text-xl text-text-primary pb-2 border-b border-border-card">
                  {group.title}
                </h3>
                <div className="space-y-3">
                  {group.items.map((item, idx) => {
                    const key = `${group.id}-${idx}`;
                    const isOpen = !!openItems[key];
                    return (
                      <div
                        key={key}
                        className="premium-card p-0 overflow-hidden border border-border-card transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent-blue"
                          aria-expanded={isOpen}
                        >
                          <span className="font-serif font-bold text-base sm:text-lg text-text-primary">
                            {item.q}
                          </span>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                            isOpen ? 'rotate-180 bg-accent-blue/10 text-accent-blue' : 'bg-primary-bg text-text-secondary'
                          }`}>
                            <ChevronDown className="w-4 h-4" />
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-sm sm:text-base text-text-secondary leading-relaxed border-t border-border-card/40 pt-3">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
