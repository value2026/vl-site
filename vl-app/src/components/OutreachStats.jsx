import { useEffect, useRef, useState } from 'react';
import { 
  Building2, Users, Globe, Presentation, GraduationCap, 
  UserCheck, Cpu, Microscope, MapPin, Globe2, Layers, FlaskConical, Sparkles 
} from 'lucide-react';

const DEFAULT_STATS = [
  { value: '236237',    suffix: '',  label: 'Registered Users',       sub: 'On Amrita Virtual Labs',        icon: '👤' },
  { value: '4408490',   suffix: '',  label: 'Unique Visitors',        sub: 'From around the world',         icon: '🌐' },
  { value: '103737',    suffix: '',  label: 'Students Trained',       sub: 'Through outreach programs',     icon: '🎓' },
  { value: '276',       suffix: '',  label: 'Nodal Centres',         sub: 'Across India',                  icon: '🏛️' },
  { value: '2950',      suffix: '',  label: 'Workshops Conducted',    sub: 'Across India',                  icon: '🏫' },
  { value: '69158',     suffix: '',  label: 'Teachers Trained',       sub: 'Empowering educators',          icon: '👩‍🏫' },
  { value: '145',       suffix: '',  label: 'Engineering Colleges',   sub: 'Nodal Centres',                 icon: '⚙️' },
  { value: '131',       suffix: '',  label: 'Arts & Science Colleges',sub: 'Nodal Centres',                 icon: '🔬' },
  { value: '18',        suffix: '',  label: 'States Covered',         sub: 'Pan-India Presence',            icon: '🗺️' },
  { value: '140',       suffix: '+', label: 'Countries Reached',      sub: 'Global Impact',                 icon: '🌍' },
  { value: '257',       suffix: '+', label: 'Total Digital Assets',   sub: '',                              icon: '💾' },
  { value: '495',       suffix: '',  label: 'Total Experiments',      sub: '',                              icon: '⚗️' },
];

const ICON_MAP = {
  '🏛️': Building2,
  '👤': Users,
  '🌐': Globe,
  '🏫': Presentation,
  '🎓': GraduationCap,
  '👩‍🏫': UserCheck,
  '⚙️': Cpu,
  '🔬': Microscope,
  '🗺️': MapPin,
  '🌍': Globe2,
  '💾': Layers,
  '⚗️': FlaskConical,
};

const COLOR_CONFIGS = [
  { gradient: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { gradient: 'from-purple-500 to-indigo-600', bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { gradient: 'from-emerald-500 to-teal-600',  bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { gradient: 'from-indigo-600 to-purple-600', bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  { gradient: 'from-amber-500 to-orange-600',  bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { gradient: 'from-pink-500 to-rose-600',     bg: 'bg-pink-500/10 text-pink-600 border-pink-500/20' },
  { gradient: 'from-cyan-500 to-blue-600',     bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  { gradient: 'from-teal-500 to-emerald-600',  bg: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
  { gradient: 'from-orange-500 to-red-600',    bg: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  { gradient: 'from-sky-500 to-blue-600',      bg: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
  { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  { gradient: 'from-rose-500 to-pink-600',     bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
];

/** Indian number formatting: 4408490 → "44,08,490" */
function formatIndian(num) {
  const str = String(num);
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${grouped},${last3}`;
}

/** Animated counter hook — starts from 0 when visible */
function useCountUp(target, duration = 1800, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const numTarget = parseInt(target, 10);
    if (!numTarget) { setCount(numTarget); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numTarget));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
}

function StatCard({ stat, index, active, isFeatured = false }) {
  const count = useCountUp(stat.value, 1800, active);
  const displayNum = active ? formatIndian(count) : '0';
  const IconComp = ICON_MAP[stat.icon] || Sparkles;
  const color = COLOR_CONFIGS[index % COLOR_CONFIGS.length];

  if (isFeatured) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 lg:p-7 flex flex-col justify-between
                      shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_45px_rgba(59,65,227,0.12)]
                      hover:border-indigo-400/40 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
        {/* Accent top gradient bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${color.gradient}`} />
        
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${color.bg} group-hover:scale-110 transition-transform duration-300`}>
            <IconComp className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/50">
            Key Impact
          </span>
        </div>

        <div>
          <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
            {displayNum}<span className="text-indigo-600">{stat.suffix}</span>
          </div>
          <div className="text-sm font-bold text-slate-800 uppercase tracking-wide leading-snug">
            {stat.label}
          </div>
          {stat.sub && (
            <div className="text-xs text-slate-500 font-medium mt-1 leading-tight">{stat.sub}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 flex flex-col items-start
                    shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]
                    hover:border-indigo-300/50 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex items-center gap-3.5 mb-3 w-full">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${color.bg} group-hover:scale-105 transition-transform duration-300`}>
          <IconComp className="w-5 h-5" />
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          {displayNum}<span className="text-indigo-600">{stat.suffix}</span>
        </div>
      </div>

      <div className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-snug">
        {stat.label}
      </div>

      {stat.sub && (
        <div className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">{stat.sub}</div>
      )}
    </div>
  );
}

export default function OutreachStats({ sectionTitle, sectionSubtitle, content = {} }) {
  const stats    = content.stats?.length ? content.stats : DEFAULT_STATS;
  const heading  = sectionTitle  || 'Outreach & Impact Metrics';
  const subtitle = sectionSubtitle || 'Reaching students, educators, and institutions across India and the world through open-access virtual laboratories.';
  const tag      = content.sectionTag || 'OUR OUTREACH';

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const featuredStats   = stats.slice(0, 4);
  const secondaryStats  = stats.slice(4);

  return (
    <section
      ref={sectionRef}
      className="py-10 md:py-14 bg-white relative overflow-hidden"
      aria-labelledby="outreach-heading"
    >
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="container-custom relative z-10 max-w-[1240px]">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <span className="tag">
            {tag}
          </span>
          <h2 id="outreach-heading" className="section-title mt-2 mb-2">
            {heading}
          </h2>
          {subtitle && (
            <p className="section-subtitle max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Featured Key Metrics (Top 4 Highlight Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          {featuredStats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} active={isVisible} isFeatured={true} />
          ))}
        </div>

        {/* Secondary Metrics Grid (Remaining 8 Cards) */}
        {secondaryStats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {secondaryStats.map((stat, i) => (
              <StatCard key={i + 4} stat={stat} index={i + 4} active={isVisible} isFeatured={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
