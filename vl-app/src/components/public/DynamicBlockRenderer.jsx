import React from 'react';
import { renderFormattedText } from '../../utils/formatText';

/**
 * DynamicBlockRenderer
 * Renders custom blocks (headings, subheadings, paragraphs, callouts, links, images)
 * and custom fields (key-value metadata) configured dynamically by admins.
 */
export default function DynamicBlockRenderer({ blocks = [], fields = [], className = '' }) {
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;
  const hasFields = Array.isArray(fields) && fields.length > 0;

  if (!hasBlocks && !hasFields) return null;

  return (
    <div className={`space-y-4 my-6 ${className}`}>
      {/* Dynamic Content Blocks */}
      {hasBlocks && blocks.map((block, idx) => {
        const bType = (block.type || block.blockType || 'paragraph').toLowerCase().trim();
        const text = block.text || block.content || block.value || '';
        const url = block.linkUrl || block.href || block.url;
        const imgUrl = block.imageUrl || url;

        if (bType === 'heading' || bType === 'h2') {
          return (
            <h2 key={idx} className="font-heading text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3">
              {renderFormattedText(text)}
            </h2>
          );
        }

        if (bType === 'subheading' || bType === 'h3') {
          return (
            <h3 key={idx} className="font-heading text-xl font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2">
              {renderFormattedText(text)}
            </h3>
          );
        }

        if (bType === 'h1') {
          return (
            <h1 key={idx} className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white mt-6 mb-4">
              {renderFormattedText(text)}
            </h1>
          );
        }

        if (bType === 'note' || bType === 'callout' || bType === 'alert') {
          return (
            <div key={idx} className="p-4 bg-blue-50/80 dark:bg-blue-900/25 border-l-4 border-blue-500 rounded-r-xl my-3 text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed shadow-sm">
              {renderFormattedText(text)}
            </div>
          );
        }

        if (bType === 'link' || bType === 'button') {
          return (
            <div key={idx} className="pt-2 pb-1">
              <a
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                {renderFormattedText(text || url || 'Visit Link →')}
              </a>
            </div>
          );
        }

        if (bType === 'image') {
          return (
            <div key={idx} className="my-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <img src={imgUrl || text} alt={text || 'Custom Content Image'} className="w-full h-auto object-cover max-h-[450px]" />
              {text && text !== imgUrl && (
                <p className="p-3 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 text-center italic border-t border-slate-100 dark:border-slate-800">
                  {renderFormattedText(text)}
                </p>
              )}
            </div>
          );
        }

        // Default Paragraph / Text
        return (
          <p key={idx} className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
            {renderFormattedText(text)}
          </p>
        );
      })}

      {/* Dynamic Key-Value Custom Fields */}
      {hasFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
          {fields.map((field, fIdx) => (
            <div key={fIdx} className="p-3.5 bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {field.label || 'Custom Detail'}
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {renderFormattedText(field.value || field.text || '-')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
