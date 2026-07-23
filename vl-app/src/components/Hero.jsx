import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, FlaskConical, Atom, Cpu } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';

const floatingIcons = [
  { Icon: FlaskConical, pos: 'top-16 right-12', delay: '0s', color: 'text-secondary-400' },
  { Icon: Atom,         pos: 'top-40 right-32', delay: '2s', color: 'text-blue-300' },
  { Icon: Cpu,          pos: 'bottom-24 right-16', delay: '1s', color: 'text-green-300' },
];

const DEFAULTS = {
  badge: 'Amrita Vishwa Vidyapeetham · NMEICT Initiative',
  heading: 'Learn Science Without Limits',
  subheading: 'Access <strong class="text-white">1,800+ virtual experiments</strong> across 700 labs from Amrita Vishwa Vidyapeetham and participating institutions — free, anywhere, anytime.',
  ctaPrimaryLabel: 'Explore Labs',
  ctaPrimaryHref: '/labs/biotechnology',
  ctaSecondaryLabel: 'Watch Demo',
  ctaSecondaryHref: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  stats: [
    { n: '700+', label: 'Virtual Labs' },
    { n: '1,800+', label: 'Experiments' },
    { n: '14', label: 'Nodal Centres' },
    { n: '5M+', label: 'Students Reached' },
  ],
};

export default function Hero({ content = {} }) {
  const d = { ...DEFAULTS, ...content };
  const stats = d.stats?.length ? d.stats : DEFAULTS.stats;
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section
      className="relative min-h-screen bg-hero-gradient flex items-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Optional Background Image */}
      {d.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url("${d.backgroundImage}")` }}
        />
      )}

      {/* Dim overlay when background image is present to keep white text readable */}
      {d.backgroundImage && (
        <div className="absolute inset-0 bg-slate-950/60" />
      )}

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #f4b400 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, #2563eb 0%, transparent 50%)`
        }} />
      </div>

      {/* Floating grid lines */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, pos, delay, color }) => (
        <div
          key={pos}
          className={`absolute ${pos} animate-float hidden lg:block`}
          style={{ animationDelay: delay }}
        >
          <div className="glass rounded-2xl p-4">
            <Icon className={`w-8 h-8 ${color} opacity-80`} />
          </div>
        </div>
      ))}

      <div className="container-custom relative z-10 py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          {d.badge && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">{d.badge}</span>
            </div>
          )}

          {/* Heading */}
          <h1
            id="hero-heading"
            className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up"
          >
            {d.heading.includes('Without Limits') ? (
              <>
                {d.heading.split('Without Limits')[0]}
                <span className="gradient-text">Without Limits</span>
              </>
            ) : d.heading}
          </h1>

          <p
            className="text-xl text-white/75 leading-relaxed mb-10 max-w-2xl animate-fade-in-up animate-delay-200"
            dangerouslySetInnerHTML={{ __html: d.subheading }}
          />

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-300">
            {(d.ctaPrimaryHref || '#labs-heading').startsWith('#') ? (
              <button 
                onClick={() => {
                  const id = (d.ctaPrimaryHref || '#labs-heading').substring(1);
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary text-base px-8 py-4"
              >
                {d.ctaPrimaryLabel || 'Explore Labs'}
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <Link to={d.ctaPrimaryHref} className="btn-secondary text-base px-8 py-4">
                {d.ctaPrimaryLabel || 'Explore Labs'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setIsVideoOpen(true)}
              className="btn-outline text-base px-8 py-4 flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              {d.ctaSecondaryLabel || 'Watch Demo'}
            </button>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-8 mt-16 animate-fade-in-up animate-delay-400">
            {stats.map(({ n, label }) => (
              <div key={label} className="text-center sm:text-left">
                <div className="text-3xl font-heading font-bold text-secondary-400">{n}</div>
                <div className="text-sm text-white/60 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="white"/>
        </svg>
      </div>

      {/* Video Modal Player */}
      <VideoPlayerModal 
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={d.ctaSecondaryHref}
        videoTitle={d.ctaSecondaryLabel || 'Watch Demo'}
      />
    </section>
  );
}
