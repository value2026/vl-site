import { Handshake, ExternalLink } from 'lucide-react';
import { assetUrl } from '../utils/url';
import DynamicBlockRenderer from './public/DynamicBlockRenderer';

const DEFAULT_SPONSORS = [
  {
    id: 'iit-bombay',
    name: 'IIT Bombay',
    acronym: 'IITB',
    theme: 'blue',
    logoUrl: '/logos/iit-bombay.svg',
    isSponsor: false,
  },
  {
    id: 'iit-delhi',
    name: 'IIT Delhi',
    acronym: 'IITD',
    theme: 'purple',
    logoUrl: '/logos/iit-delhi.svg',
    isSponsor: false,
  },
  {
    id: 'iit-madras',
    name: 'IIT Madras',
    acronym: 'IITM',
    theme: 'amber',
    logoUrl: '/logos/iit-madras.svg',
    isSponsor: false,
  },
];

const THEME_STYLES = {
  blue: {
    border: 'border-b-[3px] border-b-blue-500 hover:border-b-blue-600',
    shadow: 'hover:shadow-blue-500/10',
    avatarBg: 'from-blue-600 to-blue-800',
  },
  purple: {
    border: 'border-b-[3px] border-b-purple-500 hover:border-b-purple-600',
    shadow: 'hover:shadow-purple-500/10',
    avatarBg: 'from-purple-600 to-indigo-700',
  },
  amber: {
    border: 'border-b-[3px] border-b-amber-500 hover:border-b-amber-600',
    shadow: 'hover:shadow-amber-500/10',
    avatarBg: 'from-amber-500 to-orange-600',
  },
  emerald: {
    border: 'border-b-[3px] border-b-emerald-500 hover:border-b-emerald-600',
    shadow: 'hover:shadow-emerald-500/10',
    avatarBg: 'from-emerald-600 to-teal-700',
  },
  rose: {
    border: 'border-b-[3px] border-b-rose-500 hover:border-b-rose-600',
    shadow: 'hover:shadow-rose-500/10',
    avatarBg: 'from-rose-500 to-red-600',
  },
  indigo: {
    border: 'border-b-[3px] border-b-indigo-500 hover:border-b-indigo-600',
    shadow: 'hover:shadow-indigo-500/10',
    avatarBg: 'from-indigo-600 to-indigo-800',
  },
  cyan: {
    border: 'border-b-[3px] border-b-cyan-500 hover:border-b-cyan-600',
    shadow: 'hover:shadow-cyan-500/10',
    avatarBg: 'from-cyan-600 to-blue-700',
  },
};

/**
 * Resolve logo image for partners if not explicitly supplied
 */
function resolveLogo(partner) {
  if (partner.logoUrl) return assetUrl(partner.logoUrl);

  const lowerName = (partner.name || '').toLowerCase();
  const lowerId   = (partner.id || '').toLowerCase();

  if (lowerName.includes('bombay') || lowerId.includes('bombay')) return assetUrl('/logos/iit-bombay.svg');
  if (lowerName.includes('delhi') || lowerId.includes('delhi')) return assetUrl('/logos/iit-delhi.svg');
  if (lowerName.includes('madras') || lowerId.includes('madras')) return assetUrl('/logos/iit-madras.svg');

  return null;
}

/**
 * Resolve color theme
 */
function resolveTheme(partner, index) {
  if (partner.theme && THEME_STYLES[partner.theme]) return partner.theme;

  const lowerName = (partner.name || '').toLowerCase();
  if (lowerName.includes('bombay')) return 'blue';
  if (lowerName.includes('delhi')) return 'purple';
  if (lowerName.includes('madras')) return 'amber';

  const themes = ['blue', 'purple', 'amber', 'emerald', 'rose', 'indigo', 'cyan'];
  return themes[index % themes.length];
}

