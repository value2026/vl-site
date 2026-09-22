import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, PlayCircle, FlaskConical, Atom, Landmark, Clock, 
  BarChart2, Layers, Users, GraduationCap, Sparkles, BookOpen, Building2
} from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';
import { api } from '../utils/api';

const DEFAULTS = {
  heading: 'Build Your Future with\n*Emerging Technologies*\nand Create Impact.',
  subheading: 'Access 1,800+ virtual experiments across 700 labs from IITs, NITs, and leading institutions — free, anywhere, anytime.',
  ctaPrimaryLabel: 'Explore Labs',
  ctaPrimaryHref: '/labs',
  ctaSecondaryLabel: 'Watch Demo',
  ctaSecondaryHref: 'https://www.youtube.com/watch?v=IwxOpEUXm6A',
  stats: [
    { n: '37', label: 'Total Labs', icon: 'landmark', color: 'rose' },
    { n: '340', label: 'Experiments', icon: 'flask', color: 'blue' },
    { n: '2 Lakh+', label: 'Registered Users', icon: 'users', color: 'emerald' },
  ],
};

function getStatColor(color, index) {
  const c = (color || '').toLowerCase();
  if (c === 'rose' || c === 'red' || c === 'pink' || (!c && index === 0)) {
    return {
      bg: 'bg-[#241324]',
      border: 'border-[#F43F5E]/30',
      text: 'text-[#F43F5E]',
    };
  }
  if (c === 'blue' || c === 'cyan' || c === 'sky' || (!c && index === 1)) {
    return {
      bg: 'bg-[#101D35]',
      border: 'border-[#38BDF8]/30',
      text: 'text-[#38BDF8]',
    };
  }
  if (c === 'green' || c === 'emerald' || c === 'teal' || (!c && index === 2)) {
    return {
      bg: 'bg-[#0E2422]',
      border: 'border-[#34D399]/30',
      text: 'text-[#34D399]',
    };
  }
  if (c === 'purple' || c === 'violet') {
    return {
      bg: 'bg-[#221435]',
      border: 'border-[#A855F7]/30',
      text: 'text-[#C084FC]',
    };
  }
  if (c === 'amber' || c === 'orange' || c === 'yellow') {
    return {
      bg: 'bg-[#2A1C10]',
      border: 'border-[#F59E0B]/30',
      text: 'text-[#FBBF24]',
    };
  }
  return {
    bg: 'bg-[#181A38]',
    border: 'border-white/10',
    text: 'text-blue-400',
  };
}

function getStatIcon(iconName, label = '', index = 0) {
  const name = (iconName || '').toLowerCase();
  const lbl = (label || '').toLowerCase();

  if (name.includes('land') || name.includes('bank') || name.includes('building') || name.includes('lab') || lbl.includes('lab')) {
    return Landmark;
  }
  if (name.includes('flask') || name.includes('exp') || name.includes('sci') || lbl.includes('exp')) {
    return FlaskConical;
  }
  if (name.includes('user') || name.includes('people') || name.includes('student') || lbl.includes('user') || lbl.includes('student')) {
    return Users;
  }
  if (name.includes('atom')) return Atom;
  if (name.includes('grad') || name.includes('cap') || name.includes('teach')) return GraduationCap;
  if (name.includes('book')) return BookOpen;
  if (name.includes('layer') || name.includes('asset')) return Layers;

  if (index === 0) return Landmark;
  if (index === 1) return FlaskConical;
  if (index === 2) return Users;
  return Sparkles;
}

