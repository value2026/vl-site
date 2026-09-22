import { assetUrl } from '../utils/url';
import { renderFormattedText } from '../utils/formatText';
import DynamicBlockRenderer from './public/DynamicBlockRenderer';

const DEFAULT_SPONSORS = [
  { id: 'moe',        name: 'Ministry of Education', acronym: 'MoE',    description: 'Government of India',  color: 'from-orange-500 to-red-500',    isSponsor: true  },
  { id: 'iit-bombay', name: 'IIT Bombay',             acronym: 'IITB',   description: 'Lead Institute',       color: 'from-blue-600 to-blue-800',     isSponsor: false },
  { id: 'nmeict',     name: 'NMEICT',                 acronym: 'NMEICT', description: 'National Mission',     color: 'from-green-600 to-teal-700',    isSponsor: false },
  { id: 'iit-delhi',  name: 'IIT Delhi',              acronym: 'IITD',   description: 'Partner Institute',    color: 'from-purple-600 to-indigo-700', isSponsor: false },
  { id: 'iit-madras', name: 'IIT Madras',             acronym: 'IITM',   description: 'Partner Institute',   color: 'from-orange-600 to-amber-700',  isSponsor: false },
];

export default function SponsorsSection({ sectionTitle, sectionSubtitle, content = {} }) {
  const allSponsors = content.sponsors?.length ? content.sponsors : DEFAULT_SPONSORS;
  const sponsor     = allSponsors.find(s => s.isSponsor) || allSponsors[0];
  const partners    = allSponsors.filter(s => !s.isSponsor);
  
  const rawTitle = sectionTitle || 'Partners & Sponsors of Virtual Labs';
  const heading  = (rawTitle === 'Sponsors of Virtual Labs' || rawTitle === 'Sponsor & Partners')
    ? 'Partners & Sponsors of Virtual Labs'
    : rawTitle;

  const subtitle = sectionSubtitle || 'This project is an initiative of Ministry of Education under National Mission on Education through ICT. These experiments and labs will be hosted for open access through the main project website www.vlab.co.in.';

  const rawTag   = content.sectionTag || 'OUR PARTNERS';
  const tag      = (rawTag === 'OUR SPONSORS' || rawTag === 'Powered By') ? 'OUR PARTNERS' : rawTag;
  const footerNote = content.footerNote || '🇮🇳 A Government of India initiative to democratize quality STEM education';

  return (
    <section className="py-10 md:py-14 bg-[#F8FAFC] border-t border-slate-200/70" aria-labelledby="sponsors-heading">
      <div className="container-custom">
        <div className="text-center mb-6 md:mb-8">
          <span className="tag">
            {tag}
          </span>
          <h2 id="sponsors-heading" className="section-title mt-2 mb-2">
            {heading}
          </h2>
        </div>
        
        {/* Emblem & Initiative Text Box */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 md:mb-10">
          <div className="flex-shrink-0 w-20 sm:w-24 flex flex-col items-center justify-center bg-transparent">
            <img 
              src={assetUrl('/satyameva-jayate-v2.png')} 
              alt="Satyameva Jayate - Government of India" 
              className="w-full object-contain mix-blend-multiply"
              style={{ clipPath: 'inset(2% 0 0 4%)' }}
            />
            <span className="text-[10px] font-bold text-slate-800 mt-1.5 tracking-wide">सत्यमेव जयते</span>
          </div>
          <div className="flex-1 text-[#475569] text-sm md:text-base leading-relaxed pt-1 text-center md:text-left">
            <p>{renderFormattedText(subtitle)}</p>
          </div>
        </div>

        {/* ── SPONSOR block ── */}
        <div className="mb-14">
          <p className="text-center text-xs font-bold tracking-[0.18em] uppercase text-orange-500 mb-6">
            Principal Sponsor
          </p>
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8
                          border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50
                          rounded-3xl px-8 py-8 shadow-sm">
            {/* Emblem */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <img
                src={assetUrl('/satyameva-jayate-v2.png')}
                alt="Satyameva Jayate – Government of India"
                className="w-24 object-contain mix-blend-multiply"
                style={{ clipPath: 'inset(2% 0 0 4%)' }}
              />
              <span className="text-[9px] font-bold text-slate-700 tracking-wide">सत्यमेव जयते</span>
            </div>

            {/* MoE badge + text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-3 mb-3">
                {sponsor.logoUrl ? (
                  <img src={sponsor.logoUrl} alt={sponsor.name} className="h-12 object-contain" />
                ) : (
                  <div className={`w-12 h-12 bg-gradient-to-br ${sponsor.color} rounded-xl flex items-center justify-center shadow`}>
                    <span className="text-white font-heading font-bold text-sm">{sponsor.acronym}</span>
                  </div>
                )}
                <div className="text-left">
                  <div className="font-bold text-lg text-slate-900 leading-tight">{sponsor.name}</div>
                  <div className="text-orange-600 text-xs font-semibold">{sponsor.description}</div>
                </div>
              </div>
              <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* ── PARTNERS block ── */}
        <div>
          <p className="text-center text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-4">
            Our Partners
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
            {partners.map(({ id, name, acronym, description, color, logoUrl }) => (
              <div
                key={id || name}
                className="premium-card flex flex-col items-center justify-center gap-2.5 rounded-2xl p-4 sm:p-5 cursor-default w-[170px] sm:w-[185px] text-center"
              >
                <div className="h-12 flex items-center justify-center mb-0.5">
                  {logoUrl ? (
                    <img src={logoUrl} alt={name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className={`w-11 h-11 bg-gradient-to-br ${color || 'from-slate-600 to-slate-800'} rounded-xl flex items-center justify-center shadow-sm`}>
                      <span className="text-white font-heading font-bold text-xs text-center px-1">{acronym || name.substring(0, 3)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[#0F172A] font-bold text-[13px] leading-tight mb-0.5">{name}</div>
                  <div className="text-[#64748B] text-[11px] font-medium">{description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] shadow-2xs rounded-xl px-4.5 py-2.5">
            <span className="text-[#64748B] text-xs sm:text-sm font-medium">{footerNote}</span>
          </div>
        </div>

        <DynamicBlockRenderer blocks={content.customBlocks} fields={content.customFields} />
      </div>
    </section>
  );
}
