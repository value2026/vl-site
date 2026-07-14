import { ExternalLink, FileText, Download } from 'lucide-react';

const publications = [
  {
    year: '2024',
    title: 'Impact of Virtual Labs on Student Learning Outcomes in Engineering Education',
    authors: 'Sharma, R., Verma, A., & Kumar, S.',
    journal: 'Journal of Engineering Education, Vol. 113(2)',
    doi: '#',
  },
  {
    year: '2023',
    title: 'Remote Laboratory Access for Developing Nations: A Case Study',
    authors: 'Nair, P., Iyer, M., & Singh, D.',
    journal: 'IEEE Transactions on Education, Vol. 66(4)',
    doi: '#',
  },
  {
    year: '2023',
    title: 'Gamification in Virtual Science Labs: Engagement and Retention',
    authors: 'Reddy, K., & Chauhan, V.',
    journal: 'Computers & Education, Vol. 189',
    doi: '#',
  },
  {
    year: '2022',
    title: 'Design Principles for Accessible Online Laboratory Simulations',
    authors: 'Mehta, J., Bose, A., & Das, R.',
    journal: 'British Journal of Educational Technology, Vol. 53(1)',
    doi: '#',
  },
  {
    year: '2022',
    title: 'Virtual Labs Platform Architecture: Scalability and Performance',
    authors: 'Kumar, R., & Agrawal, S.',
    journal: 'ACM Conference on Learning @ Scale',
    doi: '#',
  },
  {
    year: '2021',
    title: 'Student Perception of Virtual Labs During COVID-19 Pandemic',
    authors: 'Joshi, N., Patel, H., & Singh, A.',
    journal: 'Education and Information Technologies, Vol. 26',
    doi: '#',
  },
];

export default function Publications() {
  const years = [...new Set(publications.map((p) => p.year))].sort((a, b) => b - a);

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
            Research
          </span>
          <h1 className="font-heading text-5xl font-extrabold text-white mb-6">
            Publications
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Peer-reviewed research papers and technical reports on virtual laboratory
            education and the Virtual Labs initiative.
          </p>
        </div>
      </section>

      {/* Publications */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl">
          {years.map((year) => (
            <div key={year} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-heading text-2xl font-bold text-primary-800">{year}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="space-y-4">
                {publications
                  .filter((p) => p.year === year)
                  .map((pub, i) => (
                    <div key={i} className="card p-6 border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-2 leading-snug">
                        {pub.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">{pub.authors}</p>
                      <p className="text-sm text-primary-700 font-medium mb-4">{pub.journal}</p>
                      <div className="flex gap-3">
                        <a
                          href={pub.doi}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-primary-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View DOI
                        </a>
                        <a
                          href={pub.doi}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-primary-300 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
