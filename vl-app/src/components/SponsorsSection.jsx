const sponsors = [
  {
    id: 'moe',
    name: 'Ministry of Education',
    acronym: 'MoE',
    description: 'Government of India',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'iit-bombay',
    name: 'IIT Bombay',
    acronym: 'IITB',
    description: 'Lead Institute',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'nmeict',
    name: 'NMEICT',
    acronym: 'NMEICT',
    description: 'National Mission',
    color: 'from-green-600 to-teal-700',
  },
  {
    id: 'iit-delhi',
    name: 'IIT Delhi',
    acronym: 'IITD',
    description: 'Partner Institute',
    color: 'from-purple-600 to-indigo-700',
  },
  {
    id: 'iit-madras',
    name: 'IIT Madras',
    acronym: 'IITM',
    description: 'Partner Institute',
    color: 'from-yellow-500 to-orange-600',
  },
];

export default function SponsorsSection() {
  return (
    <section className="py-20 bg-gray-900" aria-labelledby="sponsors-heading">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            Our Partners
          </span>
          <h2 id="sponsors-heading" className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Backed by India's Premier Institutions
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Virtual Labs is a collaborative project supported by IITs, NITs, and the
            Ministry of Education under the National Mission on Education through ICT.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-5 mt-10">
          {sponsors.map(({ id, name, acronym, description, color }) => (
            <div
              key={id}
              className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-6 py-5 transition-all duration-300 cursor-default"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <span className="text-white font-heading font-bold text-xs text-center leading-tight px-1">
                  {acronym}
                </span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{name}</div>
                <div className="text-gray-500 text-xs mt-0.5">{description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-3 bg-primary-900/50 border border-primary-700/50 rounded-xl px-6 py-4">
            <span className="text-primary-300 text-sm font-medium">
              🇮🇳 A Government of India initiative to democratize quality STEM education
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