export default function SponsorsSection({ sectionTitle, sectionSubtitle, content = {} }) {
  const allItems = content.sponsors?.length ? content.sponsors : DEFAULT_SPONSORS;
  
  // Filter out pure sponsors if designated, or show partners
  const partnerItems = allItems.filter(s => !s.isSponsor);
  const partners = partnerItems.length > 0 ? partnerItems : allItems;

  const baseTitle = sectionTitle || 'Partners & Sponsors of Virtual Labs';
  const rawTitle = (baseTitle === 'Sponsors of Virtual Labs' || baseTitle === 'Sponsor & Partners')
    ? 'Partners & Sponsors of Virtual Labs'
    : baseTitle;
  const highlightWord = content.titleHighlight || 'Virtual Labs';

  // Section badge tag for Sponsors sub-divider
  const sectionBadge = content.sectionTag || 'OUR SPONSORS';

  // Initiative description and portal link
  const portalUrl = content.portalUrl || 'https://www.vlab.co.in';
  const portalLabel = content.portalLabel || 'www.vlab.co.in';
  const defaultDesc = 'This project is an initiative of the Ministry of Education (MoE) under the National Mission on Education through ICT. These experiments and virtual labs are hosted for open access through the main project website';
  const rawInitiativeDesc = content.initiativeText || sectionSubtitle || defaultDesc;

  // Cleanly strip trailing portal URL repetitions to prevent "www.vlab.co.in. www.vlab.co.in"
  const cleanInitiativeDesc = rawInitiativeDesc
    .replace(/,?\s*(https?:\/\/)?(www\.)?vlab\.co\.in\.?\s*$/i, '')
    .replace(/\.?\s*$/, '')
    .trim();

  // Partners divider tag
  const partnersTag = content.partnersTag || 'OUR PARTNERS';

  // Emblem image with cache-bust to ensure newly cleaned transparent image loads without stale browser cache
  const emblemUrl = content.emblemUrl ? assetUrl(content.emblemUrl) : assetUrl('/satyameva-jayate-v2.png?v=4');

  // Helper to render title with gradient highlight
  const renderTitle = () => {
    if (rawTitle.includes(highlightWord)) {
      const parts = rawTitle.split(highlightWord);
      return (
        <>
          {parts[0]}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 bg-clip-text text-transparent">
            {highlightWord}
          </span>
          {parts.slice(1).join(highlightWord)}
        </>
      );
    }
    return rawTitle;
  };

  return (
    <section className="py-10 md:py-14 bg-[#F8FAFC] border-t border-slate-200/80 relative" aria-labelledby="sponsors-heading">
      <div className="container-custom max-w-6xl">

        {/* ── Main Section Title ── */}
        <div className="text-center mb-6">
          <h2 id="sponsors-heading" className="text-2xl sm:text-3xl md:text-[32px] font-extrabold text-[#0F172A] tracking-tight font-heading leading-tight">
            {renderTitle()}
          </h2>
          {/* Blue Accent Dash Line */}
          <div className="w-10 h-1 bg-[#3B82F6] rounded-full mx-auto mt-2.5 mb-1" />
        </div>

        {/* ── Sub-divider: OUR SPONSORS (Aligned directly above MoE sponsor block) ── */}
        <div className="relative flex items-center justify-center my-6 md:my-7 max-w-xl mx-auto">
          <div className="border-t border-slate-200/90 w-full" />
          <span className="absolute bg-[#F8FAFC] px-4 text-[11px] font-bold tracking-[0.22em] text-[#4F46E5] uppercase select-none inline-flex items-center gap-1.5">
            <Handshake className="w-3.5 h-3.5 text-[#4F46E5]" />
            {sectionBadge}
          </span>
        </div>

        {/* ── Ministry of Education (Sponsor Block) ── */}
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center md:items-center justify-center gap-4 sm:gap-6 mb-7 md:mb-8 px-4">
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              src={emblemUrl}
              alt="Satyameva Jayate - Government of India"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-2xs"
            />
          </div>
          <div className="text-[#475569] text-xs sm:text-[13.5px] leading-relaxed text-center md:text-left max-w-xl font-normal">
            <p>
              {cleanInitiativeDesc}
              {cleanInitiativeDesc.endsWith(',') ? ' ' : ', '}
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5 transition-colors"
              >
                <span>{portalLabel}</span>
                <ExternalLink className="w-3 h-3 inline text-blue-600" />
              </a>
              .
            </p>
          </div>
        </div>

        {/* ── Sub-divider: OUR PARTNERS ── */}
        <div className="relative flex items-center justify-center my-6 md:my-7 max-w-xl mx-auto">
          <div className="border-t border-slate-200/90 w-full" />
          <span className="absolute bg-[#F8FAFC] px-4 text-[11px] font-bold tracking-[0.22em] text-slate-400 uppercase select-none">
            {partnersTag}
          </span>
        </div>

        {/* ── Partner Cards Grid (Single row of 6 on desktop/tablet, wraps next row if > 6) ── */}
        <div
          className={`mx-auto items-stretch ${
            partners.length < 6
              ? 'flex flex-wrap justify-center gap-2.5 sm:gap-3.5 max-w-5xl'
              : 'grid grid-cols-3 min-[540px]:grid-cols-6 sm:grid-cols-6 gap-2 sm:gap-3 lg:gap-3.5 w-full max-w-6xl'
          }`}
        >
          {partners.map((partner, index) => {
            const themeKey = resolveTheme(partner, index);
            const styles = THEME_STYLES[themeKey] || THEME_STYLES.blue;
            const logo = resolveLogo(partner);

            const CardContent = (
              <div
                className={`h-full bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs ${styles.border} ${styles.shadow} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden group ${
                  partners.length < 6 ? 'w-[130px] sm:w-[150px]' : 'w-full'
                }`}
              >
                {/* Top Logo Container */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center p-0.5 mb-1.5 sm:mb-2 bg-slate-50/50 group-hover:scale-105 transition-transform duration-300">
                  {logo ? (
                    <img
                      src={logo}
                      alt={partner.name}
                      className="w-full h-full object-contain rounded-full drop-shadow-2xs"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${styles.avatarBg} rounded-full flex items-center justify-center shadow-xs`}>
                      <span className="text-white font-heading font-extrabold text-[11px] sm:text-xs tracking-wider">
                        {partner.acronym || partner.name?.substring(0, 3) || 'IIT'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Institute Name */}
                <h3 className="text-[#0F172A] font-bold text-[11.5px] sm:text-xs md:text-[13px] font-heading tracking-tight leading-snug line-clamp-2 px-0.5">
                  {partner.name}
                </h3>
              </div>
            );

            if (partner.websiteUrl) {
              return (
                <a
                  key={partner.id || partner.name || index}
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus:outline-none h-full"
                  title={`Visit ${partner.name}`}
                >
                  {CardContent}
                </a>
              );
            }

            return (
              <div key={partner.id || partner.name || index} className="h-full">
                {CardContent}
              </div>
            );
          })}
        </div>

        <DynamicBlockRenderer blocks={content.customBlocks} fields={content.customFields} />
      </div>
    </section>
  );
}
