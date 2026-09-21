import React from 'react';
import { renderFormattedText } from '../../utils/formatText';
import { ExternalLink, ArrowRight, Info, Hash } from 'lucide-react';

export default function DynamicBlockRenderer({ blocks = [], fields = [], className = '' }) {
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;
  const hasFields = Array.isArray(fields) && fields.length > 0;

  if (!hasBlocks && !hasFields) return null;

  return (
    <div className={`space-y-6 pt-4 ${className}`}>
      {/* ── Dynamic Content Blocks ───────────────────────────────────── */}
      {hasBlocks && (
        <div className="space-y-4">
          {blocks.map((block, idx) => {
            const bType = (block.type || 'paragraph').toLowerCase().trim();
            const text = block.text || block.content || block.title || '';
            const url = block.linkUrl || block.url || block.href || '';

            if (bType === 'heading' || bType === 'h2') {
              return (
                <h2 key={idx} className="font-heading text-2xl font-bold text-slate-900 mt-6 mb-3 tracking-tight">
                  {renderFormattedText(text)}
                </h2>
              );
            }

            if (bType === 'subheading' || bType === 'h3') {
              return (
                <h3 key={idx} className="font-heading text-xl font-bold text-slate-800 mt-4 mb-2">
                  {renderFormattedText(text)}
                </h3>
              );
            }

            if (bType === 'note' || bType === 'callout' || bType === 'italic') {
              return (
                <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50/60 border-l-4 border-blue-600 rounded-r-xl text-slate-700 text-sm leading-relaxed my-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    {renderFormattedText(text)}
                  </div>
                </div>
              );
            }

            if (bType === 'link' || bType === 'cta') {
              return (
                <div key={idx} className="pt-2">
                  <a
                    href={url.startsWith('/') || url.startsWith('http') ? url : `https://${url}`}
                    target={url.startsWith('/') ? undefined : "_blank"}
                    rel={url.startsWith('/') ? undefined : "noopener noreferrer"}
                    className="inline-flex items-center gap-2 bg-[#4F22BD] hover:bg-[#431CA3] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all group"
                  >
                    <span>{renderFormattedText(text || url || 'Visit Link')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              );
            }

            // Default: Paragraph
            return (
              <p key={idx} className="text-slate-600 leading-relaxed text-sm md:text-base">
                {renderFormattedText(text)}
              </p>
            );
          })}
        </div>
      )}

      {/* ── Custom Metadata Fields ────────────────────────────────────── */}
      {hasFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {fields.map((f, idx) => {
            const label = f.label || f.key || 'Field';
            const val = f.value || f.text || f.val || '';
            if (!val) return null;
            return (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <Hash className="w-3 h-3 text-slate-400" />
                  {label}
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {renderFormattedText(val)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