export default function Hero({ sectionTitle, sectionSubtitle, content = {}, allSections = [] }) {
  const d = { ...DEFAULTS, ...content };
  
  const heading = content.heading || sectionTitle || d.heading;
  const subheading = content.subheading || sectionSubtitle || d.subheading;
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [dynamicSims, setDynamicSims] = useState([]);

  // Extract featured_simulation section content from allSections
  const fsSection = allSections.find(s => s.sectionKey === 'featured_simulation');
  const fsContent = fsSection?.content || {};

  // Fetch real database experiments dynamically if no custom simulations are configured in section content
  useEffect(() => {
    const hasConfigured = (content.simulations && content.simulations.length > 0) || (fsContent.simulations && fsContent.simulations.length > 0);
    if (!hasConfigured) {
      const fetchTopExperiments = async () => {
        try {
          const res = await api.get('/experiments');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const mapped = data.slice(0, 3).map(exp => ({
                id: exp.id,
                tag: (exp.lab?.subject?.title || exp.lab?.title || 'SCIENCE').toUpperCase(),
                category: exp.lab?.title || 'Virtual Lab',
                title: exp.title,
                description: exp.description || 'Interactive virtual simulation for hands-on learning.',
                institution: 'Amrita Vishwa Vidyapeetham',
                duration: exp.duration || '15 min',
                difficulty: exp.difficulty || 'Intermediate',
                experiments: 1,
                href: `/experiment/${exp.id}`,
                imageUrl: exp.coverPic || exp.lab?.coverPic || (import.meta.env.BASE_URL + 'quantum-core.jpg'),
              }));
              setDynamicSims(mapped);
            }
          }
        } catch (err) {
          console.error('Error fetching dynamic experiments for Hero:', err);
        }
      };
      fetchTopExperiments();
    }
  }, [content.simulations, fsContent.simulations]);

  // Resolve list of simulations dynamically from DB content or dynamic DB fetch
  const rawSimList = (content.simulations && content.simulations.length > 0)
    ? content.simulations
    : (fsContent.simulations && fsContent.simulations.length > 0)
      ? fsContent.simulations
      : (content.title || fsContent.title)
        ? [{
            tag: content.tag || fsContent.tag || 'SCIENCE',
            title: content.title || fsContent.title || 'Virtual Simulation',
            description: content.description || fsContent.description || 'Interactive virtual lab simulation.',
            institution: content.institution || fsContent.institution || 'Amrita Vishwa Vidyapeetham',
            duration: content.duration || fsContent.duration || '15 min',
            difficulty: content.difficulty || fsContent.difficulty || 'Intermediate',
            experiments: content.experiments || fsContent.experiments || 1,
            href: content.href || fsContent.href || '/labs',
            imageUrl: content.imageUrl || fsContent.imageUrl || (import.meta.env.BASE_URL + 'quantum-core.jpg'),
          }]
        : dynamicSims;

  const simulations = rawSimList.map(sim => {
    let href = sim.href || '/labs';
    if (href) {
      href = href.replace('/student/experiments/', '/experiment/').replace('/student/experiment/', '/experiment/');
    }
    let img = sim.imageUrl || (import.meta.env.BASE_URL + 'quantum-core.jpg');
    if (img && img.startsWith('/') && !img.startsWith('http') && !img.startsWith(import.meta.env.BASE_URL)) {
      img = import.meta.env.BASE_URL + img.slice(1);
    }
    return { ...sim, href, imageUrl: img };
  });

  const [activeSimIdx, setActiveSimIdx] = useState(0);

  // Auto rotate simulations every 5 seconds
  useEffect(() => {
    if (simulations.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSimIdx((prev) => (prev + 1) % simulations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [simulations.length]);

  const statsList = (Array.isArray(content.stats) && content.stats.length > 0)
    ? content.stats
    : (d.stats || []);

  const currentSim = simulations[activeSimIdx] || simulations[0] || {};

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

              <div className="flex flex-col sm:flex-row gap-5">
                <button 
                  onClick={() => {
                    const el = document.getElementById('lab-categories');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = d.ctaPrimaryHref;
                    }
                  }} 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-bold text-[15px] px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {d.ctaPrimaryLabel}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setIsVideoOpen(true)} className="bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold text-[15px] px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                  <PlayCircle className="w-5 h-5" />
                  {d.ctaSecondaryLabel}
                </button>
              </div>

              {/* Stats Bar */}
              {statsList && statsList.length > 0 && (
                <div className="mt-8 sm:mt-10 w-full max-w-[560px] bg-[#121127]/90 border border-[#282744] rounded-2xl sm:rounded-3xl p-4 sm:px-6 sm:py-4.5 flex items-center justify-between shadow-2xl backdrop-blur-md">
                  {statsList.map((stat, idx) => {
                    const IconComponent = getStatIcon(stat.icon, stat.label, idx);
                    const colorStyle = getStatColor(stat.color, idx);
                    return (
                      <div key={idx} className="contents">
                        <div className="flex items-center gap-3 sm:gap-3.5 flex-1 justify-center sm:justify-start min-w-0">
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ${colorStyle.bg} border ${colorStyle.border} ${colorStyle.text} shadow-sm`}>
                            <IconComponent className="w-5 h-5" strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                              {stat.n || stat.value}
                            </div>
                            <div className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight truncate">
                              {stat.label}
                            </div>
                          </div>
                        </div>
                        {idx < statsList.length - 1 && (
                          <div className="w-px h-9 bg-white/10 shrink-0 mx-2 sm:mx-3" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

          {/* Right Column (Featured Simulation Showcase Card with Dots & Carousel) */}
          <div className="w-full xl:w-[45%] flex justify-center xl:justify-end">
            <div className="bg-[#121127] border border-[#2A2944] rounded-[32px] p-8 lg:p-10 shadow-2xl w-full max-w-[650px] flex flex-col justify-between relative z-20 transition-all duration-300">
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 flex flex-col items-start justify-center">
                  <div className="bg-[#2D1F49] text-[#A78BFA] text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full mb-4">
                    {currentSim.tag || 'FEATURED SIMULATION'}
                  </div>
                  <h3 className="font-heading text-xl lg:text-2xl font-bold text-white mb-3 leading-tight transition-all">
                    {currentSim.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {currentSim.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
                    <div className="bg-[#1B1A3A] border border-[#2A2944] rounded-lg px-3 py-2 flex items-center gap-2">
                      <Landmark className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="text-[11px] text-slate-300 font-medium truncate">{currentSim.institution || 'Amrita Vishwa Vidyapeetham'}</span>
                    </div>
                    <div className="bg-[#1B1A3A] border border-[#2A2944] rounded-lg px-3 py-2 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="text-[11px] text-slate-300 font-medium">{currentSim.duration || '10 min'}</span>
                    </div>
                    <div className="bg-[#1B1A3A] border border-[#2A2944] rounded-lg px-3 py-2 flex items-center gap-2">
                      <BarChart2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="text-[11px] text-slate-300 font-medium">{currentSim.difficulty || 'Intermediate'}</span>
                    </div>
                    <div className="bg-[#1B1A3A] border border-[#2A2944] rounded-lg px-3 py-2 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="text-[11px] text-slate-300 font-medium">{currentSim.experiments || 1} experiments</span>
                    </div>
                  </div>

                  <Link 
                    to={currentSim.href || '/labs'} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-purple-500/25 cursor-pointer"
                  >
                    Try Simulation <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="w-full md:w-[220px] flex flex-col justify-center items-center">
                  {currentSim.imageUrl && (
                    <div className="relative w-full aspect-square flex items-center justify-center">
                      <img 
                        src={currentSim.imageUrl} 
                        alt={currentSim.title} 
                        className="w-full h-full object-cover rounded-xl drop-shadow-xl border border-white/5 transition-all duration-300" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Dot Navigation Controls for Switching Simulations */}
              {simulations.length > 1 && (
                <div className="flex items-center justify-center gap-2.5 mt-6 pt-4 border-t border-[#2A2944]/60">
                  {simulations.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSimIdx(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        activeSimIdx === idx
                          ? 'w-7 h-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                          : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/50'
                      }`}
                      title={`Switch to experiment ${idx + 1}`}
                      aria-label={`Go to simulation ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Seamless Decorative bottom curve */}
      <div className="absolute -bottom-[2px] -left-[1px] w-[calc(100%+2px)] overflow-hidden leading-none z-0 pointer-events-none">
        <svg 
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[50px] sm:h-[75px] md:h-[105px] border-0 outline-none"
        >
          <path 
            d="M0,32 C320,10 640,90 960,90 C1200,90 1360,40 1440,25 L1440,120 L0,120 Z" 
            fill="#FFFFFF"
            stroke="none"
          />
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

