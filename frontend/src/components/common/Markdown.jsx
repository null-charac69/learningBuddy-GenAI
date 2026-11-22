import React from 'react';

/**
 * Minimal, safe Markdown renderer for LLM output (no HTML injection: everything
 * becomes React elements). Supports headings, paragraphs, bullet/numbered lists,
 * fenced code, inline code, bold, italic and [n] citation markers.
 */
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[\d+\])/g;

export const renderInline = (text, keyPrefix = 'i') =>
  text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!part) return null;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1)
      return <code key={key} className="bg-primary/70 px-1.5 py-0.5 rounded text-[0.9em]">{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (/^\[\d+\]$/.test(part))
      return <sup key={key} className="text-highlight font-semibold mx-0.5">{part}</sup>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
      return <em key={key}>{part.slice(1, -1)}</em>;
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });

export const parseBlocks = (src) => {
  const lines = (src || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      i++;
      blocks.push({ type: 'code', text: code.join('\n') });
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }
    const listRe = /^\s*([-*•]|\d+[.)])\s+(.*)$/;
    if (listRe.test(line)) {
      const ordered = /^\s*\d/.test(line);
      const items = [];
      while (i < lines.length && listRe.test(lines[i])) items.push(lines[i++].match(listRe)[2]);
      blocks.push({ type: ordered ? 'ol' : 'ul', items });
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !listRe.test(lines[i]) && !/^#{1,4}\s/.test(lines[i]) && !lines[i].trim().startsWith('```'))
      para.push(lines[i++]);
    blocks.push({ type: 'p', text: para.join(' ') });
  }
  return blocks;
};

const Markdown = ({ children }) => (
  <div className="space-y-2 leading-relaxed">
    {parseBlocks(children).map((b, i) => {
      switch (b.type) {
        case 'code':
          return <pre key={i} className="bg-primary/70 p-3 rounded-md overflow-x-auto text-sm"><code>{b.text}</code></pre>;
        case 'heading':
          return <p key={i} className={`font-semibold ${b.level <= 2 ? 'text-lg' : ''}`}>{renderInline(b.text, i)}</p>;
        case 'ul':
          return <ul key={i} className="list-disc pl-5 space-y-1">{b.items.map((it, j) => <li key={j}>{renderInline(it, `${i}-${j}`)}</li>)}</ul>;
        case 'ol':
          return <ol key={i} className="list-decimal pl-5 space-y-1">{b.items.map((it, j) => <li key={j}>{renderInline(it, `${i}-${j}`)}</li>)}</ol>;
        default:
          return <p key={i}>{renderInline(b.text, i)}</p>;
      }
    })}
  </div>
);

export default Markdown;
