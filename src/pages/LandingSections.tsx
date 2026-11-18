import { upcomingCourses } from '../data/upcomingCourses';
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BookOpen, Brain, Timer, Plus, Minus, MessageSquare, CheckCircle2 } from 'lucide-react';
import type { CourseMeta } from '../lib/courses';

const tabs = [
  { id: 'diagnostic', title: 'Diagnostika', detail: 'Bilimingizni tekshiring', icon: Activity },
  { id: 'lessons', title: 'Darslar va konspektlar', detail: 'Mavzularni izchil o‘rganing', icon: BookOpen },
  { id: 'mentor', title: 'AI Mentor', detail: 'Xatolar sababini tushuning', icon: Brain },
  { id: 'exam', title: 'Sinov imtihoni', detail: 'Tayyorgarligingizni sinang', icon: Timer },
] as const;

export function PlatformDemo() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-bold tracking-widest text-accent-blue uppercase">PLATFORMA BILAN TANISHING</p>
        <h2 id="demo-heading" className="font-serif font-extrabold text-3xl sm:text-4xl mt-3 text-text-primary">
          Tayyorgarlik jarayoni — bir joyda
        </h2>
        <p className="text-base sm:text-lg text-text-secondary mt-3 leading-relaxed">
          Qaysi mavzularni takrorlash kerakligini bilib oling. Darslarni o‘qing, test yeching va natijangizni kuzating.
        </p>
      </div>

      <div className="grid lg:grid-cols-[35%_65%] bg-primary-bg border border-border-card rounded-3xl shadow-sm overflow-hidden">
        <div
          role="tablist"
          aria-label="Platforma imkoniyatlari"
          aria-orientation="vertical"
          className="p-3 sm:p-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-2 lg:border-r border-border-card content-start"
        >
          {tabs.map(({ id, title, detail, icon: Icon }, index) => (
            <button
              key={id}
              ref={(el) => { refs.current[index] = el; }}
              type="button"
              role="tab"
              id={`demo-tab-${id}`}
              aria-controls={`demo-panel-${id}`}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={`min-h-[76px] w-full text-left flex items-center gap-4 p-4 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-blue transition-all cursor-pointer ${
                active === index ? 'bg-accent-blue text-white shadow-sm' : 'text-text-primary hover:bg-surface'
              }`}
            >
              <Icon aria-hidden="true" className="w-6 h-6 shrink-0" />
              <span>
                <span className="block font-bold text-base">{title}</span>
                <span className={`block text-xs sm:text-sm leading-snug mt-1 ${active === index ? 'text-white/90' : 'text-text-secondary'}`}>
                  {detail}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="bg-surface p-5 sm:p-8 min-h-[460px] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between gap-2 mb-6 text-sm">
              <span className="font-semibold text-text-secondary">Informatika kursi misolida</span>
              <span className="font-bold text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-full">Namuna</span>
            </div>

            {tabs.map(({ id }, index) => (
              <div
                key={id}
                id={`demo-panel-${id}`}
                role="tabpanel"
                aria-labelledby={`demo-tab-${id}`}
                hidden={active !== index}
                tabIndex={0}
                className="focus-visible:outline-2 focus-visible:outline-accent-blue rounded-lg"
              >
                {id === 'diagnostic' && (
                  <>
                    <h3 className="font-serif font-bold text-2xl mb-2 text-text-primary">Mavzular bo‘yicha natija</h3>
                    <p className="text-text-secondary text-base mb-5">Qaysi mavzuga ko‘proq e’tibor qaratish kerakligini ko‘ring.</p>
                    <div className="space-y-4 max-w-lg">
                      {[
                        ['Raqamli savodxonlik', 80],
                        ['Sanoq sistemalari', 55],
                        ['Dasturlash asoslari', 70]
                      ].map(([name, value]) => (
                        <div key={name}>
                          <div className="flex justify-between gap-4 font-semibold text-sm mb-1 text-text-primary">
                            <span>{name}</span>
                            <span>{value}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-primary-bg overflow-hidden border border-border-card/50">
                            <div className="h-full bg-accent-blue rounded-full transition-all duration-500" style={{ width: `${value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-6 text-sm bg-accent-blue/10 text-text-primary rounded-xl p-4 border border-accent-blue/20">
                      <strong>Tavsiya:</strong> Sanoq sistemalari mavzusi bo‘yicha konspekt va testlarni takrorlang.
                    </p>
                  </>
                )}

                {id === 'lessons' && (
                  <>
                    <h3 className="font-serif font-bold text-2xl mb-4 text-text-primary">Darslar va konspekt</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <p className="font-bold mb-3 text-text-primary text-sm uppercase tracking-wider">Mavzu darslari</p>
                        <ul className="text-sm space-y-2.5 text-text-secondary">
                          <li className="text-accent-blue font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent-blue" />
                            01 · Sanoq sistemalari
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-border-card" />
                            02 · Ikkilik sanoq sistemasi
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-border-card" />
                            03 · Oʻnlikdan ikkilikka oʻtish
                          </li>
                        </ul>
                      </div>
                      <div className="bg-primary-bg rounded-2xl p-5 border border-border-card/60">
                        <p className="font-bold mb-2 text-text-primary text-sm">Qisqa konspekt</p>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          Ikkilik sanoq sistemasida faqat 0 va 1 raqamlari ishlatiladi. Har bir pozitsiya ikkining darajasini (2⁰, 2¹, 2², 2³...) ifodalaydi.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {id === 'mentor' && (
                  <>
                    <h3 className="font-serif font-bold text-2xl mb-3 text-text-primary">Xatodan o‘rganing</h3>
                    <p className="text-sm text-text-secondary mb-4">Savol: 25 soni ikkilik sanoq sistemasida qanday yoziladi?</p>
                    <div className="bg-primary-bg rounded-2xl p-5 border border-border-card/60">
                      <p className="font-bold text-accent-blue mb-2 text-sm flex items-center gap-1.5">
                        <Brain className="w-4 h-4" />
                        AI Mentor tushuntirishi
                      </p>
                      <p className="text-sm leading-relaxed text-text-secondary">
                        25 ni ketma-ket 2 ga bo‘ling va qoldiqlarni teskari tartibda yozing: 25 = 16 + 8 + 1 = 11001₂. Siz belgilagan variantda 2-daraja (4) xato qo‘shilgan.
                      </p>
                    </div>
                    <p className="mt-4 text-xs text-text-secondary">Shaxsiy izoh har bir xatoni tushunishga yordam beradi.</p>
                  </>
                )}

                {id === 'exam' && (
                  <>
                    <div className="flex justify-between items-center gap-3 mb-4">
                      <h3 className="font-serif font-bold text-2xl text-text-primary">Sinov imtihoni</h3>
                      <span className="font-mono font-bold text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-lg text-sm">
                        01:54:20
                      </span>
                    </div>
                    <p className="font-semibold text-sm mb-4 text-text-primary">25 soni ikkilik sanoq sistemasida qanday yoziladi?</p>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {['A · 10101', 'B · 11001', 'C · 11100', 'D · 10011'].map((answer, i) => (
                        <div
                          key={answer}
                          className={`p-3 rounded-xl text-sm border ${
                            i === 1
                              ? 'bg-accent-blue/10 text-accent-blue font-bold border-accent-blue/30'
                              : 'bg-primary-bg border-border-card/40 text-text-secondary'
                          }`}
                        >
                          {answer}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-5 text-xs text-text-secondary">
                      <span className="mr-1">Savollar navigatsiyasi:</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold ${
                            n === 2 ? 'bg-accent-blue text-white' : 'bg-primary-bg border border-border-card'
                          }`}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border-card/60 flex items-center justify-between text-xs text-text-secondary">
            <span>Interaktiv namunani sinab koʻring</span>
            <Link to="/kurs/attestatsiya" className="font-bold text-accent-blue hover:underline inline-flex items-center gap-1">
              Kurs sahifasiga oʻtish <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseSection({ course }: { course?: CourseMeta }) {
  return (
    <section id="kurslar" className="py-20 sm:py-28 bg-primary-bg scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest text-accent-blue uppercase">TA’LIM YO‘NALISHLARI</p>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl mt-3 text-text-primary">
              O‘z yo‘nalishingizni tanlang
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Informatika Card */}
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

          {/* Tarix Card */}
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
        q: 'Darslar va konspektlar qanday tashkil etilgan?',
        a: 'Har bir dars qisqa nazariy tushuntirish, amaliy misollar va mavzuni xulosa qiluvchi tayyor konspektdan iborat. Mavzuni o‘zlashtirganingizdan so‘ng mavzu testlarini yechishingiz mumkin.'
      },
      {
        q: 'AI Mentor qanday yordam beradi?',
        a: 'Mavzu testlarida xato javob berganingizda, AI Mentor to‘g‘ri javobni shunchaki ko‘rsatib qo‘ymasdan, xatoingizning sababini va to‘g‘ri yechish algoritmini bosqichma-bosqich tushuntiradi.'
      },
      {
        q: 'Sinov imtihoni (Mock imtihon) qanday ishlaydi?',
        a: 'Sinov imtihoni haqiqiy attestatsiya talablariga mos tarzda 120 daqiqa davom etadi va 50 ta savoldan iborat bo‘ladi. Imtihon yakunida har bir bo‘lim bo‘yicha batafsil ball va xatolar tahlili taqdim etiladi.'
      },
      {
        q: 'Xatolarim ustida qayta ishlashim mumkinmi?',
        a: 'Ha, platformadagi «Xatolar daftarchasi» bo‘limida barcha testlarda xato qilingan savollar avtomatik to‘planadi va ularni istalgan vaqtda qayta ishlab, xotirada mustahkamlash mumkin.'
      }
    ]
  },
  {
    id: 'tariflar',
    title: 'Tariflar va yordam',
    items: [
      {
        q: 'Qaysi imkoniyatlardan bepul foydalanish mumkin?',
        a: 'Ro‘yxatdan o‘tish bepul. Barcha foydalanuvchilar bosqichma-bosqich ochiluvchi modul darslari, 1 ta to‘liq 50 savolli Diagnostika testi va mavzu testlaridan bepul foydalanishlari mumkin.'
      },
      {
        q: 'Pro tarifi nimasi bilan farq qiladi?',
        a: 'Pro tarifi shaxsiy AI Mentor tushuntirishlarini, xatolar daftarchasini (spaced repetition), cheksiz diagnostika va chuqur tahlillarni taqdim etadi.'
      },
      {
        q: 'Onlayn to‘lovlar qanday amalga oshiriladi?',
        a: 'Hozirda platforma dastlabki ochiq rejimda ishlamoqda. Onlayn toʻlov tizimlari (Payme / Click) rasmiy integratsiya qilinmoqda. Yangilanishlar haqida obuna sahifasida xabar beriladi.'
      },
      {
        q: 'Savol yoki texnik muammo bo‘lsa, qayerga murojaat qilaman?',
        a: '«Fikr bildirish» sahifasida bizga yozing. Qaysi sahifada nima bo‘lganini tushuntirsangiz, muammoni tekshirishimiz osonroq bo‘ladi.'
      }
    ]
  }
];

export function FaqSection() {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(0);
  const groupRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentGroup = faqGroups[activeGroupIndex] || faqGroups[0];

  function onGroupKeyDown(e: React.KeyboardEvent, index: number) {
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % faqGroups.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index + faqGroups.length - 1) % faqGroups.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = faqGroups.length - 1;
    else return;

    e.preventDefault();
    setActiveGroupIndex(next);
    setOpenItemIndex(0);
    groupRefs.current[next]?.focus();
  }

  return (
    <section id="savollar" className="py-20 sm:py-28 bg-surface border-t border-border-card scroll-mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-accent-blue uppercase">SAVOL-JAVOB</p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl mt-3 text-text-primary">
            Bilmoqchi bo‘lganlaringiz
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-3 max-w-xl mx-auto">
            Kurslar, o‘qish jarayoni va kirish shartlari bo‘yicha eng ko‘p beriladigan savollar.
          </p>
        </div>

        {/* Compact Horizontal Topic Switcher */}
        <div
          role="tablist"
          aria-label="FAQ mavzulari"
          className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-primary-bg rounded-2xl border border-border-card max-w-md mx-auto mb-8"
        >
          {faqGroups.map((group, idx) => (
            <button
              key={group.id}
              ref={(el) => { groupRefs.current[idx] = el; }}
              role="tab"
              id={`faq-tab-${group.id}`}
              aria-controls={`faq-panel-${group.id}`}
              aria-selected={activeGroupIndex === idx}
              tabIndex={activeGroupIndex === idx ? 0 : -1}
              onClick={() => {
                setActiveGroupIndex(idx);
                setOpenItemIndex(0);
              }}
              onKeyDown={(e) => onGroupKeyDown(e, idx)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent-blue ${
                activeGroupIndex === idx
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
            >
              {group.title}
            </button>
          ))}
        </div>

        {/* Questions Accordion (Single item open at a time within selected topic) */}
        <div
          id={`faq-panel-${currentGroup.id}`}
          role="tabpanel"
          aria-labelledby={`faq-tab-${currentGroup.id}`}
          className="bg-primary-bg rounded-3xl border border-border-card overflow-hidden shadow-sm divide-y divide-border-card"
        >
          {currentGroup.items.map((item, idx) => {
            const isOpen = openItemIndex === idx;
            const itemId = `${currentGroup.id}-${idx}`;

            return (
              <div key={item.q} className={`transition-colors ${isOpen ? 'bg-surface/50' : ''}`}>
                <h3>
                  <button
                    id={`faq-btn-${itemId}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-ans-${itemId}`}
                    onClick={() => setOpenItemIndex(isOpen ? null : idx)}
                    className="w-full min-h-[64px] px-6 py-4 text-left flex justify-between items-center gap-4 font-bold text-sm sm:text-base text-text-primary hover:text-accent-blue transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-blue"
                  >
                    <span>{item.q}</span>
                    <span className="shrink-0 w-8 h-8 rounded-full bg-surface border border-border-card flex items-center justify-center text-accent-blue">
                      {isOpen ? <Minus aria-hidden="true" className="w-4 h-4" /> : <Plus aria-hidden="true" className="w-4 h-4" />}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-ans-${itemId}`}
                  role="region"
                  aria-labelledby={`faq-btn-${itemId}`}
                  hidden={!isOpen}
                  className="px-6 pb-5 pt-1 text-sm text-text-secondary leading-relaxed"
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>

        {/* Narrow feedback bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-border-card text-xs sm:text-sm">
          <div className="flex items-center gap-3 text-text-secondary">
            <MessageSquare className="w-5 h-5 text-accent-blue shrink-0" />
            <span>Javob topa olmadingizmi? Savol yoki taklifingiz boʻlsa, bizga yozing.</span>
          </div>
          <Link
            to="/feedback"
            className="inline-flex items-center gap-1.5 font-bold text-accent-blue hover:underline shrink-0"
          >
            <span>Fikr bildirish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
