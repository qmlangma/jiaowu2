import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import prdContent from "../../../docs/refund-discount-requirements.md?raw";

type PrdPageProps = {
  onBack: () => void;
};

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^\)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-[#182230]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-[#eef2f7] px-1.5 py-0.5 font-mono text-[0.9em] text-[#b54708]">{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (link) {
      return <a key={index} href={link[2]} className="text-[#165dff] underline" target="_blank" rel="noreferrer">{link[1]}</a>;
    }
    return <span key={index}>{part}</span>;
  });
}

function splitTableRow(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) code.push(lines[index++]);
      index += 1;
      blocks.push(<pre key={blocks.length} className="my-4 overflow-x-auto rounded-xl bg-[#182230] p-4 font-mono text-[13px] leading-6 text-[#e6edf7]"><code>{code.join("\n")}</code></pre>);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const styles = ["", "mt-10 mb-4 text-2xl sm:text-3xl", "mt-8 mb-3 text-xl sm:text-2xl", "mt-6 mb-2 text-lg", "mt-5 mb-2 text-base", "mt-4 mb-1 text-base", "mt-4 mb-1 text-base"];
      const Heading = (`h${level}`) as keyof JSX.IntrinsicElements;
      blocks.push(<Heading key={blocks.length} className={`${styles[level]} font-black tracking-[-0.02em] text-[#172b4d]`}>{renderInline(heading[2])}</Heading>);
      index += 1;
      continue;
    }

    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
      blocks.push(<hr key={blocks.length} className="my-7 border-[#e7ecf3]" />);
      index += 1;
      continue;
    }

    if (line.trim().startsWith("|") && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
      const headers = splitTableRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) rows.push(splitTableRow(lines[index++]));
      blocks.push(<div key={blocks.length} className="my-5 overflow-x-auto rounded-xl border border-[#dfe6f0]"><table className="w-full min-w-[680px] border-collapse text-left text-sm"><thead className="bg-[#f4f7fb] text-[#475467]"><tr>{headers.map((cell, cellIndex) => <th key={cellIndex} className="border-b border-[#dfe6f0] px-4 py-3 font-bold">{renderInline(cell)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="odd:bg-white even:bg-[#fbfcfe]">{headers.map((_, cellIndex) => <td key={cellIndex} className="border-b border-[#edf1f6] px-4 py-3 align-top text-[#475467]">{renderInline(row[cellIndex] ?? "")}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    const list = line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
    if (list) {
      const ordered = /^\d+\./.test(list[1]);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-*]|\d+\.)\s+(.+)$/);
        if (!item || (/^\d+\./.test(item[1])) !== ordered) break;
        items.push(item[2]); index += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={blocks.length} className={`${ordered ? "list-decimal" : "list-disc"} my-3 space-y-1 pl-6 text-[#475467]`}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</List>);
      continue;
    }

    if (line.trim().startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) quote.push(lines[index++].trim().replace(/^>\s?/, ""));
      blocks.push(<blockquote key={blocks.length} className="my-4 border-l-4 border-[#8eb2ff] bg-[#f5f8ff] px-4 py-3 text-[#526581]">{quote.map((item, itemIndex) => <p key={itemIndex}>{renderInline(item)}</p>)}</blockquote>);
      continue;
    }

    const paragraph: string[] = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^#{1,6}\s|^\s*[-*]\s+|^\s*\d+\.\s+|^\s*\||^```|^\s*>/.test(lines[index])) paragraph.push(lines[index++].trim());
    blocks.push(<p key={blocks.length} className="my-3 leading-7 text-[#475467]">{renderInline(paragraph.join(" "))}</p>);
  }

  return <>{blocks}</>;
}

export function PrdPage({ onBack }: PrdPageProps) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-[#182230] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="sticky top-4 z-10 mb-6 flex items-center justify-between rounded-2xl border border-[#e4e9f2] bg-white/95 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#31507c] transition hover:bg-[#eef4ff] hover:text-[#165dff]"
          >
            <ArrowLeft size={17} />
            返回退款演示
          </button>
          <span className="text-sm font-semibold text-[#667085]">教务退款与优惠体系 PRD</span>
        </div>
        <article className="rounded-3xl border border-[#e4e9f2] bg-white px-5 py-7 shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:px-10 sm:py-10">
          <div className="font-['Noto_Sans_SC'] text-[14px] sm:text-[15px]"><MarkdownContent content={prdContent} /></div>
        </article>
      </div>
    </main>
  );
}
