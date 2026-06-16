import React from 'react';

// Lightweight markdown renderer shared by lesson views (legacy + step-based).
// Supports headings, lists, tables, blockquotes, code blocks, bold and inline code.
export function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;
  let currentQuote: string[] = [];
  let currentCodeBlock: { lang: string; lines: string[] } | null = null;

  const flushList = (key: string | number) => {
    if (!currentList) return null;
    const ListTag = currentList.type;
    const el = (
      <ListTag key={key} className={`${currentList.type === 'ul' ? 'list-disc' : 'list-decimal'} pl-6 my-4 space-y-1.5 text-text-secondary`}>
        {currentList.items.map((item, idx) => (
          <li key={idx}>{renderInline(item)}</li>
        ))}
      </ListTag>
    );
    currentList = null;
    return el;
  };

  const flushTable = (key: string | number) => {
    if (!currentTable) return null;
    const el = (
      <div key={key} className="overflow-x-auto my-6 border border-border-card rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-border-card text-sm">
          <thead className="bg-[#eff6ff]/50 dark:bg-[#1e293b]/50">
            <tr>
              {currentTable.headers.map((h, idx) => (
                <th key={idx} className="px-4 py-3 text-left font-serif font-bold text-text-primary uppercase tracking-wider">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card bg-surface">
            {currentTable.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-primary-bg/20 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-text-secondary font-medium">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    currentTable = null;
    return el;
  };

  const flushQuote = (key: string | number) => {
    if (currentQuote.length === 0) return null;
    const el = (
      <blockquote key={key} className="border-l-4 border-[#3B7DD8] bg-primary-bg/25 pl-4 py-3 pr-3 my-4 rounded-r-xl italic text-text-secondary shadow-sm">
        {currentQuote.map((line, idx) => (
          <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{renderInline(line)}</p>
        ))}
      </blockquote>
    );
    currentQuote = [];
    return el;
  };

  const flushCodeBlock = (key: string | number) => {
    if (!currentCodeBlock) return null;
    const el = (
      <pre key={key} className="bg-[#0f172a] text-gray-200 p-4 rounded-xl my-4 overflow-x-auto font-mono text-xs sm:text-sm border border-border-card/25 shadow-inner">
        <code>{currentCodeBlock.lines.join('\n')}</code>
      </pre>
    );
    currentCodeBlock = null;
    return el;
  };

  const renderInline = (text: string): React.ReactNode => {
    const boldParts = text.split('**');
    const boldNodes = boldParts.map((part, i) => {
      const isBold = i % 2 !== 0;
      const codeParts = part.split('`');
      const codeNodes = codeParts.map((subPart, j) => {
        const isCode = j % 2 !== 0;
        if (isCode) {
          return <code key={j} className="bg-primary-bg/80 border border-border-card text-[#3B7DD8] px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm">{subPart}</code>;
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

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (line.startsWith('```')) {
      if (currentCodeBlock) {
        elements.push(flushCodeBlock(`cb_${i}`));
      } else {
        if (currentList) elements.push(flushList(`l_${i}`));
        if (currentTable) elements.push(flushTable(`t_${i}`));
        if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
        currentCodeBlock = { lang: line.substring(3).trim(), lines: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(lines[i]);
      continue;
    }

    if (line === '---' || line === '***') {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentTable) elements.push(flushTable(`t_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
      elements.push(<hr key={`hr_${i}`} className="border-t border-border-card/65 my-6" />);
      continue;
    }

    if (line.startsWith('#')) {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentTable) elements.push(flushTable(`t_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
      
      if (line.startsWith('# ')) {
        elements.push(<h1 key={`h1_${i}`} className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary mt-8 mb-4 border-b border-border-card/40 pb-2">{renderInline(line.substring(2))}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={`h2_${i}`} className="text-xl sm:text-2xl font-serif font-bold text-text-primary mt-6 mb-3">{renderInline(line.substring(3))}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={`h3_${i}`} className="text-lg sm:text-xl font-serif font-bold text-text-primary mt-5 mb-2">{renderInline(line.substring(4))}</h3>);
      } else if (line.startsWith('#### ')) {
        elements.push(<h4 key={`h4_${i}`} className="text-base sm:text-lg font-serif font-semibold text-text-primary mt-4 mb-2">{renderInline(line.substring(5))}</h4>);
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
      
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const isSeparator = cells.every(c => c.startsWith(':') || c.startsWith('-') || c.endsWith(':'));
      if (isSeparator) {
        continue;
      }
      
      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    }

    if (line === '') {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentTable) elements.push(flushTable(`t_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
      continue;
    }

    if (currentList) elements.push(flushList(`l_${i}`));
    if (currentTable) elements.push(flushTable(`t_${i}`));
    if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));

    elements.push(<p key={`p_${i}`} className="text-text-secondary leading-relaxed my-3">{renderInline(line)}</p>);
  }

  if (currentList) elements.push(flushList('l_end'));
  if (currentTable) elements.push(flushTable('t_end'));
  if (currentQuote.length > 0) elements.push(flushQuote('q_end'));
  if (currentCodeBlock) elements.push(flushCodeBlock('cb_end'));

  return elements;
}
