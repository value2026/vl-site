import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

const workshops = [
  {
    id: 1,
    title: 'Faculty Development Programme on Virtual Labs',
    date: 'August 12–13, 2025',
    location: 'IIT Bombay, Mumbai',
    mode: 'Hybrid',
    seats: 60,
    description: 'Two-day intensive training for faculty on integrating virtual labs into classroom curricula.',
    color: 'from-primary-800 to-primary-900',
  },
  {
    id: 2,
    title: 'Student Orientation Workshop — Southern Region',
    date: 'August 20, 2025',
    location: 'IIT Madras, Chennai',
    mode: 'In-person',
    seats: 120,
    description: 'Hands-on orientation for undergraduate students on accessing and using Virtual Labs effectively.',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 3,
    title: 'Nodal Centre Coordinator Training',
    date: 'September 5, 2025',
    location: 'Online (Zoom)',
    mode: 'Online',
    seats: 200,
    description: 'Training session for nodal centre coordinators on managing platform access and generating reports.',
    color: 'from-green-600 to-teal-700',
  },
  {
    id: 4,
    title: 'Advanced Simulation Design Workshop',
    date: 'September 18–20, 2025',
    location: 'IIT Delhi',
    mode: 'In-person',
    seats: 40,
    description: 'For developers and educators: learn to design and publish new virtual experiments on the platform.',
    color: 'from-purple-600 to-indigo-700',
  },
];

const modeColor = {
  Hybrid:    'bg-purple-100 text-purple-700',
  'In-person': 'bg-green-100 text-green-700',
  Online:    'bg-blue-100 text-blue-700',
};

export default function Workshop() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
            Events
          </span>
          <h1 className="font-heading text-5xl font-extrabold text-white mb-6">
            Workshops & Training
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Join our faculty development programmes, student orientations, and training
            sessions to make the most of Virtual Labs.
          </p>
        </div>
      </section>

      {/* Workshops list */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-6">
            {workshops.map((w) => (
              <div key={w.id} className="card border border-gray-100 overflow-hidden">
                <div className={`bg-gradient-to-r ${w.color} px-7 py-5`}>
                  <h2 className="font-heading text-lg font-bold text-white leading-snug">
                    {w.title}
                  </h2>
                </div>
                <div className="p-7">
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{w.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 text-primary-700" />
                      {w.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 text-primary-700" />
                      {w.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4 text-primary-700" />
                      {w.seats} seats
                    </div>
                    <div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${modeColor[w.mode]}`}>
                        {w.mode}
                      </span>
                    </div>
                  </div>
                  <button className="btn-primary text-sm px-5 py-2.5">
                    Register Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
