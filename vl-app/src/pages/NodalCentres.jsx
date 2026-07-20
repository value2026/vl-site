import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2, ArrowRight, Building, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

async function fetchNodalCentresSections() {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pages/nodal-centres/sections`);
  if (!res.ok) throw new Error('Failed to fetch nodal centres sections');
  return res.json();
}

export default function NodalCentres() {
  const { data: sections, isLoading } = useQuery({
    queryKey: ['nodal-centres-sections'],
    queryFn: fetchNodalCentresSections,
    staleTime: 60_000,
    retry: 1,
  });

  let benefits = [];
  let centres = [];

  if (sections) {
    const benSec = sections.find(s => s.sectionKey === 'nc_benefits');
    const listSec = sections.find(s => s.sectionKey === 'nc_list');
    if (benSec?.content?.items) benefits = benSec.content.items;
    if (listSec?.content?.items) centres = listSec.content.items;
  }
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
            Nodal Centres
          </span>
          <h1 className="font-heading text-5xl font-extrabold text-white mb-6">
            Join the Virtual Labs Network
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
            Become a nodal centre and bring world-class virtual lab experiences to your students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/nodal-centres/apply" className="btn-secondary">
              Apply Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/nodal-centres/demo" className="btn-outline">
              Request Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="tag">Why Join</span>
            <h2 className="section-title mt-4">Benefits of Becoming a Nodal Centre</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : benefits.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-10">No benefits configured.</div>
            ) : (
              benefits.map((b, i) => (
                <div key={i} className="card p-6 border border-gray-100 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm leading-relaxed">{b.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Centre list */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="tag">Network</span>
              <h2 className="section-title mt-4 mb-0">Registered Nodal Centres</h2>
            </div>
            <span className="text-sm text-gray-400">{centres.length} centres listed</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : centres.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-10">No nodal centres registered yet.</div>
            ) : (
              centres.map((c, i) => {
                // Ensure active is parsed as a boolean since HTML inputs sometimes store as strings
                const isActive = c.active === true || c.active === 'true';
                
                return (
                  <div key={c.id || i} className="card p-6 border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary-700" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{c.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {c.location}
                    </div>
                    <span className="mt-3 inline-block text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                      {c.category}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
