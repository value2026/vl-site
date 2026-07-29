import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Calendar, Users, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

async function fetchProjectSections() {
  const res = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/pages/project/sections`);
  if (!res.ok) throw new Error('Failed to fetch project sections');
  return res.json();
}

export default function Project() {
  const { data: sections, isLoading } = useQuery({
    queryKey: ['project-sections'],
    queryFn: fetchProjectSections,
    staleTime: 60_000,
    retry: 1,
  });

  let timeline = [];
  let objectives = [];

  if (sections) {
    const timelineSec = sections.find(s => s.sectionKey === 'project_timeline');
    const objSec = sections.find(s => s.sectionKey === 'project_objectives');
    if (timelineSec?.content?.items) timeline = timelineSec.content.items;
    if (objSec?.content?.items) objectives = objSec.content.items;
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-gradient py-12">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            About the Project
          </span>
          <h1 className="font-heading text-4xl font-extrabold text-white mb-4">
            The Virtual Labs Project
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            A Ministry of Education initiative to provide remote access to labs in science and
            engineering disciplines through a web-based platform — free for all students in India.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 bg-white">
        <div className="container-custom grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="tag">Overview</span>
            <h2 className="section-title mt-4">What is Amrita Virtual Labs?</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Amrita Virtual Labs is a major initiative by Amrita Vishwa Vidyapeetham funded by the
              Ministry of Education under the National Mission on Education through ICT (NMEICT).
              It provides interactive simulation-based online experiment environments across engineering and sciences.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              The platform provides students access to over 700 virtual labs and 1,800+ experiments
              spanning core science and engineering disciplines — accessible anytime, anywhere without requiring
              physical lab equipment.
            </p>
            <div className="flex gap-4">
              <Link to="/nodal-centres/apply" className="btn-primary">
                Become a Partner <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="btn-outline-primary">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: '700+', l: 'Virtual Labs', Icon: Calendar },
                { n: '1,800+', l: 'Experiments', Icon: Users },
                { n: '14', l: 'Institutions', Icon: CheckCircle2 },
                { n: '5M+', l: 'Students Reached', Icon: Users },
              ].map(({ n, l, Icon }) => (
                <div key={l} className="bg-primary-50 border border-primary-100 rounded-2xl p-6">
                  <div className="text-3xl font-heading font-extrabold text-primary-800 mb-1">{n}</div>
                  <div className="text-sm text-gray-500 font-medium">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="tag">Mission</span>
            <h2 className="section-title mt-4">Project Objectives</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : objectives.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-10">No objectives configured.</div>
            ) : (
              objectives.map((obj, i) => (
                <div key={i} className="card p-6 border border-gray-100 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm leading-relaxed">{obj.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="tag">History</span>
            <h2 className="section-title mt-4">Project Timeline</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : timeline.length === 0 ? (
              <div className="text-center text-gray-400 py-10">No timeline events configured.</div>
            ) : (
              <>
                <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-primary-100" />
                {timeline.map((item, i) => (
                  <div key={item.year + i} className={`relative flex gap-8 mb-10 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="flex-1">
                      <div className={`card p-6 border border-gray-100 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                        <div className="text-xs font-bold text-primary-700 uppercase tracking-widest mb-1">{item.year}</div>
                        <h3 className="font-heading font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary-700 rounded-full border-4 border-white shadow top-6" />
                    <div className="flex-1" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
