import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, FlaskConical, LayoutGrid, ShieldCheck, BadgeCheck, Activity, Microscope, Atom, Laptop, Cpu, HeartPulse } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const ICONS = {
  'Computer Science': Laptop,
  'Physical Sciences': FlaskConical,
  'Electronics & Communications': Cpu,
  'Biological Sciences': HeartPulse,
};

export default function LabCategories({ sectionTitle, sectionSubtitle, content = {} }) {
  const heading  = sectionTitle || 'Explore by Discipline';
  const subtitle = sectionSubtitle || 'From quantum physics to molecular biology — our labs span every branch of science and engineering.';
  const tag      = content.sectionTag || 'LAB CATEGORIES';

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // For the exact UI match, we might want to split the heading if it contains "by Discipline" to color it blue.
  const renderHeading = (text) => {
    // If it's the exact string, we color the second part
    if (text === 'Explore by Discipline') {
      return (
        <>
          <span className="text-[#0B1021]">Explore </span>
          <span className="text-[#3B41E3]">by Discipline</span>
        </>
      );
    }
    return <span className="text-[#0B1021]">{text}</span>;
  };

  return (
    <section id="lab-categories" className="relative pt-10 pb-16 overflow-hidden bg-[#FAFBFF] scroll-mt-20">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-[-5%] opacity-10 pointer-events-none">
        <Atom className="w-[400px] h-[400px] text-blue-600" strokeWidth={0.5} />
      </div>
      <div className="absolute top-20 right-[-2%] opacity-10 pointer-events-none">
        <Microscope className="w-[350px] h-[350px] text-blue-600" strokeWidth={0.5} />
      </div>
      
      {/* Dot patterns */}
      <div className="absolute bottom-20 left-10 opacity-20 pointer-events-none">
         <div className="grid grid-cols-4 gap-3">
            {[...Array(16)].map((_, i) => <div key={i} className="w-1 h-1 bg-blue-400 rounded-full"></div>)}
         </div>
      </div>
      <div className="absolute bottom-40 right-10 opacity-20 pointer-events-none">
         <div className="grid grid-cols-4 gap-3">
            {[...Array(16)].map((_, i) => <div key={i} className="w-1 h-1 bg-blue-400 rounded-full"></div>)}
         </div>
      </div>

      <div className="container-custom relative z-10 max-w-[1200px]">
        
        {/* Section Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] px-5 py-2.5 rounded-full shadow-sm mb-6">
            <FlaskConical className="w-4 h-4 text-[#5D64F5]" />
            <span className="text-[#5D64F5] text-xs font-bold tracking-widest uppercase">{tag}</span>
          </div>
          <h2 className="text-4xl md:text-[2.75rem] font-extrabold mb-5 tracking-tight">
            {renderHeading(heading)}
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#3B41E3] animate-spin" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-10">
            {subjects.map((subject) => {
              const IconComp = ICONS[subject.title] || Atom;
              
              // Define distinct colors for the cards
              const isComputerScience = subject.title.includes('Computer');
              const gradient = isComputerScience 
                ? 'from-[#6B21A8] to-[#3B82F6]' // Purple to Blue
                : 'from-[#0EA5E9] to-[#2563EB]'; // Cyan to Blue

              return (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  state={{ fromHome: true }}
                  className="relative w-full max-w-[420px] sm:w-[calc(50%-20px)] lg:w-[calc(50%-20px)] bg-white rounded-[2rem] p-10 border border-[#E2E8F0] shadow-[0_15px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_70px_rgba(59,65,227,0.1)] hover:-translate-y-2 transition-all duration-300 group overflow-hidden flex flex-col h-[420px]"
                >
                  {/* Faint wavy top background - simple css shape */}
                  <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-[#F4F7FF] to-transparent rounded-t-[2rem] opacity-70"></div>
                  
                  {/* Top Right Grid Icon */}
                  <div className="absolute top-8 right-8">
                    <LayoutGrid className="w-6 h-6 text-[#94A3B8]" strokeWidth={1.5} />
                  </div>

                  {/* Icon */}
                  <div className={`relative w-[72px] h-[72px] rounded-full bg-gradient-to-b ${gradient} flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.1)] mb-10 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComp className="w-8 h-8 text-white" />
                  </div>

                  {/* Title & Tags */}
                  <div className="relative">
                    <h3 className="font-heading text-[28px] font-extrabold text-[#0F172A] mb-3 leading-tight group-hover:text-[#3B41E3] transition-colors">
                      {subject.title}
                    </h3>
                    <div className="text-[11px] font-bold text-[#5D64F5] tracking-widest uppercase mb-3">
                      INTERACTIVE • SIMULATIONS
                    </div>
                    <div className="w-10 h-0.5 bg-[#5D64F5] opacity-50 mb-6"></div>
                  </div>

                  {/* Description */}
                  <p className="relative text-[#64748B] text-[16px] leading-relaxed flex-1 line-clamp-3 font-medium">
                    {subject.description || 'Explore programming, algorithms, data structures, and computer networking.'}
                  </p>

                  {/* Button */}
                  <div className="relative mt-auto">
                    <div className="inline-flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-full px-6 py-2.5 text-[14px] font-bold text-[#5D64F5] group-hover:bg-[#F4F7FF] group-hover:border-[#C7D2FE] transition-colors">
                      View Laboratories
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Bottom decorative dots inside card */}
                  <div className="absolute bottom-10 right-10 opacity-[0.07] pointer-events-none">
                     <div className="grid grid-cols-4 gap-2">
                        {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-[#0F172A] rounded-full"></div>)}
                     </div>
                  </div>
                  <div className="absolute bottom-10 left-10 opacity-[0.05] pointer-events-none">
                     <div className="grid grid-cols-3 gap-2">
                        {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-[#0F172A] rounded-full"></div>)}
                     </div>
                  </div>

                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom Features Row */}
        <div className="mt-16 flex flex-wrap justify-center gap-10 lg:gap-24 relative">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <div className="text-[13px] font-extrabold text-[#0F172A] mb-0.5">Trusted & Secure</div>
              <div className="text-[12px] font-medium text-[#64748B]">Safe learning environment</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <div className="text-[13px] font-extrabold text-[#0F172A] mb-0.5">Expert Designed</div>
              <div className="text-[12px] font-medium text-[#64748B]">By academic experts</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#F97316]" />
            </div>
            <div>
              <div className="text-[13px] font-extrabold text-[#0F172A] mb-0.5">Hands-on Learning</div>
              <div className="text-[12px] font-medium text-[#64748B]">Interactive & engaging</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
