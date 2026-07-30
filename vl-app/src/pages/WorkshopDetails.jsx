import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, Loader2, ArrowLeft, Video, Clock, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

async function fetchWorkshop(id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/workshops/${id}`);
  if (!res.ok) throw new Error('Failed to fetch workshop');
  return res.json();
}

const modeColor = {
  Hybrid:    'bg-purple-100 text-purple-700',
  'In-person': 'bg-green-100 text-green-700',
  Online:    'bg-blue-100 text-blue-700',
};

export default function WorkshopDetails() {
  const { id } = useParams();


  const { data: workshop, isLoading, error } = useQuery({
    queryKey: ['workshop', id],
    queryFn: () => fetchWorkshop(id),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </main>
    );
  }

  if (error || !workshop) {
    return (
      <main className="pt-20 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Workshop Not Found</h2>
        <Link to="/workshop" className="text-primary-600 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Workshops
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-20 bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient py-12">
        <div className="container-custom relative">
          <Link to="/workshop" className="absolute -top-8 left-4 text-white/70 hover:text-white flex items-center gap-2 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to all workshops
          </Link>
          
          <div className="max-w-4xl">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 ${workshop.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
              {workshop.status || 'Active'}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              {workshop.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/80 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-200" />
                {new Date(workshop.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-200" />
                {workshop.location || 'Virtual Labs Platform'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-10">
            
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About this Workshop</h2>
                <div className="prose prose-primary max-w-none text-gray-600 leading-relaxed">
                  {workshop.description ? (
                    workshop.description.split('\n').map((line, i) => (
                      <p key={i} className="mb-4">{line}</p>
                    ))
                  ) : (
                    <p>
                      Join us for an interactive session exploring virtual labs and faculty development. 
                      This workshop is designed to provide comprehensive training on the platform's features and integration techniques.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-28">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Workshop Details</h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Video className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Format</p>
                      <p className="text-sm text-gray-500">{workshop.mode || 'Online'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-500">{new Date(workshop.date).toLocaleDateString()}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
