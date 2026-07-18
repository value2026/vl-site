import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2, ArrowRight, Building } from 'lucide-react';

const centres = [
  { id: 1, name: 'BITS Pilani', location: 'Pilani, Rajasthan', category: 'Engineering', active: true },
  { id: 2, name: 'VIT University', location: 'Vellore, Tamil Nadu', category: 'Engineering', active: true },
  { id: 3, name: 'Amrita University', location: 'Coimbatore, Tamil Nadu', category: 'Science', active: true },
  { id: 4, name: 'Jadavpur University', location: 'Kolkata, West Bengal', category: 'Engineering', active: true },
  { id: 5, name: 'SRM Institute', location: 'Chennai, Tamil Nadu', category: 'Engineering', active: true },
  { id: 6, name: 'Manipal Institute of Technology', location: 'Manipal, Karnataka', category: 'Engineering', active: true },
  { id: 7, name: 'Thapar Institute', location: 'Patiala, Punjab', category: 'Engineering', active: true },
  { id: 8, name: 'PSG College of Technology', location: 'Coimbatore, Tamil Nadu', category: 'Science', active: false },
];

const benefits = [
  'Free access to all 700+ virtual labs for your institution',
  'Priority support and technical assistance',
  'Dedicated workshops and faculty training sessions',
  'Certificate of recognition from Ministry of Education',
  'Usage analytics and progress tracking dashboard',
  'Promotion on Virtual Labs official website',
];

export default function NodalCentres() {
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
            {benefits.map((b, i) => (
              <div key={i} className="card p-6 border border-gray-100 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm leading-relaxed">{b}</p>
              </div>
            ))}
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
            {centres.map((c) => (
              <div key={c.id} className="card p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Building className="w-5 h-5 text-primary-700" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{c.name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {c.location}
                </div>
                <span className="mt-3 inline-block text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                  {c.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
