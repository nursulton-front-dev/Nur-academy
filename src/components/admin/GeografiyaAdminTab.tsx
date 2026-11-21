import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Layers,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Eye,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import stagingData from '../../data/geografiya/stagingCourseData.json';
import sanitizedQuestions from '../../data/geografiya/sanitizedQuestions.json';
import { GEOGRAFIYA_SECTIONS } from '../../lib/geografiyaService';

interface ContentIssue {
  issue_id: string;
  severity: 'P0' | 'P1' | 'P2';
  entity_type: string;
  entity_id: string;
  error_code: string;
  description: string;
}

const CONTENT_ISSUES: ContentIssue[] = [
  {
    issue_id: 'ISSUE-POOL-ISOLATION-01',
    severity: 'P0',
    entity_type: 'Question',
    entity_id: 'RM-A-30 / O-O3-009 / O-O4-008',
    error_code: 'CROSS_POOL_CLONE',
    description: 'Savol "1:200 000 masshtabli xaritada 4 sm masofa joyda necha km?" bir vaqtning o‘zida Real mock va Oddiy mockda takrorlangan. Pool isolation buzilgan.'
  },
  {
    issue_id: 'ISSUE-MASHQ-CANONICAL-01',
    severity: 'P0',
    entity_type: 'Mashq (330 savol)',
    entity_id: 'M-M1-D1..M-M8-D3',
    error_code: 'MASHQ_PERMUTED_PLACEHOLDER_OPTIONS',
    description: 'Barcha 330 ta Mashq savollarida faqat 1 ta yagona to‘plam javoblari o‘rni almashtirib qo‘llangan. 1 va 6-savollar takrorlangan. To‘liq yangi savollar bilan almashtirish talab etiladi.'
  },
  {
    issue_id: 'ISSUE-DISTRACTORS-01',
    severity: 'P1',
    entity_type: 'Question (560 savol)',
    entity_id: 'Bank umumiy',
    error_code: 'GENERIC_DISTRACTOR_SUFFIX',
    description: 'Barcha 560 savolda noto‘g‘ri javoblar izohi "Xato talqin: muhim sabab, mezon yoki birlik noto‘g‘ri tanlangan." shabloni bilan tugaydi. Metodik tahrir talab qilinadi.'
  },
  {
    issue_id: 'ISSUE-ASSET-L4',
    severity: 'P1',
    entity_type: 'Asset',
    entity_id: 'R-03',
    error_code: 'MALFORMED_CSV_COLUMNS',
    description: 'Rasmlar_reestri.csv faylida 4-qator qo‘shtirnoqqa olinmaganligi sababli 8 ta ustun hosil bo‘lgan. Stagingda 3 ta dars (M6-D3, M6-D4, M8-D2) to‘liq saqlandi.'
  },
  {
    issue_id: 'ISSUE-ASSET-R05-MAP',
    severity: 'P1',
    entity_type: 'Asset',
    entity_id: 'R-05 / R-06',
    error_code: 'MAP_ANTARCTICA_CUTOFF',
    description: 'Xaritalar 60° janubiy kenglikda kesilgan, Antarktida to‘liq ko‘rinmaydi. Yevropa va Osiyo alohida materik deb berilgan (darsliklarda Yevrosiyo materigi).'
  },
  {
    issue_id: 'ISSUE-CONTENT-RM-B-05',
    severity: 'P1',
    entity_type: 'Question',
    entity_id: 'RM-B-05',
    error_code: 'TOPIC_MISMATCH',
    description: 'Savol Yer harakati mavzusiga bog‘langan, biroq mazmuni yog‘in-tuproq-o‘simlik geografik jarayoniga oid.'
  },
  {
    issue_id: 'ISSUE-CONTENT-RM-C-10',
    severity: 'P1',
    entity_type: 'Question',
    entity_id: 'RM-C-10',
    error_code: 'TOPIC_MISMATCH',
    description: 'Savol relyef va geologiya mavzusiga bog‘langan, ammo mazmuni okeanografiya (qo‘ltiq, bo‘g‘iz, dengiz) ga oid.'
  },
  {
    issue_id: 'ISSUE-CONTENT-RM-B-21',
    severity: 'P1',
    entity_type: 'Question',
    entity_id: 'RM-B-21',
    error_code: 'TOPIC_MISMATCH',
    description: 'Savol aholi va migratsiya mavzusiga bog‘langan, ammo xo‘jalik sektorlariga (birlamchi, ikkilamchi, uchlamchi) oid.'
  },
  {
    issue_id: 'ISSUE-CONTENT-RM-B-35',
    severity: 'P1',
    entity_type: 'Question',
    entity_id: 'RM-B-35',
    error_code: 'ORDER_AMBIGUITY',
    description: 'Xaritada masofani hisoblashda masofani o‘lchash va masshtabni aniqlash bosqichlari tartibida noaniqlik mavjud.'
  },
  {
    issue_id: 'ISSUE-CONTENT-RM-C-05',
    severity: 'P1',
    entity_type: 'Question',
    entity_id: 'RM-C-05',
    error_code: 'ORDER_AMBIGUITY',
    description: 'Uzunlik bo‘yicha vaqt o‘zgarishi bosqichlari mantiqiy tartibida noaniqlik mavjud.'
  },
  {
    issue_id: 'ISSUE-COGNITIVE-01',
    severity: 'P1',
    entity_type: 'Question',
    entity_id: 'RM-A-04 / RM-B-04 / RM-C-10',
    error_code: 'COGNITIVE_LABEL_DISPUTE',
    description: 'Faktik eslashga oid savollar "mulohaza" deb belgilangan. Kognitiv balans qayta tekshirilishi kerak.'
  }
];

