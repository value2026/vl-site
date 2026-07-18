import { ArrowRight, GraduationCap } from 'lucide-react';

const DEFAULTS = {
  heading: 'PhD Admissions 2026',
  institution: 'Amrita Vishwa Vidyapeetham',
  description: 'Join one of India\'s premier research universities. Fully funded PhD fellowships are available in engineering, biotechnology, physical sciences, and computing. Apply now to collaborate on cutting-edge Virtual Labs initiatives.',
  buttonLabel: 'Apply Now',
  buttonHref: 'https://amrita.edu/admissions',
  imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
};

export default function AdBanner({ sectionTitle, sectionSubtitle, content = {} }) {
  const d = { ...DEFAULTS, ...content };

  return (
    <section className="py-16 bg-gray-50" aria-labelledby="ad-heading">
      <div className="container-custom">
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl overflow-hidden shadow-xl border border-white/10">
          
          {/* Decorative background grid/gradients */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 80% 20%, #f4b400 0%, transparent 40%),
                                radial-gradient(circle at 20% 80%, #2563eb 0%, transparent 40%)`
            }}
          />
          
          <div className="grid lg:grid-cols-5 gap-0 items-center">
            
            {/* Left Content Column */}
            <div className="p-8 sm:p-12 lg:p-16 lg:col-span-3 text-white flex flex-col justify-center relative z-10">
              
              {/* Institution badge */}
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-full px-4.5 py-1.5 mb-6 self-start text-xs font-semibold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                {d.institution}
              </div>

              {/* Main Heading */}
              <h2 
                id="ad-heading"
                className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4"
              >
                {d.heading}
              </h2>

              {/* Description */}
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                {d.description}
              </p>

              {/* CTA button */}
              <a
                href={d.buttonHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base px-7 py-3.5 self-start shadow-lg shadow-secondary-500/15"
              >
                {d.buttonLabel}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Right Image/Banner Column */}
            <div className="lg:col-span-2 h-64 lg:h-full min-h-[320px] relative overflow-hidden">
              <img 
                src={d.imageUrl} 
                alt="Amrita University PhD Admissions" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Inner gradient overlay for transition */}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent pointer-events-none" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
