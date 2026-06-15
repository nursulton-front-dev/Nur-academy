import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  CheckCircle2, 
  TrendingUp, 
  Globe, 
  Users, 
  BookOpen, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Kurslar haqiqatan ham bepulmi?",
      answer: "Ha! Bizning platformadagi barcha boshlang'ich va asosiy kurslar mutlaqo bepul taqdim etiladi. Maqsadimiz – sifatli ta'limni hamma uchun oson va qulay qilish."
    },
    {
      question: "Darslarni qaysi vaqtda ko'rishim mumkin?",
      answer: "Siz darslarni istalgan vaqtda va istalgan joyda, o'zingizga qulay tezlikda ko'rishingiz mumkin. Barcha darslar video formatda yozib olingan va platformaga yuklangan."
    },
    {
      question: "Platformani tamomlagandan so'ng sertifikat beriladimi?",
      answer: "Ha! Har bir kursni muvaffaqiyatli yakunlab, barcha amaliy topshiriq va testlardan o'tganingizdan so'ng, sizga maxsus raqamli sertifikat taqdim etiladi."
    },
    {
      question: "Darslarni o'rganishda yordam beruvchi hamjamiyat bormi?",
      answer: "Albatta. Platformada ro'yxatdan o'tganingizdan so'ng, siz boshqa o'quvchilar va mentorlar bilan muloqot qilishingiz, savollaringizga javob olishingiz uchun maxsus Telegram hamjamiyatiga kirish imkoniga ega bo'lasiz."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Ro'yxatdan o'tish",
      description: "Bor-yo'g'i 30 soniyada bepul hisob yarating va platformaga a'zo bo'ling."
    },
    {
      num: "02",
      title: "Kursni tanlash",
      description: "Keng katalogimizdan o'zingiz qiziqqan yo'nalishdagi sifatli kursni tanlang."
    },
    {
      num: "03",
      title: "Amaliyot va Testlar",
      description: "Har bir mavzuni mustahkamlash uchun interaktiv testlar va topshiriqlarni bajaring."
    },
    {
      num: "04",
      title: "Sertifikat olish",
      description: "Yakuniy imtihondan o'tib, bilimingizni tasdiqlovchi sertifikatga ega bo'ling."
    }
  ];

  const testimonials = [
    {
      name: "Sardor Rahimov",
      role: "Backend Dasturchi",
      text: "AI kursi juda foydali bo'ldi. Mashinali o'qitish tushunchalarini o'zbek tilida bunchalik sodda va tushunarli tushuntirib berishini kutmagan edim. Katta rahmat!",
      stars: 5,
      avatar: "SR"
    },
    {
      name: "Madina Aliyeva",
      role: "Frontend Talabasi",
      text: "Darslarning sifati va interaktiv testlar menga juda yoqdi. O'zlashtirish darajamni har bir darsdan so'ng tekshirib borish ajoyib imkoniyat ekan.",
      stars: 5,
      avatar: "MA"
    },
    {
      name: "Jasur Toshpo'latov",
      role: "UI/UX Dizayner",
      text: "Kurslar bepul ekanligiga ishonish qiyin bo'ldi. Platforma juda qulay, dizayni zamonaviy va darslar juda ham yuqori saviyada tayyorlangan.",
      stars: 5,
      avatar: "JT"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-primary-bg overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-surface py-24 md:py-32 border-b border-border-card overflow-hidden">
        {/* Abstract Decorative Blobs */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-accent-blue/5 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-success-green/5 rounded-full filter blur-3xl -z-10 animate-pulse delay-700"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-full px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>Yangi davr ta'lim platformasi</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-extrabold text-text-primary mb-6 leading-tight max-w-5xl mx-auto">
            Oʻzbek tilida sifatli <br className="hidden md:block"/> onlayn ta'lim
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
            Zamonaviy kasblarni o'zbek tilida o'rganing. Video darslar, interaktiv testlar va shaxsiy progressingizni kuzatib borish imkoniyati – barchasi bir joyda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-accent-blue text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-opacity-95 transition-all shadow-md hover:shadow-accent-blue/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-200"
            >
              <span>Bepul boshlash</span>
              <PlayCircle className="w-5 h-5" />
            </Link>
            <Link
              to="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-surface hover:bg-surface-hover text-text-primary border border-border-card px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-200"
            >
              <span>Kurslar bilan tanishish</span>
              <ArrowRight className="w-5 h-5 text-text-secondary" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary-bg -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface rounded-2xl border border-border-card shadow-lg p-8 md:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <div className="inline-flex p-3 bg-accent-blue/10 rounded-xl mb-3">
                <Users className="w-6 h-6 text-accent-blue" />
              </div>
              <div className="text-3xl md:text-4xl font-bold font-serif text-text-primary mb-1">5,000+</div>
              <div className="text-sm md:text-base text-text-secondary font-medium">Faol O'quvchilar</div>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-success-green/10 rounded-xl mb-3">
                <BookOpen className="w-6 h-6 text-success-green" />
              </div>
              <div className="text-3xl md:text-4xl font-bold font-serif text-text-primary mb-1">15+</div>
              <div className="text-sm md:text-base text-text-secondary font-medium">Amaliy Kurslar</div>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-accent-blue/10 rounded-xl mb-3">
                <Clock className="w-6 h-6 text-accent-blue" />
              </div>
              <div className="text-3xl md:text-4xl font-bold font-serif text-text-primary mb-1">120+</div>
              <div className="text-sm md:text-base text-text-secondary font-medium">Video Darslar</div>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-success-green/10 rounded-xl mb-3">
                <Award className="w-6 h-6 text-success-green" />
              </div>
              <div className="text-3xl md:text-4xl font-bold font-serif text-text-primary mb-1">98%</div>
              <div className="text-sm md:text-base text-text-secondary font-medium">Sertifikat Egalari</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary mb-4">
              Biz sizga nimalarni taklif qilamiz?
            </h2>
            <p className="text-lg text-text-secondary">
              Platformamiz yordamida bilim olish jarayonini yanada samarali va qiziqarli qiling.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<PlayCircle className="w-8 h-8 text-accent-blue" />}
              title="Sifatli video darslar"
              description="Sohaning mutaxassislari tomonidan yozib olingan professional video darslar."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-8 h-8 text-success-green" />}
              title="Amaliy testlar"
              description="Mavzularni mustahkamlash uchun har bir dars oxirida beriladigan testlar."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-accent-blue" />}
              title="Progress monitoring"
              description="Shaxsiy kabinetingizda o'quv natijalari va yutuqlaringizni kuzatib boring."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-accent-blue" />}
              title="Doimiy yangilanish"
              description="Eng so'nggi texnologiyalar bo'yicha yangi kurslar doimiy ravishda qo'shib boriladi."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-surface border-y border-border-card relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary mb-4">
              Qanday ishlaydi?
            </h2>
            <p className="text-lg text-text-secondary">
              Kurslarni muvaffaqiyatli yakunlash va natijaga erishish yo'li bor-yo'g'i to'rtta oddiy qadamdan iborat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="relative p-6 bg-primary-bg rounded-xl border border-border-card shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -top-6 left-6 w-12 h-12 bg-accent-blue text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                  {step.num}
                </div>
                <div className="pt-6">
                  <h3 className="text-xl font-serif font-bold text-text-primary mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Preview */}
      <section className="py-24 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary mb-2">
                Mashhur kurslarimiz
              </h2>
              <p className="text-text-secondary text-lg">
                Hozir o'rganishingiz mumkin bo'lgan dasturlash va texnologiya kurslari
              </p>
            </div>
            <Link to="/courses" className="inline-flex items-center space-x-2 text-accent-blue font-semibold hover:underline">
              <span>Barcha kurslarni ko'rish</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Attestatsiya Course Card (Featured & Active) */}
            <div className="group bg-surface rounded-2xl border-2 border-accent-blue/30 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="aspect-video bg-gradient-to-br from-accent-blue to-[#1d4ed8] flex items-center justify-center relative">
                  <span className="absolute top-4 right-4 bg-[#10B981] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Tavsiya etilgan
                  </span>
                  <GraduationCap className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-8">
                  <h3 className="font-serif font-bold text-2xl text-text-primary mb-3 group-hover:text-accent-blue transition-colors">
                    Informatika o'qituvchilari attestatsiyasi
                  </h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    Informatika fani o'qituvchilarini toifa va attestatsiya imtihonlariga tayyorlovchi maxsus dastur. 8 ta asosiy modul, 50+ savol va mock testlar.
                  </p>
                </div>
              </div>
              <div className="px-8 pb-8">
                <Link 
                  to="/attestatsiya" 
                  className="w-full text-center inline-block bg-accent-blue text-white hover:bg-opacity-95 font-semibold py-3 rounded-xl transition-colors duration-200 shadow-md"
                >
                  Kursni boshlash
                </Link>
              </div>
            </div>

            {/* AI/ML Course Card */}
            <div className="group bg-surface rounded-2xl border border-border-card overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="aspect-video bg-accent-blue/10 flex items-center justify-center relative">
                  <BookOpen className="w-16 h-16 text-accent-blue opacity-40 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-8">
                  <h3 className="font-serif font-bold text-2xl text-text-primary mb-3 group-hover:text-accent-blue transition-colors">
                    AI va Mashinali oʻqitish asoslari
                  </h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    Sun'iy intellekt sohasi boʻyicha amaliy darslar va real loyihalar. Python, ma'lumotlar tahlili va neyron tarmoqlarini noldan boshlab oʻrganing.
                  </p>
                </div>
              </div>
              <div className="px-8 pb-8">
                <Link 
                  to="/courses" 
                  className="w-full text-center inline-block bg-accent-blue/10 hover:bg-accent-blue hover:text-white text-accent-blue font-semibold py-3 rounded-xl transition-colors duration-200"
                >
                  Batafsil ko'rish
                </Link>
              </div>
            </div>
            
            {/* Locked/Future Card */}
            <div className="bg-surface/60 rounded-2xl border border-border-card overflow-hidden opacity-75 flex flex-col justify-between">
              <div>
                <div className="aspect-video bg-surface-muted flex items-center justify-center">
                  <span className="text-text-secondary font-semibold px-4 py-2 bg-surface rounded-full text-sm border border-border-card">
                    Tez kunda
                  </span>
                </div>
                <div className="p-8">
                  <h3 className="font-serif font-bold text-2xl text-text-primary mb-3">
                    Frontend Dasturlash
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    React.js, TailwindCSS va TypeScript yordamida chiroyli hamda interaktiv veb-saytlar va ilovalar yaratishni o'rganing.
                  </p>
                </div>
              </div>
              <div className="px-8 pb-8">
                <div className="w-full text-center bg-surface-muted text-text-secondary font-medium py-3 rounded-xl cursor-not-allowed">
                  Kutilmoqda
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-surface border-t border-border-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary mb-4">
              O'quvchilarimizdan kelgan fikrlar
            </h2>
            <p className="text-lg text-text-secondary">
              Platformamiz orqali bilim olgan va hayotini o'zgartirgan insonlar fikri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-primary-bg p-8 rounded-2xl border border-border-card flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-text-primary italic leading-relaxed mb-6">
                    "{t.text}"
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-accent-blue text-white flex items-center justify-center font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-text-primary">{t.name}</h4>
                    <p className="text-xs text-text-secondary font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary mb-4">
              Ko'p beriladigan savollar
            </h2>
            <p className="text-lg text-text-secondary">
              Savollaringiz bormi? Quyidagi javoblar orqali kerakli ma'lumotni oling.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-surface rounded-xl border border-border-card overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none group"
                  >
                    <span className="font-serif font-bold text-lg text-text-primary group-hover:text-accent-blue transition-colors">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-accent-blue transition-transform" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-secondary transition-transform" />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-6 text-text-secondary leading-relaxed border-t border-border-card/50 pt-4 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 bg-accent-blue text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-accent-blue to-accent-blue/90 -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold mb-6 leading-tight">
            Oʻz kelajagingizga bugunoq sarmoya kiriting
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Platformamizda bepul roʻyxatdan oʻting, mutaxassis mentorlardan ta'lim oling va sertifikatga ega bo'ling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-block bg-white text-accent-blue px-10 py-4 rounded-xl font-bold text-lg hover:bg-opacity-95 transition-all shadow-md active:scale-95 duration-200"
            >
              Bepul boshlash
            </Link>
            <Link
              to="/courses"
              className="w-full sm:w-auto inline-block bg-transparent text-white border border-white/30 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all active:scale-95 duration-200"
            >
              Bizning kurslar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-surface p-8 rounded-xl border border-border-card hover:border-accent-blue hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col items-start">
      <div className="mb-6 bg-primary-bg w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-border-card/50">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-bold text-text-primary mb-3">
        {title}
      </h3>
      <p className="text-text-secondary leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}