export default function GeografiyaAdminTab() {
  const [selectedPool, setSelectedPool] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'issues' | 'questions' | 'assets' | 'release'>('issues');

  const filteredQuestions = (sanitizedQuestions as any[]).filter((q) => {
    if (selectedPool !== 'all' && q.pool !== selectedPool) return false;
    if (selectedSection !== 'all' && String(q.section) !== selectedSection) return false;
    if (searchQuery) {
      const qText = `${q.source_id} ${q.stem} ${q.lesson_id}`.toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-surface border border-border-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Staging / Qoralama
            </span>
            <span className="text-xs text-text-secondary font-mono">
              SHA256: 35b646c4...313222ee
            </span>
          </div>
          <h2 className="text-xl font-serif font-extrabold text-text-primary">
            Geografiya 2026 — Kontent va Sifat Boshqaruvi
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            23 ta fayl, 8 modul, 33 dars, 560 savol. Ommaviy nashr: <strong className="text-red-500">0 ta (Bloklangan)</strong>. Barcha savollar: <strong className="text-amber-500">Tuzatish kerak (Needs correction)</strong>.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-xl bg-primary-bg border border-border-card text-center">
            <p className="text-xs uppercase font-bold text-text-secondary">P0/P1 Muammolar</p>
            <p className="text-lg font-bold text-red-500">{CONTENT_ISSUES.length} ta</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-primary-bg border border-border-card text-center">
            <p className="text-xs uppercase font-bold text-text-secondary">Sifat holati</p>
            <p className="text-lg font-bold text-amber-500">0% Ready</p>
          </div>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex border-b border-border-card gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('issues')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'issues'
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Aniqlangan muammolar ({CONTENT_ISSUES.length})
        </button>
        <button
          onClick={() => setActiveSubTab('questions')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'questions'
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileText className="w-4 h-4" />
          Savollar ko‘rigi ({sanitizedQuestions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('assets')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'assets'
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Xaritalar va rasmlar (6)
        </button>
        <button
          onClick={() => setActiveSubTab('release')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'release'
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Lock className="w-4 h-4" />
          Nashr qilish nazorati (Publish Gate)
        </button>
      </div>

      {/* 1. CONTENT ISSUES TAB */}
      {activeSubTab === 'issues' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-600 dark:text-amber-400">
            <strong>Eslatma:</strong> Quyidagi 11 ta jiddiy kamchilik to‘liq bartaraf etilmaguncha va metodist tomonidan tasdiqlanmaguncha, kursni o‘quvchilarga ommaviy nashr qilish (publish release) qat’iyan man etiladi.
          </div>

          <div className="overflow-x-auto border border-border-card rounded-2xl bg-surface">
            <table className="w-full text-xs text-left">
              <thead className="bg-primary-bg/60 border-b border-border-card text-text-secondary font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Daraja</th>
                  <th className="py-3 px-4">ID / Xatolik kodi</th>
                  <th className="py-3 px-4">Obyekt</th>
                  <th className="py-3 px-4">Tavsif va tahrir talabi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/50">
                {CONTENT_ISSUES.map((issue) => (
                  <tr key={issue.issue_id} className="hover:bg-primary-bg/30 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          issue.severity === 'P0'
                            ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-text-primary">{issue.error_code}</p>
                      <p className="text-xs text-text-secondary font-mono">{issue.issue_id}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {issue.entity_id}
                    </td>
                    <td className="py-3 px-4 text-text-primary max-w-md">
                      {issue.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. QUESTIONS REVIEW TAB */}
      {activeSubTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={selectedPool}
                onChange={(e) => setSelectedPool(e.target.value)}
                className="bg-surface border border-border-card text-text-primary text-xs rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="all">Barcha pullar (560)</option>
                <option value="Real mock">Real mock (150)</option>
                <option value="Oddiy mock">Oddiy mock (80)</option>
                <option value="Mashq">Dars mashqlari (330)</option>
              </select>

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-surface border border-border-card text-text-primary text-xs rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="all">Barcha bo‘limlar (S1–S10)</option>
                {Object.entries(GEOGRAFIYA_SECTIONS).map(([num, title]) => (
                  <option key={num} value={num}>
                    S{num}: {title}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Savol ID yoki matni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border-card rounded-xl pl-8 pr-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <p className="text-xs text-text-secondary">
            Ko‘rsatilmoqda: <strong>{filteredQuestions.length}</strong> ta savol (Barchasi qoralama maqomida, javob kalitlari yopiq omborda)
          </p>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredQuestions.slice(0, 50).map((q) => (
              <div
                key={q.id}
                className="bg-surface border border-border-card rounded-xl p-4 space-y-2 hover:border-accent-blue/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded">
                      {q.source_id}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      {q.pool} • Var: {q.variant} • Bo‘lim: S{q.section} • Dars: {q.lesson_id}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Needs correction
                  </span>
                </div>

                <p className="text-xs font-medium text-text-primary leading-relaxed">
                  {q.stem}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.code}
                      className="px-3 py-1.5 rounded-lg bg-primary-bg/70 border border-border-card/40 text-[13px] text-text-secondary flex gap-2"
                    >
                      <span className="font-bold text-text-primary">{opt.code})</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredQuestions.length > 50 && (
              <div className="text-center py-3 text-xs text-text-secondary">
                Yana {filteredQuestions.length - 50} ta savol mavjud (qidiruv orqali aniqlashtiring)...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ASSETS TAB */}
      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(stagingData.assets as any[]).map((a) => (
              <div
                key={a.asset_id}
                className="bg-surface border border-border-card rounded-2xl p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded">
                      {a.asset_id}
                    </span>
                    <h4 className="text-sm font-bold text-text-primary mt-1">{a.title}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Darslar: <span className="font-mono font-bold text-text-primary">{a.target_lessons.join(', ')}</span>
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary-bg text-text-secondary border border-border-card">
                    {a.method}
                  </span>
                </div>

                <div className="h-44 rounded-xl overflow-hidden bg-primary-bg border border-border-card/40 flex items-center justify-center relative">
                  <img
                    src={`/images/geografiya/${
                      a.asset_id === 'R-01' ? 'R-01_toshkent_klimatogramma.png' :
                      a.asset_id === 'R-02' ? 'R-02_samarqand_klimatogramma.png' :
                      a.asset_id === 'R-03' ? 'R-03_harorat_taqqoslash.png' :
                      a.asset_id === 'R-04' ? 'R-04_azimut_masshtab_sxema.png' :
                      a.asset_id === 'R-05' ? 'R-05_materiklar_jahon.png' : 'R-06_materiklar_raqamli.png'
                    }`}
                    alt={a.alt_text}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="text-[13px] space-y-1 text-text-secondary">
                  <p><strong>Alt matn:</strong> {a.alt_text}</p>
                  <p className="text-xs text-amber-500"><strong>Litsenziya:</strong> {a.license_status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RELEASE MANAGEMENT TAB */}
      {activeSubTab === 'release' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
              Relizni ommaviy nashr qilish nazorati (Publish Gate)
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              O‘quvchilar interfeysida Geografiya kursini faollashtirish uchun quyidagi barcha shartlar server darajasida tekshiriladi:
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-500">Barcha 560 savol metodik tekshiruvdan o‘tmagan</p>
                  <p className="text-text-secondary text-[13px]">Hozirgi holat: 0/560 Tekshirilgan (Ready). 560 ta savol "Needs correction" holatida.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-500">330 ta Mashq savollarida shablon javoblar mavjud</p>
                  <p className="text-text-secondary text-[13px]">Barcha dars mashqlari bitta javob kombinatsiyasidan iborat bo‘lib, sifatli o‘quv trenajyorini ta’minlamaydi.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-500">Pullararo klon (RM-A-30 / O-O3-009 / O-O4-008)</p>
                  <p className="text-text-secondary text-[13px]">Real mock va Oddiy mock bir xil savolga ega, mustaqil baholash buziladi.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-500">R-05 va R-06 xaritalari Antarktida konturiga ega emas</p>
                  <p className="text-text-secondary text-[13px]">60° janubiy kenglik chegarasi va Yevrosiyo terminologiyasini muvofiqlashtirish talab qilinadi.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-card flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-text-primary">Nashr qilish holati: BLOKLANGAN</p>
                <p className="text-xs text-text-secondary">Kurs qoralama (draft) holatida xavfsiz saqlanadi.</p>
              </div>

              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 text-xs font-bold cursor-not-allowed flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                Kursni nashr qilish (Bloklangan)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
