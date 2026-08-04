import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, FlaskConical, Atom, Landmark, Users, Clock, BarChart2, Layers } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';

const DEFAULTS = {
  heading: 'Build Your Future with\n*Emerging Technologies*\nand Create Impact.',
  subheading: 'Access 1,800+ virtual experiments across 700 labs from IITs, NITs, and leading institutions — free, anywhere, anytime.',
  ctaPrimaryLabel: 'Explore Labs',
  ctaPrimaryHref: '/labs',
  ctaSecondaryLabel: 'Watch Demo',
  ctaSecondaryHref: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  stats: [
    { n: '37', label: 'Total Labs', icon: Landmark, color: 'text-rose-400' },
    { n: '340', label: 'Experiments', icon: FlaskConical, color: 'text-blue-400' },
    { n: '2 Lakh+', label: 'Registered Users', icon: Users, color: 'text-emerald-400' },
  ],
};

export default function Hero({ sectionTitle, sectionSubtitle, content = {}, allSections = [] }) {
  const d = { ...DEFAULTS, ...content };
  
  // Force the 3rd stat to show "2 Lakh+" if the DB still has the old hardcoded number
  if (d.stats && d.stats[2] && d.stats[2].n === '2,36,237') {
    d.stats = [...d.stats];
    d.stats[2] = { ...d.stats[2], n: '2 Lakh+' };
  }

  const heading = content.heading || sectionTitle || d.heading;
  const subheading = content.subheading || sectionSubtitle || d.subheading;
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Extract featured_simulation section content from allSections
  const fsSection = allSections.find(s => s.sectionKey === 'featured_simulation');
  const fsContent = fsSection?.content || {};
  
  const FS_DEFAULTS = {
    tag: 'COMPUTER SCIENCE',
    category: 'Computer Science',
    title: 'Expectation Value Calculation in Quantum Systems',
    description: 'Calculate expectation values of observables for various parameterized quantum state vectors.',
    institution: 'Amrita Vishwa Vidyapeetham',
    duration: '10 min',
    difficulty: 'Intermediate',
    experiments: 1,
    href: '/simulations/quantum-expectation',
    imageUrl: '/quantum-core.jpg',
  };

  const sim = { ...FS_DEFAULTS, ...fsContent };
  
  // Ensure fallback is used if DB returned empty strings for these fields
  sim.title = sim.title || FS_DEFAULTS.title;
  sim.description = sim.description || FS_DEFAULTS.description;
  sim.imageUrl = sim.imageUrl || FS_DEFAULTS.imageUrl;
  sim.tag = sim.tag || FS_DEFAULTS.tag;
  sim.institution = sim.institution || FS_DEFAULTS.institution;

  // Retroactive fix: rewrite legacy student/plural routes to clean public route format
  if (sim.href) {
    sim.href = sim.href
      .replace('/student/experiments/', '/experiment/')
      .replace('/student/experiment/', '/experiment/');
  }

  return (
    <div className="relative bg-[#0B0B1E] overflow-hidden">
      <section className="relative min-h-[85vh] lg:min-h-[800px] flex items-center pt-24 pb-40">
        <div className="container-custom relative z-10 w-full max-w-[1500px] flex flex-col xl:flex-row items-center justify-between gap-16 xl:gap-8 mx-auto">
          
          {/* Left Column (Hero Content) */}
          <div className="w-full xl:w-[55%] relative flex items-start">
            
            {/* Floating Icons (Left Side) */}
            <div className="hidden sm:flex flex-col gap-6 mr-8 mt-12 relative z-0">
               <div className="w-12 h-12 rounded-xl border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center">
                 <FlaskConical className="text-cyan-400 w-6 h-6" />
               </div>
               <div className="w-12 h-12 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-center">
                 <Atom className="text-purple-400 w-6 h-6" />
               </div>
            </div>

            <div className="flex-1">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] mb-6 text-white tracking-tight">
                {heading.split('\n').map((line, lineIdx) => (
                  <span key={lineIdx} className="block">
                    {line.split(/\*(.*?)\*/g).map((part, partIdx) => (
                      partIdx % 2 === 1 ? (
                        <span key={partIdx} className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                          {part}
                        </span>
                      ) : (
                        <span key={partIdx}>{part}</span>
                      )
                    ))}
                  </span>
                ))}
              </h1>

              <div 
                className="text-[1.1rem] sm:text-[1.2rem] text-slate-300 leading-relaxed mb-10 max-w-2xl font-medium"
                dangerouslySetInnerHTML={{ __html: subheading }}
              />

              <div className="flex flex-col sm:flex-row gap-5 mb-14">
                <Link to={d.ctaPrimaryHref} className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-bold text-[15px] px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                  {d.ctaPrimaryLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button onClick={() => setIsVideoOpen(true)} className="bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold text-[15px] px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                  <PlayCircle className="w-5 h-5" />
                  {d.ctaSecondaryLabel}
                </button>
              </div>

              {/* Stats Block (Dark Card) */}
              <div className="bg-[#13132B] border border-white/10 rounded-2xl py-6 px-8 inline-block w-full max-w-2xl shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:divide-x divide-white/10">
                  {d.stats.map((stat, idx) => {
                    const fallback = DEFAULTS.stats[idx] || {};
                    const Icon = typeof stat.icon === 'function' || typeof stat.icon === 'object' ? stat.icon : fallback.icon || Landmark;
                    const color = stat.color || fallback.color || 'text-cyan-400';
                    
                    return (
                      <div key={idx} className="flex items-center justify-center gap-4 w-full">
                         <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 flex-shrink-0`}>
                           <Icon className={`w-6 h-6 ${color}`} strokeWidth={1.5} />
                         </div>
                         <div className="text-left">
                           <div className="text-2xl font-black text-white leading-none mb-1 tracking-tight">{stat.n}</div>
                           <div className="text-[12px] font-medium text-slate-400">{stat.label}</div>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Featured Simulation Card) */}
          <div className="w-full xl:w-[45%] flex justify-center xl:justify-end">
            <div className="bg-[#121127] border border-[#2A2944] rounded-[32px] p-8 lg:p-10 shadow-2xl w-full max-w-[650px] flex flex-col md:flex-row gap-8 relative z-20">
              
              <div className="flex-1 flex flex-col items-start justify-center">
                <div className="bg-[#2D1F49] text-[#A78BFA] text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full mb-6">
                  {sim.tag || 'FEATURED SIMULATION'}
                </div>
                <h3 className="font-heading text-2xl lg:text-[28px] font-bold text-white mb-4 leading-tight">
                  {sim.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {sim.description}
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                  <div className="bg-[#1B1A3A] border border-[#2A2944] rounded-lg px-3 py-2 flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-300 font-medium">{sim.institution}</span>
                  </div>
                  <div className="bg-[#1B1A3A] border border-[#2A2944] rounded-lg px-3 py-2 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-300 font-medium">{sim.duration}</span>
                  </div>
                  <div className="bg-[#1B1A3A] border border-[#2A2944] rounded-lg px-3 py-2 flex items-center gap-2">
                    <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-300 font-medium">{sim.difficulty}</span>
                  </div>
                  <div className="bg-[#1B1A3A] border border-[#2A2944] rounded-lg px-3 py-2 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-300 font-medium">{sim.experiments} experiments</span>
                  </div>
                </div>

                <Link to={sim.href} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                  Try Simulation <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="w-full md:w-[260px] flex flex-col justify-center pt-4">
                {sim.imageUrl && (
                  <div className="relative w-full aspect-square flex items-center justify-center">
                    <img src={sim.imageUrl} alt={sim.title} className="w-full h-full object-cover rounded-xl drop-shadow-xl" />
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Decorative white bottom curve to match screenshot */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px] rotate-180">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FAFBFF"></path>
        </svg>
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
