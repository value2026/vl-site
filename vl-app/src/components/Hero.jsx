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
        className="relative min-h-[85vh] lg:min-h-[800px] flex items-center overflow-hidden bg-hero-gradient"
        aria-labelledby="hero-heading"
      >
        {/* Floating Icons (Right Side) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 right-16 md:right-24 xl:right-32 animate-float">
            <div className="w-[4.5rem] h-[4.5rem] rounded-2xl border border-cyan-400/30 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-lg">
               <FlaskConical className="text-cyan-400 w-8 h-8 opacity-90"/>
            </div>
          </div>
          <div className="absolute top-52 right-24 md:right-32 xl:right-48 animate-float" style={{ animationDelay: '1s' }}>
             <div className="w-[4.5rem] h-[4.5rem] rounded-2xl border border-indigo-400/30 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-lg">
               <Atom className="text-indigo-300 w-8 h-8 opacity-90"/>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom relative z-10 w-full flex justify-center mt-8">
          <div className="w-full max-w-5xl">
            {/* Heading */}
            <h1
              id="hero-heading"
              className="font-heading text-4xl sm:text-[3rem] lg:text-[4rem] font-extrabold leading-[1.15] mb-6 animate-fade-in-up text-white tracking-tight"
            >
              Build Your Future with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-sm">Emerging Technologies</span> <br />
              and Create Impact.
            </h1>



            {/* Subheading */}
            <p
              className="text-[1.1rem] sm:text-[1.25rem] text-white/90 leading-relaxed mb-10 max-w-3xl animate-fade-in-up animate-delay-300 font-medium drop-shadow-sm"
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
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-[16px] px-9 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  {d.ctaPrimaryLabel || 'Explore Virtual Labs'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <Link to={d.ctaPrimaryHref} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-[16px] px-9 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  {d.ctaPrimaryLabel || 'Explore Virtual Labs'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <button
                onClick={() => setIsVideoOpen(true)}
                className="bg-white/5 backdrop-blur-sm border-2 border-white/40 hover:bg-white/20 text-white font-extrabold text-[16px] px-9 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
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
                'bg-[#F5F7FA] text-[#7A1632]',
                'bg-[#F5F7FA] text-[#2563EB]',
                'bg-[#F5F7FA] text-[#10B981]',
                'bg-[#F5F7FA] text-[#F4B400]'
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
                       <div className="text-3xl font-black text-[#0F172A] leading-none mb-1 tracking-tight">{n}</div>
                       <div className="text-[14px] font-bold text-[#64748B]">{label}</div>
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
