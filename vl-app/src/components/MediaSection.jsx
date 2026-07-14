import { useEffect, useRef, useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { stats } from '../data/simulations';

function useCounter(target, duration = 2000, triggered = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, triggered]);

  return value;
}

function StatCounter({ label, value, suffix }) {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef(null);
  const count = useCounter(value, 2000, triggered);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center px-6 py-4">
      <div className="font-heading text-5xl font-extrabold text-white mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/60 text-sm font-medium uppercase tracking-widest">{label}</div>
    </div>
  );
}

export default function MediaSection() {
  return (
    <section className="py-24 bg-white" aria-labelledby="media-heading">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="tag">Media</span>
          <h2 id="media-heading" className="section-title mt-4">
            The Making of Virtual Labs
          </h2>
          <p className="section-subtitle">
            See how India's top institutions are transforming science education.
          </p>
        </div>

        {/* Video embed area */}
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-card-hover group cursor-pointer mb-20">
          <div className="bg-hero-gradient aspect-video flex items-center justify-center">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 40%, #f4b400 0%, transparent 40%),
                                  radial-gradient(circle at 70% 60%, #2563eb 0%, transparent 40%)`
              }}
            />
            <div className="relative flex flex-col items-center gap-4">
              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch Virtual Labs documentary"
                className="group/btn"
              >
                <div className="w-20 h-20 bg-white/20 hover:bg-white/30 border-2 border-white/50 rounded-full flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110">
                  <PlayCircle className="w-10 h-10 text-white" />
                </div>
              </a>
              <p className="text-white/80 font-medium text-lg">
                Virtual Labs: Transforming STEM Education in India
              </p>
              <p className="text-white/50 text-sm">18:32 · Official Documentary</p>
            </div>
          </div>
        </div>

        {/* Stats banner */}
        <div className="bg-hero-gradient rounded-3xl overflow-hidden">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {stats.map((stat) => (
              <StatCounter key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
