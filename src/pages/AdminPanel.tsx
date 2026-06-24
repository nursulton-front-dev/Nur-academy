import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { supabase } from '../lib/supabase';
import {
  Users, BookOpen, HelpCircle, BarChart3, AlertTriangle,
  Plus, TrendingUp, Award, ClipboardList, CheckSquare, Star,
  ShieldCheck
} from 'lucide-react';

type AdminTab = 'overview' | 'questions' | 'modules' | 'users' | 'analytics';

interface QuestionRow {
  id: string;
  domain: string;
  subdomain: string | null;
  question_type: string;
  difficulty: string;
}

interface UserRow {
  id: string;
  full_name: string | null;
  role: string;
  subscription_tier: string | null;
  is_admin: boolean;
  xp: number | null;
  created_at?: string;
}

interface ExamAttemptRow {
  id: string;
  user_id: string;
  total_score: number | null;
  max_score: number | null;
  finished_at: string | null;
  exam_id_text: string | null;
  profiles?: { full_name: string | null } | null;
}

interface DiagnosticRow {
  id: string;
  user_id: string;
  score: number | null;
  finished_at: string | null;
  profiles?: { full_name: string | null } | null;
}

interface OverviewStats {
  totalUsers: number;
  proUsers: number;
  enrolledUsers: number;
  totalQuestions: number;
  finishedExams: number;
  avgExamScore: number | null;
  finishedDiagnostics: number;
  completedLessons: number;
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-surface border border-border-card rounded-2xl p-5 space-y-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-serif font-extrabold text-text-primary">{value}</p>
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{label}</p>
    </div>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Overview stats
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0, proUsers: 0, enrolledUsers: 0, totalQuestions: 0,
    finishedExams: 0, avgExamScore: null, finishedDiagnostics: 0, completedLessons: 0,
  });

  // Tab data
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [recentExams, setRecentExams] = useState<ExamAttemptRow[]>([]);
  const [recentDiagnostics, setRecentDiagnostics] = useState<DiagnosticRow[]>([]);
  const [tierBreakdown, setTierBreakdown] = useState<Array<{ tier: string; count: number }>>([]);
  const [topXpUsers, setTopXpUsers] = useState<UserRow[]>([]);

  // Question form
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    domain: '', subdomain: '', question_type: 'multiple_choice', difficulty: 'medium',
    question_text: '',
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  });

  useEffect(() => {
    if (!loading && isAdmin) loadAdminData();
  }, [isAdmin, loading]);

  async function loadAdminData() {
    const [
      { count: uCount },
      { count: proCount },
      { data: enrollData },
      { count: qCount },
      { data: examData },
      { count: diagCount },
      { count: lessonsCount },
      { data: qRows },
      { data: uRows },
      { data: recentDiagData },
      { data: tierData },
      { data: topXp },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'pro'),
      supabase.from('enrollments').select('user_id').limit(1000),
      supabase.from('question_bank').select('*', { count: 'exact', head: true }),
      supabase.from('exam_attempts').select('total_score, max_score').not('finished_at', 'is', null),
      supabase.from('diagnostic_attempts').select('*', { count: 'exact', head: true }).not('finished_at', 'is', null),
      supabase.from('progress').select('*', { count: 'exact', head: true }).eq('completed', true),
      supabase.from('question_bank').select('id, domain, subdomain, question_type, difficulty').order('id', { ascending: false }).limit(50),
      supabase.from('profiles').select('id, full_name, role, subscription_tier, is_admin, xp').order('created_at', { ascending: false }).limit(100),
      supabase.from('diagnostic_attempts').select('id, user_id, score, finished_at, profiles(full_name)').not('finished_at', 'is', null).order('finished_at', { ascending: false }).limit(20),
      supabase.from('profiles').select('subscription_tier').limit(1000),
      supabase.from('profiles').select('id, full_name, role, subscription_tier, is_admin, xp').order('xp', { ascending: false }).limit(10),
    ]);

    // Unique enrolled users
    const uniqueEnrolled = new Set((enrollData || []).map(e => e.user_id)).size;

    // Avg exam score
    let avgScore: number | null = null;
    if (examData && examData.length > 0) {
      const scored = examData.filter(e => e.total_score != null && e.max_score != null && e.max_score > 0);
      if (scored.length > 0) {
        avgScore = Math.round(scored.reduce((s, e) => s + (e.total_score! / e.max_score!) * 100, 0) / scored.length);
      }
    }

    setStats({
      totalUsers: uCount || 0,
      proUsers: proCount || 0,
      enrolledUsers: uniqueEnrolled,
      totalQuestions: qCount || 0,
      finishedExams: examData?.length || 0,
      avgExamScore: avgScore,
      finishedDiagnostics: diagCount || 0,
      completedLessons: lessonsCount || 0,
    });

    if (qRows) setQuestions(qRows);
    if (uRows) setUsers(uRows as UserRow[]);

    // Recent exams: separate query with join
    const { data: examRows } = await supabase
      .from('exam_attempts')
      .select('id, user_id, total_score, max_score, finished_at, exam_id_text, profiles(full_name)')
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .limit(20);
    if (examRows) setRecentExams(examRows as ExamAttemptRow[]);

    if (recentDiagData) setRecentDiagnostics(recentDiagData as DiagnosticRow[]);

    // Tier breakdown
    if (tierData) {
      const counts: Record<string, number> = {};
      for (const row of tierData) {
        const t = row.subscription_tier || 'free';
        counts[t] = (counts[t] || 0) + 1;
      }
      setTierBreakdown(Object.entries(counts).map(([tier, count]) => ({ tier, count })).sort((a, b) => b.count - a.count));
    }

    if (topXp) setTopXpUsers(topXp as UserRow[]);
  }

  async function handleAddQuestion() {
    if (!newQuestion.domain || !newQuestion.question_text) return;

    const { data: qb, error: qbErr } = await supabase.from('question_bank').insert({
      domain: newQuestion.domain,
      subdomain: newQuestion.subdomain || null,
      question_type: newQuestion.question_type,
      difficulty: newQuestion.difficulty,
    }).select().single();

    if (qbErr || !qb) { console.error('Failed to insert question:', qbErr); return; }

    const { error: tErr } = await supabase.from('question_bank_translations').insert({
      question_id: qb.id,
      locale: 'uz',
      question_text: newQuestion.question_text,
      options: newQuestion.options,
    });

    if (tErr) { console.error('Failed to insert translation:', tErr); return; }

    setShowQuestionForm(false);
    setNewQuestion({
      domain: '', subdomain: '', question_type: 'multiple_choice', difficulty: 'medium',
      question_text: '',
      options: [{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }],
    });
    loadAdminData();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-16 h-16 text-warning-amber mx-auto mb-4" />
        <h2 className="text-xl font-serif font-extrabold text-text-primary mb-2">Ruxsat yo'q</h2>
        <p className="text-text-secondary">Sizda admin huquqi yo'q.</p>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Umumiy', icon: BarChart3 },
    { id: 'questions', label: 'Savollar', icon: HelpCircle },
    { id: 'modules', label: 'Modullar', icon: BookOpen },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'analytics', label: 'Analitika', icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-extrabold text-text-primary">Admin Panel</h1>
        <p className="text-sm text-text-secondary mt-1">Platforma boshqaruvi</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-accent-blue text-white shadow-md'
                : 'bg-surface border border-border-card text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Foydalanuvchilar" value={stats.totalUsers} color="bg-accent-blue/10 text-accent-blue" />
            <StatCard icon={Award} label="Pro obunachi" value={stats.proUsers} color="bg-purple-500/10 text-purple-500" />
            <StatCard icon={BookOpen} label="Kursga yozilgan" value={stats.enrolledUsers} color="bg-success-green/10 text-success-green" />
            <StatCard icon={HelpCircle} label="Savollar" value={stats.totalQuestions} color="bg-warning-amber/10 text-warning-amber" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={ClipboardList} label="Imtihon topshirildi" value={stats.finishedExams} color="bg-accent-blue/10 text-accent-blue" />
            <StatCard icon={BarChart3} label="O'rtacha ball" value={stats.avgExamScore != null ? `${stats.avgExamScore}%` : '—'} color="bg-success-green/10 text-success-green" />
            <StatCard icon={TrendingUp} label="Diagnostika tugandi" value={stats.finishedDiagnostics} color="bg-purple-500/10 text-purple-500" />
            <StatCard icon={CheckSquare} label="Dars tugatildi" value={stats.completedLessons} color="bg-warning-amber/10 text-warning-amber" />
          </div>
        </div>
      )}

      {/* ─── QUESTIONS ─── */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Savollar bazasi</h3>
            <button
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/95 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Yangi savol
            </button>
          </div>

          {showQuestionForm && (
            <div className="bg-surface border border-border-card rounded-[24px] p-6 space-y-4">
              <h4 className="text-sm font-bold text-text-primary">Yangi savol qo'shish</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Bo'lim</label>
                  <select value={newQuestion.domain} onChange={e => setNewQuestion(p => ({ ...p, domain: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border-card bg-surface text-sm text-text-primary focus:outline-none focus:border-accent-blue">
                    <option value="">Tanlang</option>
                    <option value="Axborot va raqamli savodxonlik">Axborot va raqamli savodxonlik</option>
                    <option value="Kompyuter savodxonligi">Kompyuter savodxonligi</option>
                    <option value="Mantiq va sanoq sistemalari">Mantiq va sanoq sistemalari</option>
                    <option value="Dasturlash asoslari">Dasturlash asoslari</option>
                    <option value="Grafik va multimediya">Grafik va multimediya</option>
                    <option value="Tarmoq va internet">Tarmoq va internet</option>
                    <option value="Kiberxavfsizlik">Kiberxavfsizlik</option>
                    <option value="Pedagogika va metodika">Pedagogika va metodika</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Qiyinlik</label>
                  <select value={newQuestion.difficulty} onChange={e => setNewQuestion(p => ({ ...p, difficulty: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border-card bg-surface text-sm text-text-primary focus:outline-none focus:border-accent-blue">
                    <option value="easy">Oson</option>
                    <option value="medium">O'rtacha</option>
                    <option value="hard">Qiyin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Subdomain</label>
                  <input type="text" value={newQuestion.subdomain} onChange={e => setNewQuestion(p => ({ ...p, subdomain: e.target.value }))}
                    placeholder="Masalan: Python OOP"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border-card bg-surface text-sm text-text-primary focus:outline-none focus:border-accent-blue" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase">Savol matni</label>
                <textarea value={newQuestion.question_text} onChange={e => setNewQuestion(p => ({ ...p, question_text: e.target.value }))}
                  rows={3}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border-card bg-surface text-sm text-text-primary focus:outline-none focus:border-accent-blue resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Javob variantlari (belgilang to'g'risini)</label>
                {newQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={opt.is_correct} onChange={() => {
                      setNewQuestion(p => ({ ...p, options: p.options.map((o, j) => ({ ...o, is_correct: j === i })) }));
                    }} className="accent-accent-blue" />
                    <input type="text" value={opt.text} onChange={e => {
                      setNewQuestion(p => ({ ...p, options: p.options.map((o, j) => j === i ? { ...o, text: e.target.value } : o) }));
                    }} placeholder={`${String.fromCharCode(65 + i)} variant`}
                      className="flex-1 px-3 py-2 rounded-xl border border-border-card bg-surface text-sm text-text-primary focus:outline-none focus:border-accent-blue" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowQuestionForm(false)} className="px-4 py-2.5 rounded-xl border border-border-card text-xs font-bold text-text-secondary hover:bg-surface-hover cursor-pointer">
                  Bekor qilish
                </button>
                <button onClick={handleAddQuestion} className="px-6 py-2.5 rounded-xl bg-accent-blue text-white text-xs font-bold shadow-md hover:bg-accent-blue/95 cursor-pointer">
                  Saqlash
                </button>
              </div>
            </div>
          )}

          <div className="bg-surface border border-border-card rounded-[24px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-card bg-primary-bg">
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">ID</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Bo'lim</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Qiyinlik</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Turi</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map(q => (
                    <tr key={q.id} className="border-b border-border-card/40 hover:bg-surface-hover">
                      <td className="py-3 px-4 font-mono text-xs text-text-secondary">{q.id.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-text-primary">{q.domain}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          q.difficulty === 'easy' ? 'bg-success-green/10 text-success-green' :
                          q.difficulty === 'hard' ? 'bg-error-red/10 text-error-red' :
                          'bg-warning-amber/10 text-warning-amber'
                        }`}>{q.difficulty}</span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{q.question_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODULES ─── */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Kurs modullari</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Axborot va raqamli savodxonlik', questions: questions.filter(q => q.domain === 'Axborot va raqamli savodxonlik').length },
              { name: 'Kompyuter savodxonligi', questions: questions.filter(q => q.domain === 'Kompyuter savodxonligi').length },
              { name: 'Mantiq va sanoq sistemalari', questions: questions.filter(q => q.domain === 'Mantiq va sanoq sistemalari').length },
              { name: 'Dasturlash asoslari', questions: questions.filter(q => q.domain === 'Dasturlash asoslari').length },
              { name: 'Grafik va multimediya', questions: questions.filter(q => q.domain === 'Grafik va multimediya').length },
              { name: 'Tarmoq va internet', questions: questions.filter(q => q.domain === 'Tarmoq va internet').length },
              { name: 'Kiberxavfsizlik', questions: questions.filter(q => q.domain === 'Kiberxavfsizlik').length },
              { name: 'Pedagogika va metodika', questions: questions.filter(q => q.domain === 'Pedagogika va metodika').length },
            ].map(mod => (
              <div key={mod.name} className="bg-surface border border-border-card rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent-blue/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-accent-blue" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{mod.name}</span>
                </div>
                <span className="text-xs font-bold text-text-secondary bg-primary-bg px-3 py-1 rounded-full">
                  {mod.questions} savol
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── USERS ─── */}
      {activeTab === 'users' && (
        <div className="bg-surface border border-border-card rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-card bg-primary-bg">
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Ism</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Obuna</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">XP</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Huquq</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border-card/40 hover:bg-surface-hover">
                    <td className="py-3 px-4">
                      <div className="font-medium text-text-primary">{u.full_name || 'Noma\'lum'}</div>
                      <div className="text-[10px] text-text-secondary font-mono">{u.id.slice(0, 12)}...</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        u.subscription_tier === 'pro' ? 'bg-purple-500/10 text-purple-500' : 'bg-primary-bg text-text-secondary'
                      }`}>{u.subscription_tier || 'free'}</span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-mono text-xs">{u.xp ?? 0}</td>
                    <td className="py-3 px-4">
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-accent-blue/10 text-accent-blue">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary-bg text-text-secondary">
                          {u.role || 'user'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ANALYTICS ─── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Recent exam attempts */}
          <div className="bg-surface border border-border-card rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">So'nggi imtihonlar</h3>
            {recentExams.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-card">
                      <th className="text-left py-2 text-[10px] font-bold text-text-secondary uppercase">Foydalanuvchi</th>
                      <th className="text-left py-2 text-[10px] font-bold text-text-secondary uppercase">Imtihon</th>
                      <th className="text-right py-2 text-[10px] font-bold text-text-secondary uppercase">Ball</th>
                      <th className="text-right py-2 text-[10px] font-bold text-text-secondary uppercase">Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExams.map(e => {
                      const pct = e.max_score && e.max_score > 0 ? Math.round((e.total_score ?? 0) / e.max_score * 100) : null;
                      return (
                        <tr key={e.id} className="border-b border-border-card/40">
                          <td className="py-2.5 text-text-primary">{(e.profiles as any)?.full_name || 'Noma\'lum'}</td>
                          <td className="py-2.5 text-text-secondary font-mono text-xs">{e.exam_id_text || '—'}</td>
                          <td className="py-2.5 text-right">
                            <span className={`font-bold text-xs ${pct != null && pct >= 60 ? 'text-success-green' : 'text-error-red'}`}>
                              {pct != null ? `${pct}%` : '—'}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-text-secondary text-xs">
                            {e.finished_at ? new Date(e.finished_at).toLocaleDateString('uz-UZ') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-text-secondary">Data yo'q</p>}
          </div>

          {/* Recent diagnostics */}
          <div className="bg-surface border border-border-card rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">So'nggi diagnostikalar</h3>
            {recentDiagnostics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-card">
                      <th className="text-left py-2 text-[10px] font-bold text-text-secondary uppercase">Foydalanuvchi</th>
                      <th className="text-right py-2 text-[10px] font-bold text-text-secondary uppercase">Ball</th>
                      <th className="text-right py-2 text-[10px] font-bold text-text-secondary uppercase">Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDiagnostics.map(d => (
                      <tr key={d.id} className="border-b border-border-card/40">
                        <td className="py-2.5 text-text-primary">{(d.profiles as any)?.full_name || 'Noma\'lum'}</td>
                        <td className="py-2.5 text-right font-bold text-xs text-accent-blue">{d.score ?? '—'}</td>
                        <td className="py-2.5 text-right text-text-secondary text-xs">
                          {d.finished_at ? new Date(d.finished_at).toLocaleDateString('uz-UZ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-text-secondary">Data yo'q</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tier breakdown */}
            <div className="bg-surface border border-border-card rounded-[24px] p-6 space-y-4">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Obuna bo'linmasi</h3>
              {tierBreakdown.map(t => (
                <div key={t.tier} className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    t.tier === 'pro' ? 'bg-purple-500/10 text-purple-500' : 'bg-primary-bg text-text-secondary'
                  }`}>{t.tier}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-primary-bg rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${t.tier === 'pro' ? 'bg-purple-500' : 'bg-accent-blue'}`}
                        style={{ width: `${Math.round(t.count / stats.totalUsers * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-text-primary w-8 text-right">{t.count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top XP users */}
            <div className="bg-surface border border-border-card rounded-[24px] p-6 space-y-3">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Top foydalanuvchilar (XP)</h3>
              {topXpUsers.map((u, i) => (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-bold text-text-secondary">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{u.full_name || 'Noma\'lum'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-warning-amber" />
                    <span className="text-sm font-bold text-text-primary">{u.xp ?? 0}</span>
                  </div>
                </div>
              ))}
              {topXpUsers.length === 0 && <p className="text-sm text-text-secondary">Data yo'q</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
