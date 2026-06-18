import React from 'react';
import { Lightbulb, CheckCircle2, AlertTriangle, XCircle, Quote, type LucideIcon } from 'lucide-react';

// Lightweight markdown renderer shared by lesson views (legacy + step-based).
// Premium EdTech styling is derived ENTIRELY from the markdown — no per-lesson
// hardcoding. Supports headings, lists (custom markers), tables (zebra),
// blockquotes-as-callouts (colored by emoji/marker), code, bold, inline code.

type CalloutVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const CALLOUTS: Record<CalloutVariant, { wrap: string; icon: string; Icon: LucideIcon }> = {
  // Misol / 💡 → blue · ✅ → green · Eslatma / ⚠️ → amber · ❌ → red · else gray
  info: {
    wrap: 'bg-blue-50/70 dark:bg-[#3B7DD8]/10 border-[#3B7DD8]',
    icon: 'text-[#3B7DD8]',
    Icon: Lightbulb,
  },
  success: {
    wrap: 'bg-emerald-50/70 dark:bg-[#4CAF82]/10 border-[#4CAF82]',
    icon: 'text-[#4CAF82]',
    Icon: CheckCircle2,
  },
  warning: {
    wrap: 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-400',
    icon: 'text-amber-500',
    Icon: AlertTriangle,
  },
  danger: {
    wrap: 'bg-rose-50/70 dark:bg-[#E0735C]/10 border-[#E0735C]',
    icon: 'text-[#E0735C]',
    Icon: XCircle,
  },
  neutral: {
    wrap: 'bg-surface-muted/40 dark:bg-white/5 border-border-card',
    icon: 'text-text-secondary',
    Icon: Quote,
  },
};

const EMOJI_PREFIX = /^(\u{1F4A1}|✅|⚠️?|❌)\s*/u;

function stripEmoji(text: string): string {
  return text.replace(EMOJI_PREFIX, '');
}

// The callout color is decided by the first line's leading emoji or word marker.
function classifyQuote(firstLine: string): { variant: CalloutVariant; firstCleaned: string } {
  const t = firstLine.trim();
  if (/^\u{1F4A1}/u.test(t) || /^misol[:\s]/i.test(t)) return { variant: 'info', firstCleaned: stripEmoji(t) };
  if (/^✅/u.test(t)) return { variant: 'success', firstCleaned: stripEmoji(t) };
  if (/^⚠/u.test(t) || /^eslatma[:\s]/i.test(t)) return { variant: 'warning', firstCleaned: stripEmoji(t) };
  if (/^❌/u.test(t)) return { variant: 'danger', firstCleaned: stripEmoji(t) };
  return { variant: 'neutral', firstCleaned: t };
}

