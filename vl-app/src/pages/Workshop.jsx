import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

async function fetchWorkshops() {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workshops`);
  if (!res.ok) throw new Error('Failed to fetch workshops');
  return res.json();
}

const modeColor = {
  Hybrid:    'bg-purple-100 text-purple-700',
  'In-person': 'bg-green-100 text-green-700',
  Online:    'bg-blue-100 text-blue-700',
};

export default function Workshop() {
  const { data: workshops, isLoading } = useQuery({
    queryKey: ['workshops-list'],
    queryFn: fetchWorkshops,
    staleTime: 60_000,
    retry: 1,
  });

  const workshopsList = workshops || [];
  const pageTitle = "Workshops & Training";
  const pageSubtitle = "Join our faculty development programmes, student orientations, and training sessions to make the most of Virtual Labs.";

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
            Events
          </span>
          <h1 className="font-heading text-5xl font-extrabold text-white mb-6">
            {pageTitle}
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {pageSubtitle}
          </p>
        </div>
      </section>

      {/* Workshops list */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : workshopsList.length === 0 ? (
            <div className="text-center text-gray-400 py-20">No upcoming workshops at the moment.</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {workshopsList.map((w, i) => {
                let theme = 'from-primary-800 to-primary-900';
                if (w.status === 'pending') theme = 'from-amber-500 to-orange-600';
                if (w.status === 'approved') theme = 'from-emerald-500 to-green-600';
                
                return (
                  <div key={w.id || i} className="card border border-gray-100 overflow-hidden flex flex-col group">
                    <div className={`bg-gradient-to-r ${theme} px-7 py-5 flex justify-between items-start`}>
                      <h2 className="font-heading text-lg font-bold text-white leading-snug group-hover:text-white/90 transition-colors">
                        {w.title}
                      </h2>
                      <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider ml-2">
                        {w.status || 'Active'}
                      </span>
                    </div>
                    <div className="p-7 flex-1 flex flex-col">
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                        {w.description || "Join us for an interactive session exploring virtual labs and faculty development."}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 text-primary-700" />
                          {new Date(w.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 text-primary-700" />
                          {w.location || 'Virtual Labs Platform'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="w-4 h-4 text-primary-700" />
                          {w.seats ? `${w.seats} seats` : 'Open'}
                        </div>
                        <div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${modeColor[w.mode] || 'bg-blue-100 text-blue-700'}`}>
                            {w.mode || 'Online'}
                          </span>
                        </div>
                      </div>
                      <Link 
                        to={`/workshop/${w.id}`}
                        className="btn-primary text-sm px-5 py-2.5 w-fit flex items-center gap-2"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
