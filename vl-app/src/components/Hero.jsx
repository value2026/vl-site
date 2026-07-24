import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, FlaskConical, Atom, Landmark, Users, User } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';

const DEFAULTS = {
  badge: '', // Removed in favor of Organized By block
  heading: 'Build Your Future with\nEmerging Technologies\nand Create Impact',
  subheading: 'Explore <strong class="text-white">1,800+ interactive virtual experiments</strong> across engineering, science, and technology disciplines. VALUE @ Amrita empowers students and educators with immersive, hands-on learning experiences—accessible anytime, anywhere.',
  ctaPrimaryLabel: 'Explore Virtual Labs',
  ctaPrimaryHref: '/labs/biotechnology',
  ctaSecondaryLabel: 'Watch Demo',
  ctaSecondaryHref: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  stats: [
    { n: '700+', label: 'Virtual Labs' },
    { n: '1,800+', label: 'Experiments' },
    { n: '14', label: 'Partner IITs/NITs' },
    { n: '5M+', label: 'Students' },
  ],
};

export default function Hero({ content = {} }) {
  const d = { ...DEFAULTS, ...content };
  const stats = d.stats?.length ? d.stats : DEFAULTS.stats;
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="relative">
      <section
        className="relative min-h-[85vh] lg:min-h-[800px] flex items-center overflow-hidden bg-gradient-to-r from-[#901a35] via-[#751228] to-[#390b16]"
        aria-labelledby="hero-heading"
      >
        {/* Floating Icons (Right Side) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 right-16 md:right-24 xl:right-32 animate-float">
            <div className="w-[4.5rem] h-[4.5rem] rounded-2xl border border-[#ebc335]/30 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-lg">
               <FlaskConical className="text-[#ebc335] w-8 h-8 opacity-90"/>
            </div>
          </div>
          <div className="absolute top-52 right-24 md:right-32 xl:right-48 animate-float" style={{ animationDelay: '1s' }}>
             <div className="w-[4.5rem] h-[4.5rem] rounded-2xl border border-blue-400/30 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-lg">
               <Atom className="text-blue-300 w-8 h-8 opacity-90"/>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom relative z-10 w-full flex justify-center mt-8">
          <div className="w-full max-w-5xl">
            {/* Heading */}
            <h1
              id="hero-heading"
              className="font-heading text-4xl sm:text-[3.5rem] lg:text-[4.5rem] font-bold leading-[1.1] mb-8 animate-fade-in-up tracking-tight"
            >
              <span className="text-white block mb-2 font-medium">Build Your Future with</span>
              <span className="text-[#f1c40f] block font-black">Emerging Technologies</span>
              <span className="text-[#f1c40f] block font-black">and Create Impact</span>
            </h1>



            {/* Subheading */}
            <p
              className="text-[17px] sm:text-[1.15rem] text-white/80 leading-relaxed mb-10 max-w-3xl animate-fade-in-up animate-delay-300"
              dangerouslySetInnerHTML={{ __html: d.subheading }}
            />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-5 animate-fade-in-up animate-delay-400 mb-16">
              {(d.ctaPrimaryHref || '#labs-heading').startsWith('#') ? (
                <button 
                  onClick={() => {
                    const id = (d.ctaPrimaryHref || '#labs-heading').substring(1);
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#f1c40f] hover:bg-[#d4ac0d] text-gray-900 font-bold text-[15px] px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5"
                >
                  {d.ctaPrimaryLabel || 'Explore Virtual Labs'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link to={d.ctaPrimaryHref} className="bg-[#f1c40f] hover:bg-[#d4ac0d] text-gray-900 font-bold text-[15px] px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5">
                  {d.ctaPrimaryLabel || 'Explore Virtual Labs'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <button
                onClick={() => setIsVideoOpen(true)}
                className="bg-transparent border border-white/50 hover:bg-white/10 text-white font-bold text-[15px] px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5"
              >
                <PlayCircle className="w-5 h-5" />
                {d.ctaSecondaryLabel || 'Watch Demo'}
              </button>
            </div>

            {/* Removed raw text stats to replace with white card below */}
          </div>
        </div>
      </section>

      {/* Floating Stats Block (White Card) */}
      <div className="container-custom relative z-20 -mt-16 mb-20 animate-fade-in-up animate-delay-400">
        <div className="bg-white rounded-[1.25rem] shadow-[0_15px_50px_rgba(0,0,0,0.12)] py-7 px-6 lg:px-10 border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-slate-100/80">
            {stats.map(({ n, label }, idx) => {
              const iconsList = [Landmark, FlaskConical, Users, User];
              const colorsList = [
                'bg-rose-50 text-[#881326]',
                'bg-[#fff7e6] text-[#334155]',
                'bg-indigo-50 text-indigo-700',
                'bg-emerald-50 text-emerald-700'
              ];
              const Icon = iconsList[idx % iconsList.length];
              const colorClass = colorsList[idx % colorsList.length];

              return (
                <div key={label} className="flex flex-col items-center justify-center text-center lg:px-6">
                  <div className="flex items-center gap-5 w-full justify-center lg:justify-start pl-0 lg:pl-6">
                     <div className={`w-[3.75rem] h-[3.75rem] rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                       <Icon className="w-6 h-6" strokeWidth={1.5} />
                     </div>
                     <div className="text-left">
                       <div className="text-3xl font-black text-[#881326] leading-none mb-1 tracking-tight">{n}</div>
                       <div className="text-[14px] font-bold text-slate-600">{label}</div>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <VideoPlayerModal 
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={d.ctaSecondaryHref}
        videoTitle={d.ctaSecondaryLabel || 'Watch Demo'}
      />
    </div>
  );
}