export function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;
  let currentQuote: string[] = [];
  let currentCodeBlock: { lang: string; lines: string[] } | null = null;

  const renderInline = (text: string): React.ReactNode => {
    const boldParts = text.split('**');
    const boldNodes = boldParts.map((part, i) => {
      const isBold = i % 2 !== 0;
      const codeParts = part.split('`');
      const codeNodes = codeParts.map((subPart, j) => {
        const isCode = j % 2 !== 0;
        if (isCode) {
          return (
            <code
              key={j}
              className="bg-primary-bg/80 border border-border-card text-[#3B7DD8] px-1.5 py-0.5 rounded font-mono text-[0.85em]"
            >
              {subPart}
            </code>
          );
        }
        return subPart;
      });
      if (isBold) {
        return <strong key={i} className="font-bold text-text-primary">{codeNodes}</strong>;
      }
      return <span key={i}>{codeNodes}</span>;
    });
    return <>{boldNodes}</>;
  };

  const flushList = (key: string | number) => {
    if (!currentList) return null;
    const { type, items } = currentList;
    currentList = null;
    if (type === 'ul') {
      return (
        <ul key={key} className="my-4 space-y-2.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-3 text-text-secondary leading-relaxed">
              <span className="mt-[0.55em] w-1.5 h-1.5 rounded-full bg-[#3B7DD8] shrink-0" />
              <span className="min-w-0">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <ol key={key} className="my-4 space-y-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3 text-text-secondary leading-relaxed">
            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#3B7DD8]/10 text-[#3B7DD8] text-[11px] font-bold flex items-center justify-center">
              {idx + 1}
            </span>
            <span className="min-w-0">{renderInline(item)}</span>
          </li>
        ))}
      </ol>
    );
  };

  const flushTable = (key: string | number) => {
    if (!currentTable) return null;
    const { headers, rows } = currentTable;
    currentTable = null;
    return (
      <div key={key} className="overflow-x-auto my-6 border border-border-card rounded-2xl shadow-sm">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#3B7DD8]/[0.07] dark:bg-[#3B7DD8]/10">
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left font-serif font-bold text-text-primary text-[13px] uppercase tracking-wide border-b border-border-card"
                >
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={`${rIdx % 2 === 1 ? 'bg-surface-muted/30 dark:bg-white/[0.02]' : 'bg-surface'} hover:bg-[#3B7DD8]/[0.04] transition-colors`}
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-text-secondary align-top border-b border-border-card/60">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const flushQuote = (key: string | number) => {
    if (currentQuote.length === 0) return null;
    const { variant, firstCleaned } = classifyQuote(currentQuote[0]);
    const cfg = CALLOUTS[variant];
    const Icon = cfg.Icon;
    const bodyLines = [firstCleaned, ...currentQuote.slice(1)];
    currentQuote = [];
    return (
      <div key={key} className={`my-5 flex gap-3 rounded-2xl border-l-4 p-4 sm:p-5 shadow-sm ${cfg.wrap}`}>
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.icon}`} />
        <div className="min-w-0 space-y-1.5 text-sm sm:text-[15px] leading-relaxed text-text-primary">
          {bodyLines.map((line, idx) => (
            <p key={idx}>{renderInline(line)}</p>
          ))}
        </div>
      </div>
    );
  };

  const flushCodeBlock = (key: string | number) => {
    if (!currentCodeBlock) return null;
    const code = currentCodeBlock.lines.join('\n');
    currentCodeBlock = null;
    return (
      <pre
        key={key}
        className="bg-[#0f172a] text-slate-100 p-4 rounded-2xl my-5 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed border border-border-card/30 shadow-inner"
      >
        <code>{code}</code>
      </pre>
    );
  };

  const flushBlocks = (i: number) => {
    if (currentList) elements.push(flushList(`l_${i}`));
    if (currentTable) elements.push(flushTable(`t_${i}`));
    if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('```')) {
      if (currentCodeBlock) {
        elements.push(flushCodeBlock(`cb_${i}`));
      } else {
        flushBlocks(i);
        currentCodeBlock = { lang: line.substring(3).trim(), lines: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(lines[i]);
      continue;
    }

    if (line === '---' || line === '***') {
      flushBlocks(i);
      elements.push(<hr key={`hr_${i}`} className="border-t border-border-card/60 my-7" />);
      continue;
    }

    if (line.startsWith('#')) {
      flushBlocks(i);
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1_${i}`} className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary mt-8 mb-4 pb-2 border-b border-border-card/50 first:mt-0">
            {renderInline(line.substring(2))}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2_${i}`} className="flex items-center gap-2.5 text-xl sm:text-2xl font-serif font-bold text-text-primary mt-8 mb-3 first:mt-0">
            <span className="w-1 h-6 rounded-full bg-[#3B7DD8] shrink-0" />
            {renderInline(line.substring(3))}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3_${i}`} className="text-lg sm:text-xl font-serif font-bold text-text-primary mt-6 mb-2 first:mt-0">
            {renderInline(line.substring(4))}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4_${i}`} className="text-base sm:text-lg font-serif font-semibold text-text-primary mt-4 mb-2 first:mt-0">
            {renderInline(line.substring(5))}
          </h4>
        );
      }
      continue;
    }

    if (line.startsWith('>')) {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentTable) elements.push(flushTable(`t_${i}`));
      currentQuote.push(line.substring(1).trim());
      continue;
    }

    const isUl = line.startsWith('* ') || line.startsWith('- ');
    const isOl = /^\d+\.\s/.test(line);

    if (isUl || isOl) {
      if (currentTable) elements.push(flushTable(`t_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));

      const type = isUl ? 'ul' : 'ol';
      const itemText = isUl ? line.substring(2).trim() : line.replace(/^\d+\.\s/, '').trim();

      if (currentList && currentList.type === type) {
        currentList.items.push(itemText);
      } else {
        if (currentList) elements.push(flushList(`l_${i}`));
        currentList = { type, items: [itemText] };
      }
      continue;
    }

    if (line.startsWith('|')) {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));

      const cells = line.split('|').map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const isSeparator = cells.every((c) => c.startsWith(':') || c.startsWith('-') || c.endsWith(':'));
      if (isSeparator) continue;

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    }

    if (line === '') {
      flushBlocks(i);
      continue;
    }

    flushBlocks(i);
    elements.push(
      <p key={`p_${i}`} className="text-text-secondary leading-[1.75] text-sm sm:text-[15px] my-3.5">
        {renderInline(line)}
      </p>
    );
  }

  if (currentList) elements.push(flushList('l_end'));
  if (currentTable) elements.push(flushTable('t_end'));
  if (currentQuote.length > 0) elements.push(flushQuote('q_end'));
  if (currentCodeBlock) elements.push(flushCodeBlock('cb_end'));

  return elements;
}
