import { assetUrl } from '../utils/url';

const DEFAULT_SPONSORS = [
  { id: 'moe',        name: 'Ministry of Education',       acronym: 'MoE',    description: 'Government of India',   color: 'from-orange-500 to-red-500'      },
  { id: 'iit-bombay', name: 'IIT Bombay',                  acronym: 'IITB',   description: 'Lead Institute',        color: 'from-blue-600 to-blue-800'       },
  { id: 'nmeict',     name: 'NMEICT',                      acronym: 'NMEICT', description: 'National Mission',      color: 'from-green-600 to-teal-700'      },
  { id: 'iit-delhi',  name: 'IIT Delhi',                   acronym: 'IITD',   description: 'Partner Institute',     color: 'from-purple-600 to-indigo-700'   },
  { id: 'iit-madras', name: 'IIT Madras',                  acronym: 'IITM',   description: 'Partner Institute',     color: 'from-orange-600 to-amber-700'    },
];

export default function SponsorsSection({ sectionTitle, sectionSubtitle, content = {} }) {
  const sponsors   = content.sponsors?.length ? content.sponsors : DEFAULT_SPONSORS;
  const heading    = sectionTitle || "Sponsors of Virtual Labs";
  const subtitle   = sectionSubtitle || 'This project is an initiative of Ministry of Education under National Mission on Education through ICT. These experiments and labs will be hosted for open access through the main project website www.vlab.co.in.';
  const tag        = content.sectionTag  || 'Our Sponsors';
  const footerNote = content.footerNote  || '🇮🇳 A Government of India initiative to democratize quality STEM education';

  return (
    <section className="py-20 lg:py-24 bg-white border-t border-slate-100" aria-labelledby="sponsors-heading">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="tag">
            {tag}
          </span>
          <h2 id="sponsors-heading" className="section-title">
            {heading}
          </h2>
        </div>
        
        {/* Emblem & Initiative Text Box */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
          <div className="flex-shrink-0 w-32 h-40 flex flex-col items-center justify-center bg-transparent">
            <img 
              src={assetUrl('/satyameva-jayate-v2.png')} 
              alt="Satyameva Jayate - Government of India" 
              className="w-full object-contain mix-blend-multiply"
              style={{ clipPath: 'inset(2% 0 0 4%)' }}
            />
            <span className="text-[10px] font-bold text-slate-800 mt-2 tracking-wide">सत्यमेव जयते</span>
          </div>
          <div className="flex-1 text-[#475569] text-base md:text-[17px] leading-relaxed pt-4 text-center md:text-left">
            <p>{subtitle}</p>
          </div>
        </div>

        {/* Dynamic Partner Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {sponsors.map(({ id, name, acronym, description, color, logoUrl }) => (
            <div
              key={id || name}
              className="premium-card flex flex-col items-center justify-center gap-3 rounded-2xl p-6 cursor-default w-[220px] text-center"
            >
              <div className="h-16 flex items-center justify-center mb-1">
                {logoUrl ? (
                  <img src={logoUrl} alt={name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className={`w-14 h-14 bg-gradient-to-br ${color || 'from-slate-600 to-slate-800'} rounded-xl flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-heading font-bold text-sm text-center px-1">{acronym || name.substring(0,3)}</span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-[#0F172A] font-bold text-[15px] leading-tight mb-1">{name}</div>
                <div className="text-[#64748B] text-xs font-medium">{description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-6 py-4">
            <span className="text-[#64748B] text-sm font-medium">{footerNote}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
