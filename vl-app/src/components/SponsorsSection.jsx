const DEFAULT_SPONSORS = [
  { id: 'amrita',     name: 'Amrita Vishwa Vidyapeetham', acronym: 'AMRITA', description: 'Lead Institution',      color: 'from-rose-700 to-pink-900'       },
  { id: 'moe',        name: 'Ministry of Education',       acronym: 'MoE',    description: 'Government of India',   color: 'from-orange-500 to-red-500'      },
  { id: 'nmeict',     name: 'NMEICT',                      acronym: 'NMEICT', description: 'National Mission',      color: 'from-green-600 to-teal-700'      },
  { id: 'iit-bombay', name: 'IIT Bombay',                  acronym: 'IITB',   description: 'Consortium Partner',    color: 'from-blue-600 to-blue-800'       },
  { id: 'iit-delhi',  name: 'IIT Delhi',                   acronym: 'IITD',   description: 'Consortium Partner',    color: 'from-purple-600 to-indigo-700'   },
];

export default function SponsorsSection({ sectionTitle, sectionSubtitle, content = {} }) {
  const sponsors   = content.sponsors?.length ? content.sponsors : DEFAULT_SPONSORS;
  const heading    = sectionTitle || "Sponsors of Virtual Labs";
  const subtitle   = sectionSubtitle || 'This project is an initiative of Ministry of Human Resource Department under National Mission on Education through ICT. These experiments and labs will be hosted for open access through the main project website www.vlab.co.in.';
  const tag        = content.sectionTag  || 'Our Sponsors';
  const footerNote = content.footerNote  || '🇮🇳 A Government of India initiative to democratize quality STEM education';

  return (
    <section className="py-20 lg:py-24 bg-white" aria-labelledby="sponsors-heading">
      <div className="container-custom">
        <div className="text-center">
          <span className="tag">
            {tag}
          </span>
          <h2 id="sponsors-heading" className="section-title">
            {heading}
          </h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-[50px]">
          {sponsors.map(({ id, name, acronym, description, color, logoUrl }) => (
            <div
              key={id}
              className="premium-card flex flex-col items-center justify-center gap-3 rounded-2xl p-6 cursor-default w-[220px] text-center"
            >
              <div className="h-16 flex items-center justify-center mb-1">
                {logoUrl ? (
                  <img src={logoUrl} alt={name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-heading font-bold text-sm text-center px-1">{acronym}</span>
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
