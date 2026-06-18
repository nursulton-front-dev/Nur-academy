import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { analyticsService } from '../lib/analyticsService';
import {
  Users, BookOpen, HelpCircle, BarChart3, AlertTriangle,
  Plus, Edit3, Trash2, Search, Filter, ChevronDown
} from 'lucide-react';

type AdminTab = 'overview' | 'questions' | 'modules' | 'users' | 'analytics';

interface QuestionRow {
  id: string;
  domain: string;
  subdomain: string | null;
  question_type: string;
  difficulty: string;
  question_text?: string;
  options?: Array<{ text: string; is_correct: boolean }>;
}

interface UserRow {
  id: string;
  full_name: string | null;
  role: string;
  created_at?: string;
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
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [hardestQuestions, setHardestQuestions] = useState<Array<{ questionId: string; domain: string; errorRate: number; attempts: number }>>([]);
  const [domainStats, setDomainStats] = useState<Array<{ domain: string; totalAttempts: number; errorRate: number }>>([]);

  // Question form
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    domain: '',
    subdomain: '',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    question_text: '',
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  });

  useEffect(() => {
    if (!user) return;
    // Check if user is admin
    supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data);
        if (data) loadAdminData();
        setLoading(false);
      });
  }, [user]);

  async function loadAdminData() {
    // Stats
    const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: qCount } = await supabase.from('question_bank').select('*', { count: 'exact', head: true });
    setTotalUsers(uCount || 0);
    setTotalQuestions(qCount || 0);

    // Hardest questions
    const hardest = await analyticsService.getHardestQuestions(10);
    setHardestQuestions(hardest);

    // Domain stats
    const domains = await analyticsService.getDomainStats();
    setDomainStats(domains);

    // Recent questions
    const { data: qData } = await supabase
      .from('question_bank')
      .select('id, domain, subdomain, question_type, difficulty')
      .order('id', { ascending: false })
      .limit(50);
    if (qData) setQuestions(qData);

    // Users
    const { data: uData } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .order('id', { ascending: false })
      .limit(50);
    if (uData) setUsers(uData);
  }

  async function handleAddQuestion() {
    if (!newQuestion.domain || !newQuestion.question_text) return;

    // Insert into question_bank
    const { data: qb, error: qbErr } = await supabase.from('question_bank').insert({
      domain: newQuestion.domain,
      subdomain: newQuestion.subdomain || null,
      question_type: newQuestion.question_type,
      difficulty: newQuestion.difficulty,
    }).select().single();

    if (qbErr || !qb) {
      console.error('Failed to insert question:', qbErr);
      return;
    }

    // Insert translation
    const { error: tErr } = await supabase.from('question_bank_translations').insert({
      question_id: qb.id,
      locale: 'uz',
      question_text: newQuestion.question_text,
      options: newQuestion.options,
    });

    if (tErr) {
      console.error('Failed to insert translation:', tErr);
      return;
    }

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
        <p className="text-text-secondary">Sizda admin huquqi yo'q. Admin paneliga kirish uchun ruxsat oling.</p>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Umumiy', icon: BarChart3 },
    { id: 'questions', label: 'Savollar', icon: HelpCircle },
    { id: 'modules', label: 'Modullar', icon: BookOpen },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'analytics', label: 'Analitika', icon: BarChart3 },
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

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Foydalanuvchilar" value={totalUsers} color="bg-accent-blue/10 text-accent-blue" />
            <StatCard icon={HelpCircle} label="Savollar" value={totalQuestions} color="bg-success-green/10 text-success-green" />
            <StatCard icon={BookOpen} label="Modullar" value={8} color="bg-purple-500/10 text-purple-500" />
            <StatCard icon={BarChart3} label="O'rtacha ball" value={`${domainStats.length > 0 ? Math.round((1 - domainStats.reduce((s, d) => s + d.errorRate, 0) / domainStats.length) * 100) : 0}%`} color="bg-warning-amber/10 text-warning-amber" />
          </div>

          {/* Domain error rates */}
          <div className="bg-surface border border-border-card rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Bo'limlar xato darajasi</h3>
            {domainStats.length > 0 ? domainStats.map(d => (
              <div key={d.domain} className="flex items-center gap-4">
                <span className="text-sm font-medium text-text-primary w-48 truncate">{d.domain}</span>
                <div className="flex-1 bg-primary-bg rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full ${d.errorRate > 0.4 ? 'bg-error-red' : d.errorRate > 0.2 ? 'bg-warning-amber' : 'bg-success-green'}`} style={{ width: `${d.errorRate * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-text-secondary w-16 text-right">{Math.round(d.errorRate * 100)}% xato</span>
              </div>
            )) : <p className="text-sm text-text-secondary">Data yo'q</p>}
          </div>

          {/* Hardest questions */}
          <div className="bg-surface border border-border-card rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Eng qiyin savollar</h3>
            {hardestQuestions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-card">
                      <th className="text-left py-2 text-[10px] font-bold text-text-secondary uppercase">Savol ID</th>
                      <th className="text-left py-2 text-[10px] font-bold text-text-secondary uppercase">Bo'lim</th>
                      <th className="text-right py-2 text-[10px] font-bold text-text-secondary uppercase">Xato %</th>
                      <th className="text-right py-2 text-[10px] font-bold text-text-secondary uppercase">Urinishlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hardestQuestions.map(h => (
                      <tr key={h.questionId} className="border-b border-border-card/40">
                        <td className="py-3 text-text-primary font-mono text-xs">{h.questionId.slice(0, 8)}...</td>
                        <td className="py-3 text-text-secondary">{h.domain}</td>
                        <td className="py-3 text-right font-bold text-error-red">{Math.round(h.errorRate * 100)}%</td>
                        <td className="py-3 text-right text-text-secondary">{h.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-text-secondary">Data yo'q</p>}
          </div>
        </div>
      )}

      {/* Questions */}
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

          {/* Add question form */}
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
                      setNewQuestion(p => ({
                        ...p,
                        options: p.options.map((o, j) => ({ ...o, is_correct: j === i }))
                      }));
                    }} className="accent-accent-blue" />
                    <input type="text" value={opt.text} onChange={e => {
                      setNewQuestion(p => ({
                        ...p,
                        options: p.options.map((o, j) => j === i ? { ...o, text: e.target.value } : o)
                      }));
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

          {/* Questions list */}
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

      {/* Users */}
      {activeTab === 'users' && (
        <div className="bg-surface border border-border-card rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-card bg-primary-bg">
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">ID</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Ism</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-text-secondary uppercase">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border-card/40 hover:bg-surface-hover">
                    <td className="py-3 px-4 font-mono text-xs text-text-secondary">{u.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4 text-text-primary font-medium">{u.full_name || 'Noma\'lum'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-accent-blue/10 text-accent-blue' :
                        u.role === 'teacher' ? 'bg-success-green/10 text-success-green' :
                        'bg-primary-bg text-text-secondary'
                      }`}>{u.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics tab redirects to full analytics */}
      {activeTab === 'analytics' && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">To'liq analitika uchun asosiy sahifaga o'ting.</p>
          <a href="/attestatsiya/natija" className="inline-block mt-4 text-accent-blue font-bold text-sm hover:underline">Natija va tahlilga o'tish →</a>
        </div>
      )}
    </div>
  );
}
