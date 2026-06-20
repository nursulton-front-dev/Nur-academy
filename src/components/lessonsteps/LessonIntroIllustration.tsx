import React from 'react';
import { Target, BookOpen, MonitorPlay, Puzzle, LayoutTemplate, FileSpreadsheet, GraduationCap } from 'lucide-react';

export type IntroIllustrationVariant = "strategy" | "pedagogy" | "informatics" | "logic" | "web" | "practical" | "final";

interface Props {
  variant?: IntroIllustrationVariant;
}

export function LessonIntroIllustration({ variant = "strategy" }: Props) {
  const getIllustration = () => {
    switch (variant) {
      case "strategy":
        return {
          icon: Target,
          colors: "from-blue-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:to-indigo-500/30",
          iconColor: "text-blue-500",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          shapes: [
            "top-4 right-8 w-16 h-16 bg-blue-400/20 rounded-full",
            "bottom-8 left-6 w-24 h-24 bg-indigo-400/20 rounded-xl rotate-12"
          ]
        };
      case "pedagogy":
        return {
          icon: BookOpen,
          colors: "from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/30 dark:to-teal-500/30",
          iconColor: "text-emerald-500",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          shapes: [
            "top-6 left-10 w-20 h-20 bg-emerald-400/20 rounded-full",
            "bottom-10 right-8 w-16 h-16 bg-teal-400/20 rounded-2xl -rotate-12"
          ]
        };
      case "informatics":
        return {
          icon: MonitorPlay,
          colors: "from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/30 dark:to-blue-500/30",
          iconColor: "text-cyan-500",
          bg: "bg-cyan-50 dark:bg-cyan-900/20",
          shapes: [
            "top-8 right-12 w-24 h-24 bg-cyan-400/20 rounded-lg rotate-45",
            "bottom-6 left-8 w-14 h-14 bg-blue-400/20 rounded-full"
          ]
        };
      case "logic":
        return {
          icon: Puzzle,
          colors: "from-purple-500/20 to-fuchsia-500/20 dark:from-purple-500/30 dark:to-fuchsia-500/30",
          iconColor: "text-purple-500",
          bg: "bg-purple-50 dark:bg-purple-900/20",
          shapes: [
            "top-10 left-12 w-16 h-16 bg-purple-400/20 rounded-xl rotate-45",
            "bottom-8 right-10 w-20 h-20 bg-fuchsia-400/20 rounded-full"
          ]
        };
      case "web":
        return {
          icon: LayoutTemplate,
          colors: "from-orange-500/20 to-amber-500/20 dark:from-orange-500/30 dark:to-amber-500/30",
          iconColor: "text-orange-500",
          bg: "bg-orange-50 dark:bg-orange-900/20",
          shapes: [
            "top-4 left-6 w-24 h-8 bg-orange-400/20 rounded-md",
            "bottom-10 right-10 w-16 h-16 bg-amber-400/20 rounded-full"
          ]
        };
      case "practical":
        return {
          icon: FileSpreadsheet,
          colors: "from-green-500/20 to-emerald-500/20 dark:from-green-500/30 dark:to-emerald-500/30",
          iconColor: "text-green-500",
          bg: "bg-green-50 dark:bg-green-900/20",
          shapes: [
            "top-8 right-8 w-16 h-20 bg-green-400/20 rounded-lg rotate-12",
            "bottom-8 left-10 w-20 h-20 bg-emerald-400/20 rounded-full"
          ]
        };
      case "final":
        return {
          icon: GraduationCap,
          colors: "from-amber-400/20 to-yellow-500/20 dark:from-amber-400/30 dark:to-yellow-500/30",
          iconColor: "text-amber-500",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          shapes: [
            "top-6 right-10 w-24 h-24 bg-amber-400/20 rounded-full",
            "bottom-8 left-8 w-16 h-16 bg-yellow-400/20 rounded-xl rotate-45"
          ]
        };
    }
  };

  const config = getIllustration();
  const Icon = config.icon;

  return (
    <div className={`w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl bg-gradient-to-br ${config.colors} flex items-center justify-center p-8 relative overflow-hidden`}>
      {/* Abstract floating shapes */}
      {config.shapes.map((className, idx) => (
        <div key={idx} className={`absolute ${className} backdrop-blur-3xl animate-pulse`} style={{ animationDuration: `${3 + idx * 2}s` }} />
      ))}
      
      {/* Central icon container */}
      <div className={`relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full ${config.bg} shadow-xl shadow-black/5 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-white/5`}>
        <Icon className={`w-16 h-16 md:w-20 md:h-20 ${config.iconColor}`} strokeWidth={1.5} />
      </div>
    </div>
  );
}
