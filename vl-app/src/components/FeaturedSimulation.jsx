import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Clock, BarChart2, BookOpen, Building2, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULTS = {
  tag: 'COMPUTER SCIENCE',
  category: 'Computer Science',
  title: 'Expectation Value Calculation in Quantum Systems',
  description: 'Calculate expectation values of observables for various parameterized quantum state vectors.',
  institution: 'Amrita Vishwa Vidyapeetham',
  duration: '10 min',
  difficulty: 'Intermediate',
  experiments: 1,
  href: '/simulations/quantum-expectation',
  imageUrl: import.meta.env.BASE_URL + 'quantum-core.jpg',
};

export default function FeaturedSimulation({ sectionTitle, sectionSubtitle, content = {} }) {
  const sim = { ...DEFAULTS, ...content };

  // Ensure empty strings from database fall back to defaults
  sim.title = sim.title || DEFAULTS.title;
  sim.description = sim.description || DEFAULTS.description;
  sim.imageUrl = sim.imageUrl || DEFAULTS.imageUrl;
  sim.tag = sim.tag || DEFAULTS.tag;
  sim.institution = sim.institution || DEFAULTS.institution;
  
  // Format local paths from DB if necessary
  if (sim.imageUrl && sim.imageUrl.startsWith('/') && !sim.imageUrl.startsWith('http') && !sim.imageUrl.startsWith(import.meta.env.BASE_URL)) {
    sim.imageUrl = import.meta.env.BASE_URL + sim.imageUrl.slice(1);
  }

  const heading = sectionTitle || 'Featured Simulation';
  const subtitle = sectionSubtitle || 'Hand-picked by our academic council for exceptional learning outcomes.';
  const { user } = useAuth();
  const navigate = useNavigate();

  // Retroactive fix: rewrite legacy student/plural routes to clean public route format
  if (sim.href) {
    sim.href = sim.href
      .replace('/student/experiments/', '/experiment/')
      .replace('/student/experiment/', '/experiment/');
  }

  // Derive experiment ID from href if possible
  const experimentPath = sim.href?.startsWith('/experiment/')
    ? sim.href
    : null;

  const handleTrySimulation = (e) => {
    e.preventDefault();
    if (!experimentPath) {
      navigate(sim.href || '/labs');
      return;
    }
    // Any user (admin, teacher, student, public visitor) can view experiments directly
    navigate(experimentPath);
  };

  return (
    <section className="py-[50px] bg-[#0B0A10]" aria-labelledby="featured-sim-heading">
      <div className="container-custom">
        {/* Split card */}
        <div className="bg-[#13111C] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 mt-4">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left — content */}
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-[#2A1E4A] text-[#B794F4] text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
                  Featured Simulation
                </span>
              </div>

              <h3 className="font-heading text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                {sim.title}
              </h3>

              <p className="text-[#A0AEC0] text-lg leading-relaxed mb-10">
                {sim.description}
              </p>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-4 mb-10">
                <MetaBadge Icon={Building2} label={sim.institution} />
                <MetaBadge Icon={Clock}     label={sim.duration} />
                <MetaBadge Icon={BarChart2} label={sim.difficulty} />
                <MetaBadge Icon={Layers}    label={`${sim.experiments} experiments`} />
              </div>

              <button onClick={handleTrySimulation} className="bg-[#805AD5] hover:bg-[#9F7AEA] text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 flex items-center gap-3 self-start text-lg shadow-[0_0_20px_rgba(128,90,213,0.4)]">
                Try Simulation
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right — visual */}
            <div className="relative p-10 lg:p-14 flex flex-col items-center justify-center bg-[#0F0D17]">
              <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
                
                {/* Visual: Image or Pendulum */}
                {sim.imageUrl ? (
                  <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-8">
                    <img 
                      src={sim.imageUrl} 
                      alt={sim.title} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                    />
                  </div>
                ) : (
                  <div className="w-1 h-32 bg-white/20 mx-auto rounded-full relative mb-12 mt-8">
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#805AD5] rounded-full shadow-[0_0_15px_rgba(128,90,213,0.6)] flex items-center justify-center">
                      <span className="text-white font-bold text-xs">m</span>
                    </div>
                  </div>
                )}

                {/* Formulas - Always show below image/pendulum */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  {['F = ma', 'p = mv', 'W = Fd'].map((formula) => (
                    <div key={formula} className="bg-[#1A1625] border border-white/5 rounded-xl p-4 text-center shadow-inner">
                      <span className="text-gray-300 font-mono text-sm font-medium">{formula}</span>
                    </div>
                  ))}
                </div>

                {/* Dots */}
                <div className="mt-8 flex gap-3">
                  <div className="w-2.5 h-2.5 bg-[#ECC94B] rounded-full shadow-[0_0_8px_rgba(236,201,75,0.6)]"></div>
                  <div className="w-2.5 h-2.5 bg-white/10 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-white/10 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-white/10 rounded-full"></div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaBadge({ Icon, label }) {
  return (
    <div className="flex items-center gap-2.5 bg-[#1A1625] rounded-xl px-4 py-2.5 border border-white/5 text-sm text-gray-300 font-medium">
      <Icon className="w-4 h-4 text-[#B794F4]" />
      {label}
    </div>
  );
}
