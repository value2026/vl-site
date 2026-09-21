import React from 'react';

function parseBold(str, baseKey = 'txt') {
  if (!str) return [];
  const boldRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const elements = [];
  let lastIdx = 0;
  let bMatch;
  while ((bMatch = boldRegex.exec(str)) !== null) {
    if (bMatch.index > lastIdx) {
      elements.push(str.substring(lastIdx, bMatch.index));
    }
    const boldText = bMatch[2] || bMatch[3];
    elements.push(
      <strong key={`${baseKey}-b-${bMatch.index}`} className="font-bold text-slate-900 dark:text-white">
        {boldText}
      </strong>
    );
    lastIdx = bMatch.index + bMatch[0].length;
  }
  if (lastIdx < str.length) {
    elements.push(str.substring(lastIdx));
  }
  return elements;
}

/**
 * Parses plain text containing:
 * - HTML links (<a href="...">...</a>)
 * - Markdown links ([label](url))
 * - Plain URLs (http://, https://)
 * - Bare domain links (www.vlab.co.in, vlab.co.in, etc.)
 * - Bold text (**bold** or *bold*)
 * and converts them into interactive React elements.
 */
export function renderFormattedText(
  text, 
  linkClassName = "text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
) {
  if (!text) return null;

  // Regex matches:
  // 1) HTML anchor tags: <a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>
  // 2) Markdown link: [label](url)
  // 3) URL starting with http:// or https://
  // 4) Bare domain names starting with www. or known academic/standard domains
  const regex = /(<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>|\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s<]+|(?:www\.)?vlab\.co\.in[^\s<]*|www\.[^\s<,.]+(?:\.[^\s<,.]{2,})+(?:\/[^\s<,]*)?)/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchStr = match[0];
    const matchIndex = match.index;

    // Push preceding plain text with bold parsing
    if (matchIndex > lastIndex) {
      parts.push(...parseBold(text.substring(lastIndex, matchIndex), `pre-${matchIndex}`));
    }

    // Check if HTML <a> tag
    const htmlAnchorMatch = matchStr.match(/^<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>$/i);
    if (htmlAnchorMatch) {
      let href = htmlAnchorMatch[1].trim();
      const anchorLabel = htmlAnchorMatch[2];
      if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//') && !href.startsWith('/')) {
        href = 'https://' + href;
      }
      parts.push(
        <a
          key={`a-tag-${matchIndex}`}
          href={href}
          target={href.startsWith('/') ? undefined : "_blank"}
          rel={href.startsWith('/') ? undefined : "noopener noreferrer"}
          className={linkClassName}
        >
          {anchorLabel}
        </a>
      );
    } else {
      // Check if Markdown link: [label](url)
      const markdownMatch = matchStr.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (markdownMatch) {
        const label = markdownMatch[1];
        let url = markdownMatch[2].trim();
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//') && !url.startsWith('/')) {
          url = 'https://' + url;
        }
        parts.push(
          <a
            key={`md-link-${matchIndex}`}
            href={url}
            target={url.startsWith('/') ? undefined : "_blank"}
            rel={url.startsWith('/') ? undefined : "noopener noreferrer"}
            className={linkClassName}
          >
            {label}
          </a>
        );
      } else {
        // Plain URL or domain (e.g. www.vlab.co.in, https://..., vlab.co.in)
        let cleanUrl = matchStr;
        let trailingPunct = '';
        if (/[.,!?)]$/.test(cleanUrl)) {
          trailingPunct = cleanUrl.slice(-1);
          cleanUrl = cleanUrl.slice(0, -1);
        }

        let href = cleanUrl;
        if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//')) {
          href = 'https://' + href;
        }

        parts.push(
          <span key={`url-${matchIndex}`}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              {cleanUrl}
            </a>
            {trailingPunct}
          </span>
        );
      }
    }

    lastIndex = matchIndex + matchStr.length;
  }

  // Push remaining text with bold parsing
  if (lastIndex < text.length) {
    parts.push(...parseBold(text.substring(lastIndex), `post-${lastIndex}`));
  }

  return parts;
}
