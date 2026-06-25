import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { supabase } from '../lib/supabase';
import {
  Users, BookOpen, HelpCircle, BarChart3, AlertTriangle,
  Plus, TrendingUp, Award, ClipboardList, CheckSquare, Star,
  ShieldCheck, Crown, Trash2, Loader2, X, Search,
  Zap, MessageSquare, Clock, StopCircle, ImagePlus
} from 'lucide-react';
import { uploadQuestionImage, deleteQuestionImage } from '../lib/questionImageService';

type AdminTab = 'overview' | 'questions' | 'modules' | 'users' | 'analytics' | 'campaigns' | 'feedback';

interface Campaign {
  id: string;
  title: string;
  message: string;
  started_at: string;
  ends_at: string;
  is_active: boolean;
  course_id: string | null;
  created_at: string;
}

interface FeedbackRow {
  id: string;
  user_id: string;
  course_id: string | null;
  type: string;
  message: string;
  rating: number | null;
  status: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
  courses?: { title: string | null } | null;
}

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

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignForm, setCampaignForm] = useState({ title: '', message: '', course_id: '' });
  const [campaignSaving, setCampaignSaving] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [stoppingId, setStoppingId] = useState<string | null>(null);

  // Feedback state
  const [feedbackRows, setFeedbackRows] = useState<FeedbackRow[]>([]);
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [markingId, setMarkingId] = useState<string | null>(null);

  // Question form
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    domain: '', subdomain: '', question_type: 'multiple_choice', difficulty: 'medium',
    question_text: '', image_url: '' as string,
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  });
  // Question-image upload state (admin-only; bucket RLS also enforces it)
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // User-management action state
  const [actionUserId, setActionUserId] = useState<string | null>(null); // row with an in-flight tier change
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null); // user pending delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // User search / filter (client-side on loaded list)
  const [userSearch, setUserSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro'>('all');

  useEffect(() => {
    if (!loading && isAdmin) loadAdminData();
  }, [isAdmin, loading]);

  // Give / remove Pro. Updates the authoritative profiles.subscription_tier
  // (the gate the whole app reads) AND keeps enrollments.tier in sync so the
  // MyLearning per-course badge matches. DB RLS also enforces admin-only.
  async function handleSetTier(target: UserRow, tier: 'free' | 'pro') {
    if (target.id === user?.id) return; // never touch own account here
    setActionUserId(target.id);
    setActionError(null);

    const { error: pErr } = await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', target.id);

    if (pErr) {
      setActionError(`Pro o'zgartirishda xato: ${pErr.message}`);
      setActionUserId(null);
      return;
    }

    // Sync every enrollment the user has (badge consistency). Non-fatal.
    await supabase.from('enrollments').update({ tier }).eq('user_id', target.id);

    setUsers(prev => prev.map(u => u.id === target.id ? { ...u, subscription_tier: tier } : u));
    setActionUserId(null);
  }

  // Delete a participant: remove all their data, then their profile.
  // Order respects FKs (children first). The auth.users record itself needs
  // the service role and is removed via the Supabase Dashboard.
  async function handleDeleteUser(target: UserRow) {
    if (target.id === user?.id) return; // self-protection
    setDeleting(true);
    setActionError(null);

    const childTables = ['lesson_notes', 'progress', 'diagnostic_attempts', 'exam_attempts', 'xp_events', 'enrollments'];
    for (const t of childTables) {
      const { error } = await supabase.from(t).delete().eq('user_id', target.id);
      if (error) {
        setActionError(`${t} tozalashda xato: ${error.message}`);
        setDeleting(false);
        return;
      }
    }

    const { error: pErr } = await supabase.from('profiles').delete().eq('id', target.id);
    if (pErr) {
      setActionError(`Profilni o'chirishda xato: ${pErr.message}`);
      setDeleting(false);
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== target.id));
    setDeleting(false);
    setDeleteTarget(null);
    loadAdminData();
  }

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
    if (examRows) setRecentExams(examRows as unknown as ExamAttemptRow[]);

    if (recentDiagData) setRecentDiagnostics(recentDiagData as unknown as DiagnosticRow[]);

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

    // Campaigns (all, admin sees history too)
    const { data: campData } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (campData) setCampaigns(campData as Campaign[]);

    // Feedback
    const { data: fbData } = await supabase
      .from('feedback')
      .select('id, user_id, course_id, type, message, rating, status, created_at, profiles(full_name), courses(title)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (fbData) setFeedbackRows(fbData as unknown as FeedbackRow[]);
  }

  async function handleLaunchCampaign() {
    if (!campaignForm.title.trim() || !campaignForm.message.trim()) return;
    setCampaignSaving(true);
    setCampaignError(null);
    const ends_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from('campaigns').insert({
      title: campaignForm.title.trim(),
      message: campaignForm.message.trim(),
      ends_at,
      is_active: true,
      course_id: campaignForm.course_id || null,
    });
    if (error) {
      setCampaignError(error.message);
    } else {
      setCampaignForm({ title: '', message: '', course_id: '' });
      loadAdminData();
    }
    setCampaignSaving(false);
  }

  async function handleStopCampaign(id: string) {
    setStoppingId(id);
    await supabase.from('campaigns').update({ is_active: false }).eq('id', id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, is_active: false } : c));
    setStoppingId(null);
  }

  async function handleMarkReviewed(id: string) {
    setMarkingId(id);
    await supabase.from('feedback').update({ status: 'reviewed' }).eq('id', id);
    setFeedbackRows(prev => prev.map(f => f.id === id ? { ...f, status: 'reviewed' } : f));
    setMarkingId(null);
  }

  // Upload a question illustration to Storage and keep its public URL in the form.
  async function handleQuestionImage(file: File | undefined) {
    if (!file) return;
    setImageError(null);
    setImageUploading(true);
    try {
      // Replace any previously uploaded image (best-effort cleanup).
      if (newQuestion.image_url) await deleteQuestionImage(newQuestion.image_url);
      const { url } = await uploadQuestionImage(file);
      setNewQuestion(p => ({ ...p, image_url: url }));
    } catch (e: any) {
      setImageError(e?.message ?? 'Rasm yuklashda xato');
    } finally {
      setImageUploading(false);
    }
  }

  async function handleRemoveQuestionImage() {
    if (newQuestion.image_url) await deleteQuestionImage(newQuestion.image_url);
    setNewQuestion(p => ({ ...p, image_url: '' }));
    setImageError(null);
  }

  async function handleAddQuestion() {
    if (!newQuestion.domain || !newQuestion.question_text) return;

    const { data: qb, error: qbErr } = await supabase.from('question_bank').insert({
      domain: newQuestion.domain,
      subdomain: newQuestion.subdomain || null,
      question_type: newQuestion.question_type,
      difficulty: newQuestion.difficulty,
      image_url: newQuestion.image_url || null,
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
    setImageError(null);
    setNewQuestion({
      domain: '', subdomain: '', question_type: 'multiple_choice', difficulty: 'medium',
      question_text: '', image_url: '',
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
    { id: 'campaigns', label: 'Aksiyalar', icon: Zap },
    { id: 'feedback', label: 'Fikrlar', icon: MessageSquare },
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

              {/* Optional illustration (schema, diagram, code, table) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Rasm (ixtiyoriy) — sxema, diagramma, kod, jadval</label>
                {newQuestion.image_url ? (
                  <div className="flex items-start gap-3">
                    <img src={newQuestion.image_url} alt="Savol rasmi" className="max-h-40 w-auto max-w-full rounded-xl border border-border-card" />
                    <button type="button" onClick={handleRemoveQuestionImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-error-red hover:bg-error-red/10 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> O'chirish
                    </button>
                  </div>
                ) : (
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border-card text-xs font-bold text-text-secondary hover:bg-surface-hover cursor-pointer w-fit">
                    {imageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    {imageUploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}
                    <input type="file" accept="image/*" className="hidden" disabled={imageUploading}
                      onChange={e => { handleQuestionImage(e.target.files?.[0]); e.target.value = ''; }} />
                  </label>
                )}
                <p className="text-[10px] text-text-secondary">PNG, JPG, WEBP, GIF, SVG · maks. 2 MB</p>
                {imageError && <p className="text-[11px] text-error-red font-medium">{imageError}</p>}
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
      {activeTab === 'users' && (() => {
        const q = userSearch.trim().toLowerCase();
        const filteredUsers = users.filter(u => {
          const matchName = !q || (u.full_name ?? '').toLowerCase().includes(q);
          const matchTier = tierFilter === 'all' || (u.subscription_tier ?? 'free') === tierFilter;
          return matchName && matchTier;
        });
        return (
        <div className="space-y-4">
          {actionError && (
            <div className="flex items-start gap-2 bg-error-red/10 border border-error-red/30 text-error-red rounded-xl px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              <input
                type="text"
                placeholder="Ism bo'yicha qidirish..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value as 'all' | 'free' | 'pro')}
              className="px-3 py-2.5 bg-surface border border-border-card rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors cursor-pointer"
            >
              <option value="all">Barcha obunalar</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <p className="text-[11px] text-text-secondary">{filteredUsers.length} / {users.length} foydalanuvchi</p>

          <div className="bg-surface border border-border-card rounded-[24px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-card bg-primary-bg">
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Ism</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Obuna</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">XP</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Huquq</th>
                    <th className="text-right py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const isSelf = u.id === user?.id;
                    const isPro = u.subscription_tier === 'pro';
                    const busy = actionUserId === u.id;
                    return (
                      <tr key={u.id} className="border-b border-border-card/40 hover:bg-surface-hover">
                        <td className="py-3 px-4">
                          <div className="font-medium text-text-primary">{u.full_name || 'Noma\'lum'}</div>
                          <div className="text-[10px] text-text-secondary font-mono">{u.id.slice(0, 12)}...</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            isPro ? 'bg-purple-500/10 text-purple-500' : 'bg-primary-bg text-text-secondary'
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
                        <td className="py-3 px-4">
                          {isSelf ? (
                            <span className="block text-right text-[10px] text-text-secondary italic">Siz</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSetTier(u, isPro ? 'free' : 'pro')}
                                disabled={busy}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isPro
                                    ? 'border border-border-card text-text-secondary hover:bg-surface-hover'
                                    : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
                                }`}
                              >
                                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                                {isPro ? 'Pro olib tashlash' : 'Pro berish'}
                              </button>
                              <button
                                onClick={() => { setActionError(null); setDeleteTarget(u); }}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-error-red hover:bg-error-red/10 transition-all cursor-pointer disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> O'chirish
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface border border-border-card rounded-[24px] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error-red/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error-red" />
                </div>
                <h3 className="text-lg font-serif font-extrabold text-text-primary">Aniqmisiz?</h3>
              </div>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="text-text-secondary hover:text-text-primary cursor-pointer disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-text-secondary">
              <span className="font-bold text-text-primary">{deleteTarget.full_name || 'Bu foydalanuvchi'}</span> va uning barcha
              ma'lumotlari (progress, konspektlar, diagnostika, imtihonlar, XP, ro'yxatlar) butunlay o'chiriladi.
              Bu amalni qaytarib bo'lmaydi.
            </p>
            <p className="text-[11px] text-text-secondary bg-primary-bg rounded-lg px-3 py-2">
              Eslatma: foydalanuvchining login (auth) akkaunti Supabase Dashboard orqali alohida o'chiriladi.
            </p>
            {actionError && (
              <div className="flex items-start gap-2 bg-error-red/10 border border-error-red/30 text-error-red rounded-xl px-3 py-2 text-xs">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-border-card text-xs font-bold text-text-secondary hover:bg-surface-hover cursor-pointer disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDeleteUser(deleteTarget)}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-error-red text-white text-xs font-bold shadow-md hover:bg-error-red/90 cursor-pointer disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                O'chirish
              </button>
            </div>
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

      {/* ─── CAMPAIGNS ─── */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Active campaign status */}
          {(() => {
            const active = campaigns.find(c => c.is_active && new Date(c.ends_at) > new Date());
            return active ? (
              <div className="bg-accent-blue/8 border border-accent-blue/30 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Faol
                    </span>
                    <span className="text-sm font-bold text-text-primary truncate">{active.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock className="w-3.5 h-3.5" />
                    Tugaydi: {new Date(active.ends_at).toLocaleString('uz-UZ')}
                  </div>
                </div>
                <button
                  onClick={() => handleStopCampaign(active.id)}
                  disabled={stoppingId === active.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-error-red/50 text-error-red text-xs font-bold hover:bg-error-red/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {stoppingId === active.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <StopCircle className="w-3.5 h-3.5" />}
                  To'xtatish
                </button>
              </div>
            ) : (
              <div className="bg-surface border border-border-card rounded-[24px] p-5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-text-secondary" />
                <p className="text-sm text-text-secondary">Hozirda faol aksiya yo'q.</p>
              </div>
            );
          })()}

          {/* Launch form */}
          <div className="bg-surface border border-border-card rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Yangi aksiya boshlash</h3>
            {campaignError && (
              <p className="text-xs text-error-red">{campaignError}</p>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Sarlavha</label>
                <input
                  type="text"
                  placeholder="masalan: 24 soatlik maxsus taklif"
                  value={campaignForm.title}
                  onChange={e => setCampaignForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-primary-bg border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Xabar (banner matni)</label>
                <textarea
                  rows={3}
                  placeholder="Foydalanuvchiga ko'rsatiladigan matn..."
                  value={campaignForm.message}
                  onChange={e => setCampaignForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-primary-bg border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-blue transition-colors resize-none"
                />
              </div>
            </div>
            <button
              onClick={handleLaunchCampaign}
              disabled={campaignSaving || !campaignForm.title.trim() || !campaignForm.message.trim()}
              className="inline-flex items-center gap-2 bg-accent-blue text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-blue/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {campaignSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Aksiyani boshlash (24 soat)
            </button>
          </div>

          {/* Campaign history */}
          {campaigns.length > 0 && (
            <div className="bg-surface border border-border-card rounded-[24px] overflow-hidden">
              <div className="px-6 py-4 border-b border-border-card">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Tarix</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-card bg-primary-bg">
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Sarlavha</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Tugadi</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => {
                      const isRunning = c.is_active && new Date(c.ends_at) > new Date();
                      const expired = new Date(c.ends_at) <= new Date();
                      return (
                        <tr key={c.id} className="border-b border-border-card/40">
                          <td className="py-3 px-4">
                            <p className="font-medium text-text-primary">{c.title}</p>
                            <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">{c.message}</p>
                          </td>
                          <td className="py-3 px-4 text-xs text-text-secondary">
                            {new Date(c.ends_at).toLocaleString('uz-UZ')}
                          </td>
                          <td className="py-3 px-4">
                            {isRunning ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Faol
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-primary-bg text-text-secondary text-[10px] font-bold uppercase">
                                {expired ? 'Tugagan' : 'To\'xtatilgan'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── FEEDBACK ─── */}
      {activeTab === 'feedback' && (() => {
        const filtered = feedbackRows.filter(f => {
          const matchType = feedbackTypeFilter === 'all' || f.type === feedbackTypeFilter;
          const matchStatus = feedbackStatusFilter === 'all' || f.status === feedbackStatusFilter;
          return matchType && matchStatus;
        });
        return (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={feedbackTypeFilter}
                onChange={e => setFeedbackTypeFilter(e.target.value)}
                className="px-3 py-2 bg-surface border border-border-card rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-blue cursor-pointer"
              >
                <option value="all">Barcha turlar</option>
                <option value="review">Umumiy fikr</option>
                <option value="bug">Xato / muammo</option>
                <option value="idea">Taklif / g'oya</option>
              </select>
              <select
                value={feedbackStatusFilter}
                onChange={e => setFeedbackStatusFilter(e.target.value)}
                className="px-3 py-2 bg-surface border border-border-card rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-blue cursor-pointer"
              >
                <option value="all">Barcha statuslar</option>
                <option value="new">Yangi</option>
                <option value="reviewed">Ko'rilgan</option>
              </select>
              <span className="self-center text-xs text-text-secondary">{filtered.length} ta</span>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-surface border border-border-card rounded-[24px] p-8 text-center">
                <p className="text-sm text-text-secondary">Fikrlar yo'q</p>
              </div>
            ) : (
              <div className="bg-surface border border-border-card rounded-[24px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-card bg-primary-bg">
                        <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Foydalanuvchi</th>
                        <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Tur</th>
                        <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Xabar</th>
                        <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Reyting</th>
                        <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Sana</th>
                        <th className="text-right py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(f => (
                        <tr key={f.id} className="border-b border-border-card/40 hover:bg-surface-hover">
                          <td className="py-3 px-4">
                            <p className="font-medium text-text-primary text-xs">{(f.profiles as any)?.full_name || 'Noma\'lum'}</p>
                            <p className="text-[10px] text-text-secondary font-mono">{f.user_id.slice(0, 10)}…</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              f.type === 'review' ? 'bg-accent-blue/10 text-accent-blue' :
                              f.type === 'bug' ? 'bg-error-red/10 text-error-red' :
                              'bg-purple-500/10 text-purple-500'
                            }`}>{f.type}</span>
                          </td>
                          <td className="py-3 px-4 max-w-[240px]">
                            <p className="text-xs text-text-primary line-clamp-2">{f.message}</p>
                            {(f.courses as any)?.title && (
                              <p className="text-[10px] text-text-secondary mt-0.5">{(f.courses as any).title}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {f.rating ? (
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < f.rating! ? 'text-amber-400 fill-amber-400' : 'text-border-card'}`} />
                                ))}
                              </div>
                            ) : <span className="text-xs text-text-secondary">—</span>}
                          </td>
                          <td className="py-3 px-4 text-xs text-text-secondary whitespace-nowrap">
                            {new Date(f.created_at).toLocaleDateString('uz-UZ')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {f.status === 'reviewed' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/10 text-green-500">
                                <CheckSquare className="w-3 h-3" />Ko'rilgan
                              </span>
                            ) : (
                              <button
                                onClick={() => handleMarkReviewed(f.id)}
                                disabled={markingId === f.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border border-border-card text-text-secondary hover:bg-surface-hover cursor-pointer disabled:opacity-50"
                              >
                                {markingId === f.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckSquare className="w-3 h-3" />}
                                Ko'rildi
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
