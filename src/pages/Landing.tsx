import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, CheckCircle2, TrendingUp, Globe } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-surface py-20 border-b border-border-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-text-primary mb-6 leading-tight max-w-4xl mx-auto">
            Oʻzbek tilida sifatli <br className="hidden md:block"/> onlayn ta'lim
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Video darslar, interaktiv testlar va shaxsiy progressingizni kuzatib borish imkoniyati. Bugunoq oʻrganishni boshlang!
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center space-x-2 bg-accent-blue text-white px-8 py-3.5 rounded-xl font-medium text-lg hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
          >
            <span>Bepul boshlash</span>
            <PlayCircle className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-center text-text-primary mb-12">
            Platforma imkoniyatlari
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<PlayCircle className="w-8 h-8 text-accent-blue" />}
              title="Video darslar"
              description="Yuqori sifatli va zamonaviy darslar orqali bilim oling"
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-8 h-8 text-success-green" />}
              title="Testlar"
              description="Oʻtilgan mavzularni amaliy testlar orqali mustahkamlang"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-accent-blue" />}
              title="Shaxsiy progress"
              description="Oʻz natijalaringizni kuzatib boring va oʻsing"
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-accent-blue" />}
              title="Oʻzbek tilida"
              description="Barcha materiallar sof oʻzbek tilida taqdim etiladi"
            />
          </div>
        </div>
      </section>

      {/* Courses Preview */}
      <section className="py-20 bg-surface border-t border-border-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-serif font-bold text-text-primary">
              Mavjud kurslar
            </h2>
            <Link to="/courses" className="text-accent-blue font-medium hover:underline">
              Barchasini koʻrish →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-surface rounded-xl border border-border-card overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="aspect-video bg-surface-muted relative">
                <span className="absolute top-4 right-4 bg-success-green text-white text-xs font-bold px-3 py-1 rounded-full">
                  Yangi
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif font-bold text-xl text-text-primary mb-2 group-hover:text-accent-blue transition-colors">
                  AI va Mashinali oʻqitish asoslari
                </h3>
                <p className="text-text-secondary mb-4 line-clamp-2">
                  Sun'iy intellekt sohasi boʻyicha amaliy darslar va real loyihalar. Noldan boshlab oʻrganing.
                </p>
                <Link to="/courses" className="text-accent-blue font-medium hover:underline inline-flex items-center">
                  Kursni koʻrish <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
            
            <div className="bg-surface rounded-xl border border-border-card overflow-hidden opacity-70">
              <div className="aspect-video bg-surface-hover flex items-center justify-center">
                <span className="text-text-secondary font-medium px-4 py-2 bg-border-card rounded-full text-sm">
                  Tez kunda
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif font-bold text-xl text-text-primary mb-2">
                  Frontend Dasturlash
                </h3>
                <p className="text-text-secondary">
                  React va zamonaviy web texnologiyalar.
                </p>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border-card overflow-hidden opacity-70">
              <div className="aspect-video bg-surface-hover flex items-center justify-center">
                <span className="text-text-secondary font-medium px-4 py-2 bg-border-card rounded-full text-sm">
                  Tez kunda
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif font-bold text-xl text-text-primary mb-2">
                  Backend Dasturlash
                </h3>
                <p className="text-text-secondary">
                  Node.js va ma'lumotlar bazasi asoslari.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-accent-blue text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Oʻz kelajagingizga sarmoya kiriting
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10">
            Hozir roʻyxatdan oʻting va mavjud barcha imkoniyatlardan bepul foydalaning.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-accent-blue px-10 py-3.5 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            Bepul boshlash
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-surface p-8 rounded-xl border border-border-card hover:border-accent-blue transition-colors duration-300 shadow-sm cursor-pointer group">
      <div className="mb-6 bg-primary-bg w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-bold text-text-primary mb-3">
        {title}
      </h3>
      <p className="text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
