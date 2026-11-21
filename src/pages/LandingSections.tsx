import { IslimiCorner } from '../components/brand/Ornaments';
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
  UserCheck,
  MessageSquare,
  BarChart3,
  Flame,
  FileText
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
    <section id="platform-showcase" className="py-20 sm:py-28 bg-surface border-y border-border-card relative overflow-hidden scroll-mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-mint text-on-mint text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
            Barcha tayyorgarlik vositalari — bir joyda
          </span>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight leading-tight">
            Tayyorgarlik vositalari har tomonlama qo‘lingizda
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            Qaysi mavzularni takrorlash kerakligini bilib oling. Darslarni o‘qing, test yeching va natijangizni kuzating.
          </p>

          {/* Interactive view selector tabs */}
          <div className="inline-flex flex-wrap justify-center gap-1.5 mt-8 p-1.5 bg-primary-bg border border-border-card rounded-2xl shadow-inner">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === id
                    ? 'bg-accent-blue text-white'
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
          <div className="bg-[#FFFFFF] text-[#10201E] border border-[#E6E2D8] rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-200">
            <div>
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6E2D8]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="text-xs font-bold text-[#4B5654] ml-2">
                    Yorug‘ rejim · Kunduzgi mashg‘ulot
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-[#0E7A62] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Faol interfeys
                </span>
              </div>

              {/* Dynamic Tab Body: Light Theme */}
              {activeTab === 'diagnostic' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#10201E]">Diagnostika tahlili</h3>
                      <p className="text-xs text-[#4B5654] mt-1">50 savolli boshlang‘ich sinov natijalari</p>
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
                      <div key={item.name} className="bg-[#F6F4EF] p-3.5 rounded-xl border border-[#E6E2D8]">
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <span className="text-[#10201E]">{item.name}</span>
                          <span className={item.val >= 80 ? 'text-emerald-600' : item.val >= 60 ? 'text-[#0E7A62]' : 'text-amber-600'}>
                            {item.val}% · {item.status}
                          </span>
                        </div>
                        <div className="w-full bg-[#E6E2D8] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.val >= 80 ? 'bg-emerald-500' : item.val >= 60 ? 'bg-[#0E7A62]' : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'lessons' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#10201E]">Modullar va darslar</h3>
                      <p className="text-xs text-[#4B5654] mt-1">Davlat attestatsiyasi talablari asosida</p>
                    </div>
                    <span className="text-xs font-bold text-[#0E7A62] bg-emerald-50 px-2.5 py-1 rounded-lg">
                      8 ta modul
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { num: 1, title: 'Axborot va axborot jarayonlari', count: '6 dars', done: true },
                      { num: 2, title: 'Sanoq sistemalari va arifmetika', count: '8 dars', active: true },
                      { num: 3, title: 'Mantiqiy ifodalar va jadvallar', count: '6 dars', locked: true },
                    ].map((m) => (
                      <div
                        key={m.num}
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                          m.active
                            ? 'bg-emerald-50/60 border-[#0E7A62] font-semibold text-[#10201E]'
                            : 'bg-[#F6F4EF] border-[#E6E2D8] text-[#4B5654]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[13px] ${
                            m.active ? 'bg-[#0E7A62] text-white' : m.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {m.done ? '✓' : m.num}
                          </span>
                          <span>{m.title}</span>
                        </div>
                        <span className="text-[13px] text-[#4B5654]">{m.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'mentor' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="font-serif font-extrabold text-xl text-[#10201E]">AI Mentor tushuntirishi</h3>
                    <p className="text-xs text-[#4B5654] mt-1">Har bir xato test savoli bo‘yicha individual tahlil</p>
                  </div>

                  <div className="bg-[#F6F4EF] border border-[#E6E2D8] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-mint text-on-mint flex items-center justify-center font-bold">
                        <Brain className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#10201E]">AI Mentor tavsiyasi:</span>
                    </div>
                    <p className="text-xs text-[#4B5654] leading-relaxed">
                      "16-lik sanoq sistemasidan 2-likka o‘tishda har bir raqamni to‘rtta bit (tetrada) bilan almashtiring. Masalan: A₁₆ = 1010₂. Shunda xatolik yuz bermaydi."
                    </p>
                    <div className="pt-2 border-t border-[#E6E2D8] flex items-center justify-between text-[13px]">
                      <span className="text-emerald-600 font-semibold">Tushunarli konspekt yaratildi</span>
                      <span className="text-[#0E7A62] font-bold">Takrorlashga qo‘shildi</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'exam' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#10201E]">Mock imtihon simulyatori</h3>
                      <p className="text-xs text-[#4B5654] mt-1">Rasmiy attestatsiya sharoitida</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      120 daqiqa
                    </span>
                  </div>

                  <div className="bg-[#F6F4EF] border border-[#E6E2D8] rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#4B5654]">Savol 24 / 50</span>
                      <span className="font-mono font-bold text-[#10201E]">01:24:18 qoldi</span>
                    </div>
                    <div className="w-full bg-[#E6E2D8] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0E7A62] h-full w-[48%]" />
                    </div>
                    <p className="text-xs font-medium text-[#10201E] pt-1">
                      Algoritmik blok-sxemada romb shakli qaysi amalni bildiradi?
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-lg border border-[#E6E2D8] bg-white text-[#4B5654]">A) Boshlanish/Tugash</div>
                      <div className="p-2.5 rounded-lg border border-[#0E7A62] bg-emerald-50 font-semibold text-[#0E7A62]">B) Shartni tekshirish</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E6E2D8] flex items-center justify-between text-xs text-[#4B5654]">
              <span>Real vaqtda sinxronizatsiya</span>
              <span className="text-[#0E7A62] font-semibold">Nur Academy Engine</span>
            </div>
          </div>

          {/* ── RIGHT PANE: DARK ENVIRONMENT ── */}
          <div className="bg-[#111A2E] text-[#F1F5F9] border border-[#22352F] rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-200">
            <div>
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#22352F]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-bold text-[#94A3B8] ml-2">
                    Qorong‘i rejim · Kechki tayyorgarlik
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-[#5FD3AF] bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                  Ko‘zga qulay
                </span>
              </div>

              {/* Dynamic Tab Body: Dark Theme */}
              {activeTab === 'diagnostic' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#F1F5F9]">Diagnostika tahlili</h3>
                      <p className="text-xs text-[#94A3B8] mt-1">50 savolli boshlang‘ich sinov natijalari</p>
                    </div>
                    <span className="text-xl font-bold font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800">
                      84 ball
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { name: 'Raqamli savodxonlik', val: 88, status: 'Yuqori' },
                      { name: 'Sanoq sistemalari & axborot', val: 56, status: 'Takrorlash lozim' },
                      { name: 'Algoritmlar & dasturlash', val: 74, status: 'O‘rta' },
                    ].map((item) => (
                      <div key={item.name} className="bg-[#0A101D] p-3.5 rounded-xl border border-[#22352F]">
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <span className="text-[#F1F5F9]">{item.name}</span>
                          <span className={item.val >= 80 ? 'text-emerald-400' : item.val >= 60 ? 'text-[#5FD3AF]' : 'text-amber-400'}>
                            {item.val}% · {item.status}
                          </span>
                        </div>
                        <div className="w-full bg-[#22352F] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.val >= 80 ? 'bg-emerald-500' : item.val >= 60 ? 'bg-[#0E7A62]' : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'lessons' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#F1F5F9]">Modullar va darslar</h3>
                      <p className="text-xs text-[#94A3B8] mt-1">Davlat attestatsiyasi talablari asosida</p>
                    </div>
                    <span className="text-xs font-bold text-[#5FD3AF] bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-900">
                      8 ta modul
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { num: 1, title: 'Axborot va axborot jarayonlari', count: '6 dars', done: true },
                      { num: 2, title: 'Sanoq sistemalari va arifmetika', count: '8 dars', active: true },
                      { num: 3, title: 'Mantiqiy ifodalar va jadvallar', count: '6 dars', locked: true },
                    ].map((m) => (
                      <div
                        key={m.num}
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                          m.active
                            ? 'bg-emerald-950/40 border-[#0E7A62] font-semibold text-white'
                            : 'bg-[#0A101D] border-[#22352F] text-[#94A3B8]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[13px] ${
                            m.active ? 'bg-[#0E7A62] text-white' : m.done ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {m.done ? '✓' : m.num}
                          </span>
                          <span>{m.title}</span>
                        </div>
                        <span className="text-[13px] text-[#94A3B8]">{m.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'mentor' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="font-serif font-extrabold text-xl text-[#F1F5F9]">AI Mentor tushuntirishi</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">Har bir xato test savoli bo‘yicha individual tahlil</p>
                  </div>

                  <div className="bg-[#0A101D] border border-[#22352F] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-[#5FD3AF] flex items-center justify-center font-bold">
                        <Brain className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#F1F5F9]">AI Mentor tavsiyasi:</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      "16-lik sanoq sistemasidan 2-likka o‘tishda har bir raqamni to‘rtta bit (tetrada) bilan almashtiring. Masalan: A₁₆ = 1010₂. Shunda xatolik yuz bermaydi."
                    </p>
                    <div className="pt-2 border-t border-[#22352F] flex items-center justify-between text-[13px]">
                      <span className="text-emerald-400 font-semibold">Tushunarli konspekt yaratildi</span>
                      <span className="text-[#5FD3AF] font-bold">Takrorlashga qo‘shildi</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'exam' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-extrabold text-xl text-[#F1F5F9]">Mock imtihon simulyatori</h3>
                      <p className="text-xs text-[#94A3B8] mt-1">Rasmiy attestatsiya sharoitida</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800">
                      120 daqiqa
                    </span>
                  </div>

                  <div className="bg-[#0A101D] border border-[#22352F] rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#94A3B8]">Savol 24 / 50</span>
                      <span className="font-mono font-bold text-[#F1F5F9]">01:24:18 qoldi</span>
                    </div>
                    <div className="w-full bg-[#22352F] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0E7A62] h-full w-[48%]" />
                    </div>
                    <p className="text-xs font-medium text-[#F1F5F9] pt-1">
                      Algoritmik blok-sxemada romb shakli qaysi amalni bildiradi?
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-lg border border-[#22352F] bg-[#111A2E] text-[#94A3B8]">A) Boshlanish/Tugash</div>
                      <div className="p-2.5 rounded-lg border border-[#0E7A62] bg-emerald-950/60 font-semibold text-[#5FD3AF]">B) Shartni tekshirish</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#22352F] flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Avtomatik saqlash faol</span>
              <span className="text-[#5FD3AF] font-semibold">Tungi rejim</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 3: WHY NUR ACADEMY? (4 MINIMALIST, HIGH-GRADE BENEFIT CARDS)
   "Nega aynan Nur Academy?"
───────────────────────────────────────────────────────────────────────────── */
export function BenefitsSection() {
  const benefits = [
    {
      title: 'Diagnostika',
      badge: 'Bilimingizni aniqlang',
      desc: '50 savolli tizimli diagnostika testi orqali barcha modullar bo‘yicha bilimingizni tahlil qiling va zaif mavzularni darhol ko‘ring.',
      icon: Activity,
      color: 'blue' as const
    },
    {
      title: 'Darslar va konspektlar',
      badge: 'Mavzularni o‘rganing',
      desc: 'Har bir mavzuni bosqichma-bosqich o‘rganing, formulalar va sxemalarni ixcham konspekt orqali xotirada mustahkamlang.',
      icon: BookOpen,
      color: 'amber' as const
    },
    {
      title: 'AI Mentor',
      badge: 'Xatodan saboq oling',
      desc: 'Mavzu testlarini yeching va xato qilganingizda AI Mentor yordamida har bir to‘g‘ri yechim mantiqini o‘zbek tilida chuqur tushuning.',
      icon: Brain,
      color: 'purple' as const
    },
    {
      title: 'Sinov imtihoni',
      badge: 'Tayyorgarlikni sinang',
      desc: 'Haqiqiy attestatsiya talablariga mos vaqt nazorati ostidagi 50 savolli mock imtihon topshiring va yakuniy ko‘rsatkichingizni biling.',
      icon: Timer,
      color: 'green' as const
    },
  ];

  return (
    <section id="afzalliklar" className="py-20 sm:py-28 bg-primary-bg scroll-mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-on-mint text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Metodik afzalliklar
          </span>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight">
            Nega aynan Nur Academy?
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            Pedagoglar vaqti cheklangan. Shuning uchun platformamiz faqat muhim mavzular va davlat attestatsiyasi talablariga qaratilgan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="premium-card p-6 sm:p-7 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-mint text-on-mint flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-muted text-text-secondary text-[13px] font-bold uppercase tracking-wider mb-3">
                    {b.badge}
                  </span>

                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-text-primary mt-1 mb-3">
                    {b.title}
                  </h3>

                  <p className="text-sm text-text-secondary leading-relaxed">
                    {b.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border-card/60 flex items-center text-xs font-bold text-accent-blue group-hover:translate-x-1 transition-transform duration-200">
                  <span>Batafsil tanishish</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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
   SECTION 4: HOW IT WORKS (4 CLEAN STRUCTURED STEPS)
   "Qanday ishlaydi?"
───────────────────────────────────────────────────────────────────────────── */
export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Ro‘yxatdan o‘ting',
      desc: 'O‘zingizga mos faol kurs dasturi bilan tanishing va shaxsiy tayyorgarlik rejangizni shakllantiring.',
      icon: UserCheck,
      badge: 'Boshlash'
    },
    {
      num: '02',
      title: 'Diagnostika topshiring',
      desc: '50 savolli diagnostika yordamida qaysi mavzularda bilimingiz yetarli va qayerda kamchilik borligini aniqlang.',
      icon: Activity,
      badge: 'Tahlil'
    },
    {
      num: '03',
      title: 'Reja bo‘yicha o‘qing',
      desc: 'Tizimli video/matn darslar, konspektlar va mavzu testlari orqali har bir bo‘limni puxta o‘zlashtiring.',
      icon: BookOpen,
      badge: 'O‘rganish'
    },
    {
      num: '04',
      title: 'Imtihonga tayyor bo‘ling',
      desc: 'Vaqt nazorati ostidagi 50 savolli mock imtihonlarni topshirib, haqiqiy attestatsiya sinoviga to‘liq ishonch hosil qiling.',
      icon: Award,
      badge: 'Sinov'
    },
  ];

  return (
    <section id="bosqichlar" className="py-20 sm:py-28 bg-surface border-y border-border-card scroll-mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-on-mint text-xs font-bold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Oddiy va tizimli bosqichlar
          </span>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight">
            Qanday ishlaydi?
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            Attestatsiyaga tayyorgarlik 4 ta aniq ketma-ket qadamdan iborat. Hech qanday chalkashliksiz, natija sari to‘g‘ri harakat.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="premium-card p-6 sm:p-7 flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif font-extrabold text-2xl font-mono text-accent-blue">
                      {s.num}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider bg-surface-muted text-text-secondary px-2.5 py-1 rounded-full">
                      {s.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-mint text-on-mint flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-serif font-bold text-xl text-text-primary mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-card/60 flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Aniq mezonlar asosida</span>
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
   SECTION 5: COURSES CATALOG (2x2 DESKTOP GRID, 1-COL MOBILE)
   "Kurslar katalogi"
───────────────────────────────────────────────────────────────────────────── */
export function CourseSection({ course }: { course?: CourseMeta }) {
  return (
    <section id="kurslar" className="py-20 sm:py-28 bg-primary-bg scroll-mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-wrap justify-between items-end gap-4 mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-on-mint text-xs font-bold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Ta’lim yo‘nalishlari
            </span>
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
            Barcha kurslarni ko‘rish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desktop 2x2 grid, Mobile 1-column layout */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* 1. Informatika Card */}
          <article className="premium-card overflow-hidden flex flex-col group">
            <div className="w-full aspect-[16/9] overflow-hidden bg-primary-bg relative">
              <img
                src="/images/landing/course-informatika.webp"
                alt="Informatika fani attestatsiyasiga tayyorgarlik kursi"
                width="960"
                height="540"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <span className="absolute top-4 right-4 text-sm font-bold uppercase tracking-wider text-white bg-accent-blue px-3 py-1 rounded-full">
                Faol kurs
              </span>
            </div>
            
            <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
                  <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    8 ta modul
                  </span>
                  <span>•</span>
                  <span>50+ dars va amaliy testlar</span>
                </div>

                <h3 className="font-serif font-bold text-2xl text-text-primary group-hover:text-accent-blue transition-colors">
                  Informatika attestatsiyasi
                </h3>

                <p className="text-sm sm:text-base text-text-secondary leading-relaxed mt-3 mb-6">
                  Informatikadan bilimingizni tekshiring, qiyin mavzularni darslarda takrorlang va testlarda mashq qiling. Sinov imtihonida esa tayyorgarligingizni tekshirib ko‘ring.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-3 pt-5 border-t border-border-card">
                  <Link
                    to="/kurs/attestatsiya"
                    className="inline-flex justify-center items-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-colors"
                  >
                    Kursga kirish <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-5 py-3 font-bold text-accent-blue border border-border-card hover:bg-surface-hover rounded-xl text-sm transition-colors"
                  >
                    Diagnostikadan boshlash
                  </Link>
                </div>
                <div className="mt-5 pt-4 border-t border-border-card/60 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-xs">
                  <span className="text-text-secondary font-medium">Ustozlar:</span>
                  <span className="font-semibold text-text-primary">Qudratova Adolat &amp; Maxramov Nursulton</span>
                </div>
              </div>
            </div>
          </article>

          {/* 2. Tarix Card */}
          <article className="premium-card overflow-hidden flex flex-col group opacity-90">
            <div className="w-full aspect-[16/9] overflow-hidden bg-primary-bg relative">
              <img
                src="/images/landing/course-tarix.webp"
                alt="Tarix fani attestatsiyasiga tayyorgarlik kursi"
                width="960"
                height="540"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-400 px-3 py-1 rounded-full">
                Tez kunda
              </span>
            </div>

            <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
                  <span className="font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                    Dastur tayyorlanmoqda
                  </span>
                </div>

                <h3 className="font-serif font-bold text-2xl text-text-primary">
                  Tarix attestatsiyasi
                </h3>

                <p className="text-sm sm:text-base text-text-secondary leading-relaxed mt-3 mb-6">
                  Tarix o‘qituvchilari uchun ham kurs tayyorlayapmiz. Dastur va darslar haqida kurs ochilganda shu yerda ma’lumot beramiz.
                </p>
              </div>

              <div>
                <div className="pt-5 border-t border-border-card flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-text-secondary font-semibold text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Dastur ishlab chiqilmoqda
                  </span>
                </div>
                <div className="mt-5 pt-4 border-t border-border-card/60 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-xs">
                  <span className="text-text-secondary font-medium">Ustozlar:</span>
                  <span className="font-semibold text-text-primary">Xamrayeva Mahliyo</span>
                </div>
              </div>
            </div>
          </article>

          {/* 3 & 4. Geografiya and Ona tili Cards from upcomingCourses */}
          {upcomingCourses.map((item) => (
            <article
              key={item.id}
              className="premium-card overflow-hidden flex flex-col group opacity-90"
            >
              <div className="w-full aspect-[16/9] overflow-hidden bg-primary-bg relative">
                <img
                  src={item.cover_url}
                  alt={`${item.title} kursi`}
                  width="960"
                  height="540"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-400 px-3 py-1 rounded-full">
                  {item.badge}
                </span>
              </div>

              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
                    <span className="font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                      Rejada
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-2xl text-text-primary">
                    {item.title}
                  </h3>

                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed mt-3 mb-6">
                    {item.description}
                  </p>
                </div>

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
    { num: '24/7', label: 'AI Mentor', desc: 'Har bir xatoga individual mantiqiy tushuntirish' },
    { num: '100%', label: 'Moslashuvchanlik', desc: 'O‘zingizga qulay vaqtda mustaqil tezlikda o‘rganish' },
  ];

  return (
    <section className="py-20 sm:py-24 bg-deep text-white relative overflow-hidden transition-colors duration-200">
      <IslimiCorner className="h-[180px] w-[330px] opacity-90" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Tizimli yondashuv
          </span>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-white">
            Platforma ko‘rsatkichlari
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            Platformadagi barcha kurslar O‘zbekiston Respublikasi pedagog kadrlar attestatsiyasi rasmiy talablari asosida loyihalashtirilgan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((st) => (
            <div
              key={st.label}
              className="bg-[#0A4237] border border-emerald-800/40 rounded-2xl p-6 text-center hover:border-amber-400/40 transition-colors duration-200"
            >
              <div className="font-serif font-extrabold text-4xl sm:text-5xl text-[#F2B544] mb-2 font-mono">
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
   SECTION 8: FAQ ACCORDION (MASCOT-FREE, WITH CLEAN ASSISTANCE CARD)
   "Ko‘p beriladigan savollar"
───────────────────────────────────────────────────────────────────────────── */
const faqGroups = [
  {
    id: 'boshlash',
    title: 'Boshlash',
    items: [
      {
        q: 'Nur Academy kimlar uchun mo‘ljallangan?',
        a: 'Nur Academy umumiy o‘rta ta’lim maktablari va akademik litseylar pedagoglari uchun mo‘ljallangan. Hozirda informatika fani o‘qituvchilari uchun to‘liq attestatsiya dasturi ishlab chiqilgan.'
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
        a: 'Mock imtihon — bu haqiqiy attestatsiya sinovi sharoitini yaratib beruvchi test. Unda savollar soni (50 ta) va vaqt chegarasi (120 daqiqa) rasmiy imtihon talablariga to‘liq mos keladi.'
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
    <section id="savollar" className="py-20 sm:py-28 bg-surface border-t border-border-card scroll-mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Heading and Support card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-on-mint text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Savol-javoblar
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-text-primary leading-tight">
              Ko‘p beriladigan savollar
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Platforma, o‘qish jarayoni va kurslar bo‘yicha eng muhim ma’lumotlar bilan tanishing.
            </p>

            {/* Assistance Card instead of mascot */}
            <div className="rounded-2xl bg-primary-bg p-5 border border-border-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-mint text-on-mint flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-text-primary">
                Boshqa savollaringiz bormi?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Platforma bo‘yicha taklif va savollaringiz bo‘lsa, fikr bildirish sahifasi orqali biz bilan bog‘laning.
              </p>
              <Link
                to="/feedback"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-blue hover:underline pt-1"
              >
                <span>Fikr bildirish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
                        className="premium-card p-0 overflow-hidden border border-border-card transition-all duration-200"
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
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 bg-mint text-on-mint' : 'bg-primary-bg text-text-secondary'
                          }`}>
                            <ChevronDown className="w-4 h-4" />
                          </span>
                        </button>
                        <div
                          className={`px-5 pb-5 text-sm sm:text-base text-text-secondary leading-relaxed border-t border-border-card/40 pt-3 transition-opacity duration-200 ${
                            isOpen ? 'block' : 'hidden'
                          }`}
                        >
                          {item.a}
                        </div>
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
