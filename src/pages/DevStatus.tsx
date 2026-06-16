import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Award, 
  BookOpen, 
  DollarSign, 
  Lock, 
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Activity,
  Check
} from 'lucide-react';

export default function DevStatus() {
  // Mock metrics
  const mvpTotalItems = 12;
  const mvpDoneItems = 8;
  const mvpPercent = Math.round((mvpDoneItems / mvpTotalItems) * 100);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10 text-left font-sans transition-colors duration-250">
      
      {/* Back to Home & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border-card">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-text-secondary mb-1">
            <Link to="/attestatsiya" className="hover:underline flex items-center space-x-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Darslik sahifasiga qaytish</span>
            </Link>
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-text-primary">
            Developer Status Dashboard
          </h1>
          <p className="text-text-secondary text-sm">
            Loyiha taraqqiyoti, MVP holati va keyingi vazifalar monitoringi
          </p>
        </div>
        
        <div className="bg-[#eff6ff] dark:bg-[#1e293b] border border-border-card text-accent-blue px-4.5 py-2 rounded-2xl flex items-center space-x-2.5">
          <Activity className="w-5 h-5 text-accent-blue animate-pulse" />
          <div>
            <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">MVP Readiness</p>
            <p className="text-sm font-extrabold text-text-primary">{mvpPercent}% Tayyor</p>
          </div>
        </div>
      </div>

      {/* 1. GENERAL PROGRESS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tayyor (Implemented)</p>
            <p className="text-3xl font-serif font-extrabold text-text-primary">10 ta</p>
            <p className="text-xs text-text-secondary">To'liq ishlaydigan funksiyalar</p>
          </div>
        </div>

        <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Chala (Partial)</p>
            <p className="text-3xl font-serif font-extrabold text-text-primary">3 ta</p>
            <p className="text-xs text-text-secondary">Ulanish va tahrir talab etiladi</p>
          </div>
        </div>

        <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Hali yo'q (Missing)</p>
            <p className="text-3xl font-serif font-extrabold text-text-primary">5 ta</p>
            <p className="text-xs text-text-secondary">MVP uchun zaruriy modullar</p>
          </div>
        </div>
      </div>

      {/* 2. MVP CHECKLIST & AUDIT LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: MVP Checklist */}
        <div className="bg-surface border border-border-card rounded-[28px] p-6.5 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-border-card/50">
            <Award className="w-5 h-5 text-accent-blue" />
            <h2 className="font-serif font-bold text-lg text-text-primary">MVP Checklist</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Diagnostics test", checked: false },
              { label: "Course roadmap", checked: true },
              { label: "Lesson steps", checked: true },
              { label: "Mini quizzes", checked: true },
              { label: "Error notebook", checked: false },
              { label: "Mock exam", checked: true },
              { label: "Timer", checked: true },
              { label: "Result analytics", checked: true },
              { label: "XP/streak", checked: true },
              { label: "Premium lock", checked: false },
              { label: "Payment", checked: false },
              { label: "Admin panel", checked: false }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all ${
                  item.checked 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-text-primary' 
                    : 'bg-primary-bg/40 border-border-card/30 text-text-secondary'
                }`}
              >
                {item.checked ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                ) : (
                  <CircleIcon className="w-4.5 h-4.5 text-text-secondary shrink-0 opacity-40" />
                )}
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Monetization & Learning Readiness */}
        <div className="space-y-6">
          
          {/* Monetization Readiness Card */}
          <div className="bg-surface border border-border-card rounded-[28px] p-6.5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-card/50">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-accent-blue" />
                <h2 className="font-serif font-bold text-lg text-text-primary">Monetization Readiness</h2>
              </div>
              <span className="text-[10px] bg-rose-500/10 text-rose-600 px-2.5 py-1 rounded-full font-bold">0% Tayyor</span>
            </div>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              Monetizatsiya va to'lov tizimlari hali umuman ulanmagan. Kurs to'liq bepul ishlamoqda.
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-start space-x-2 text-xs">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span className="text-text-secondary">Tarif rejalari (Free, Start, Pro, VIP) yo'q.</span>
              </div>
              <div className="flex items-start space-x-2 text-xs">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span className="text-text-secondary">Payme / Click / Stripe integratsiyasi mavjud emas.</span>
              </div>
              <div className="flex items-start space-x-2 text-xs">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span className="text-text-secondary">Premium qulflar (Paywall locks) modullarda o'rnatilmagan.</span>
              </div>
            </div>
          </div>

          {/* Learning System Readiness Card */}
          <div className="bg-surface border border-border-card rounded-[28px] p-6.5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-card/50">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-accent-blue" />
                <h2 className="font-serif font-bold text-lg text-text-primary">Learning System Audit</h2>
              </div>
              <span className="text-[10px] bg-accent-blue/10 text-accent-blue px-2.5 py-1 rounded-full font-bold">75% Moslik</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-primary-bg rounded-xl space-y-1">
                <p className="font-bold text-text-primary">Yo'nalish (Roadmap)</p>
                <p className="text-[10px] text-text-secondary">Mavjud (Horizontal mini-cards)</p>
              </div>
              <div className="p-3 bg-primary-bg rounded-xl space-y-1">
                <p className="font-bold text-text-primary">Dars oqimi (Flow)</p>
                <p className="text-[10px] text-text-secondary">Ulanish mukammal (Video + Konspekt + Kviz)</p>
              </div>
              <div className="p-3 bg-primary-bg rounded-xl space-y-1">
                <p className="font-bold text-text-primary">Xatolar Daftari</p>
                <p className="text-[10px] text-rose-500 font-semibold">Mutlaqo yo'q</p>
              </div>
              <div className="p-3 bg-primary-bg rounded-xl space-y-1">
                <p className="font-bold text-text-primary">Takrorlash (Spaced)</p>
                <p className="text-[10px] text-rose-500 font-semibold">Hali rejalashtirilmagan</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. NEXT DEV TASKS */}
      <div className="bg-surface border border-border-card rounded-[28px] p-6.5 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-border-card/50">
          <BookOpen className="w-5 h-5 text-accent-blue" />
          <h2 className="font-serif font-bold text-lg text-text-primary">Prioritetli Vazifalar (Top 10 Tasks)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-card text-xs sm:text-sm text-left">
            <thead className="bg-primary-bg/50">
              <tr>
                <th className="px-4 py-3 font-serif font-bold text-text-primary uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 font-serif font-bold text-text-primary uppercase tracking-wider">Vazifa nomi</th>
                <th className="px-4 py-3 font-serif font-bold text-text-primary uppercase tracking-wider">Auditor izohi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card bg-surface font-medium">
              {[
                { priority: "P0", task: "Database sync (Supabase)", desc: "Darslar statusi, streaklar va XP ballarni localStorage'dan ma'lumotlar bazasiga o'tkazish." },
                { priority: "P0", task: "Diagnostika testi va toifa maqsadlari", desc: "User kirganda 55+, 70+, 80+, 86+ maqsadlarni tanlashi uchun wizard yaratish." },
                { priority: "P0", task: "Tariflar rejalari va Paywall lock", desc: "Free, Start, Pro, VIP tariflarini yaratish hamda premium modullarni qulflash." },
                { priority: "P1", task: "Xatolar daftarchasi sahifasi", desc: "Quizzes va mock imtihonlarda xato qilingan savollarni to'plab ko'rsatish." },
                { priority: "P1", task: "To'lov integratsiyasi (Click/Payme)", desc: "Checkout jarayonini simulyatsiya yoki to'liq integratsiya qilish." },
                { priority: "P1", task: "Qolgan 2-8 modullar kontenti", desc: "Mantiq, dasturlash va pedagogika darslarining real konspekt hamda testlarini yuklash." },
                { priority: "P1", task: "Admin panel boshqaruvi", desc: "Yangi savollar va darsliklar qo'shish uchun sodda kontent paneli yaratish." },
                { priority: "P2", task: "Spaced Repetition algoritmi", desc: "Eski darslarni takrorlashni eslatuvchi widget integratsiyasi." },
                { priority: "P2", task: "Kengaytirilgan kviz turlari", desc: "Matching (moslashtirish) va dars ichida kod yozish interaktivligini qo'shish." },
                { priority: "P2", task: "Real study activity tracker", desc: "Foydalanuvchi faolligiga qarab dars o'tash vaqtini hisoblovchi timer." }
              ].map((item, idx) => {
                let badgeStyle = "bg-rose-500/10 text-rose-600";
                if (item.priority === "P1") badgeStyle = "bg-orange-500/10 text-orange-600";
                if (item.priority === "P2") badgeStyle = "bg-blue-500/10 text-blue-600";

                return (
                  <tr key={idx} className="hover:bg-primary-bg/25 transition-colors">
                    <td className="px-4 py-3.5 shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${badgeStyle}`}>{item.priority}</span>
                    </td>
                    <td className="px-4 py-3.5 text-text-primary font-bold">{item.task}</td>
                    <td className="px-4 py-3.5 text-text-secondary">{item.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Minimal circle decorator for empty checkboxes
function CircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
