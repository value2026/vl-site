import { Link } from 'react-router-dom';
import {
  ArrowRight, Clock, BarChart2, BookOpen, Building2, Layers
} from 'lucide-react';

const DEFAULTS = {
  tag: 'Physics',
  category: 'Mechanics',
  title: 'Simple Pendulum Simulation',
  description: 'Explore the physics of oscillatory motion with our interactive pendulum simulation. Adjust parameters like length, mass, and gravity to observe real-time changes.',
  institution: 'Amrita Vishwa Vidyapeetham',
  duration: '45 min',
  difficulty: 'Intermediate',
  experiments: 12,
  href: '/simulations/pendulum',
};

export default function FeaturedSimulation({ content = {} }) {
  const sim = { ...DEFAULTS, ...content };

  // Retroactive fix: rewrite legacy plural routes to matching singular route format
  if (sim.href && sim.href.startsWith('/student/experiments/')) {
    sim.href = sim.href.replace('/student/experiments/', '/student/experiment/');
  }

  return (
    <section className="py-24 bg-white" aria-labelledby="featured-sim-heading">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="tag">Spotlight</span>
          <h2 id="featured-sim-heading" className="section-title mt-4">
            Featured Simulation
          </h2>
          <p className="section-subtitle">
            Hand-picked by our academic council for exceptional learning outcomes.
          </p>
        </div>

        {/* Split card */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl overflow-hidden shadow-card-hover">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left — content */}
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <span className="tag">{sim.tag}</span>
                <span className="text-xs text-gray-400 font-medium">{sim.category}</span>
              </div>

              <h3 className="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-5 leading-tight">
                {sim.title}
              </h3>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {sim.description}
              </p>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-4 mb-10">
                <MetaBadge Icon={Building2} label={sim.institution} />
                <MetaBadge Icon={Clock}     label={sim.duration} />
                <MetaBadge Icon={BarChart2} label={sim.difficulty} />
                <MetaBadge Icon={Layers}    label={`${sim.experiments} experiments`} />
              </div>

              <Link to={sim.href} className="btn-primary self-start text-base">
                Try Simulation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right — visual */}
            <div className={`relative ${sim.imageUrl ? 'p-0 overflow-hidden' : 'bg-hero-gradient p-10 lg:p-14'} flex flex-col items-center justify-center min-h-72 lg:min-h-auto`}>
              {sim.imageUrl ? (
                <img 
                  src={sim.imageUrl} 
                  alt={sim.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                />
              ) : (
                <div className="relative w-full max-w-sm mx-auto">
                  {/* Pendulum visual */}
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-32 bg-white/30 mx-auto rounded-full relative">
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-secondary-400 rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-gray-900 font-bold text-xs">m</span>
                      </div>
                    </div>
                    <div className="mt-10 grid grid-cols-3 gap-4 w-full">
                      {['F = ma', 'p = mv', 'W = Fd'].map((formula) => (
                        <div key={formula} className="glass rounded-xl p-3 text-center">
                          <span className="text-white font-mono text-sm font-bold">{formula}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-secondary-400 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 glass rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-secondary-400" />
                      <span className="text-white text-xs font-medium">{sim.institution}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaBadge({ Icon, label }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-3.5 py-2 shadow-sm border border-gray-100 text-sm text-gray-600 font-medium">
      <Icon className="w-4 h-4 text-primary-700" />
      {label}
    </div>
  );
}
