import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowRight, FlaskConical, Loader2, Search, Shield, BarChart, Users, Layers, Atom } from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import { api, getSlug } from '../../utils/api';

export default function SubjectPage() {
  const { subjectId } = useParams();
  const location = useLocation();
  const [subject, setSubject] = useState(null);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Default');

  const fromHome = location.state?.fromHome;
  const backLink = fromHome ? '/' : '/student';
  const backText = fromHome ? '← Back to Home' : '← Back to Subjects';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [subRes, labsRes] = await Promise.all([
          api.get('/subjects'),
          api.get(`/labs?subjectId=${subjectId}`),
        ]);
        if (subRes.ok && labsRes.ok) {
          const subjects = await subRes.json();
          const currentSub = subjects.find((s) => s.id === subjectId);
          setSubject(currentSub);
          setLabs(await labsRes.json());
        }
      } catch (err) {
        console.error('Failed to load subject page data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subjectId]);

  const filteredLabs = useMemo(() => {
    let result = labs.filter(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (sortOption === 'Name (A-Z)') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'Name (Z-A)') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }
    return result;
  }, [labs, searchQuery, sortOption]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-gray-900 font-bold text-xl mb-2">Subject Not Found</h2>
          <Link to={backLink} className="text-blue-600 hover:underline text-sm">{backText}</Link>
        </div>
      </div>
    );
  }

  const totalExperiments = labs.reduce((sum, l) => sum + (l._count?.experiments || 0), 0);



  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav breadcrumb={[{ label: subject.title }]} />

      <main className="pt-14 pb-20">
        {/* Subject hero */}
        <div className={`bg-gradient-to-br ${subject.gradient || 'from-[#1e1b4b] to-[#3730a3]'} px-6 pt-8 pb-24 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 50%, white 0%, transparent 50%)' }} />
          
          {/* Right side decoration graphic */}
          <div className="hidden lg:flex absolute right-10 lg:right-20 top-1/2 -translate-y-1/2 w-[400px] h-[300px] items-center justify-center pointer-events-none">
             <div className="absolute w-64 h-64 bg-white/5 rounded-3xl transform rotate-12 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl">
               <span className="text-white/20 text-8xl font-mono">{'</>'}</span>
             </div>
             <div className="absolute w-40 h-40 bg-white/10 rounded-2xl transform -rotate-12 translate-x-20 translate-y-20 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
               <span className="text-white/30 text-6xl font-mono">{'{ }'}</span>
             </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-start">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10 w-full lg:w-2/3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/10 rounded-3xl flex items-center justify-center text-5xl shadow-2xl flex-shrink-0">
                {subject.icon}
              </div>
              <div>
                <h1 className="text-white text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">{subject.title}</h1>
                <p className="text-white/80 text-lg max-w-xl leading-relaxed mb-5">{subject.description}</p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/20">
                    <FlaskConical className="w-4 h-4" /> {labs.length} Labs
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/20">
                    <FlaskConical className="w-4 h-4" /> {totalExperiments} Experiments
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Row */}
        <div className="max-w-6xl mx-auto px-6 relative z-20 -mt-10 mb-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
            <div className="flex items-start gap-4 flex-1">
               <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0"><Layers className="w-5 h-5" /></div>
               <div>
                 <h4 className="text-sm font-bold text-gray-900 mb-0.5">Interactive Learning</h4>
                 <p className="text-xs text-gray-500 leading-snug">Engaging simulations and hands-on experiments</p>
               </div>
            </div>
            <div className="w-px h-12 bg-gray-100 hidden md:block" />
            <div className="flex items-start gap-4 flex-1">
               <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5" /></div>
               <div>
                 <h4 className="text-sm font-bold text-gray-900 mb-0.5">Safe Environment</h4>
                 <p className="text-xs text-gray-500 leading-snug">Practice and learn without any real-world risks</p>
               </div>
            </div>
            <div className="w-px h-12 bg-gray-100 hidden md:block" />
            <div className="flex items-start gap-4 flex-1">
               <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><BarChart className="w-5 h-5" /></div>
               <div>
                 <h4 className="text-sm font-bold text-gray-900 mb-0.5">Track Progress</h4>
                 <p className="text-xs text-gray-500 leading-snug">Monitor your learning and experiment results</p>
               </div>
            </div>
            <div className="w-px h-12 bg-gray-100 hidden md:block" />
            <div className="flex items-start gap-4 flex-1">
               <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5" /></div>
               <div>
                 <h4 className="text-sm font-bold text-gray-900 mb-0.5">Expert Designed</h4>
                 <p className="text-xs text-gray-500 leading-snug">Curated by academic experts at Amrita</p>
               </div>
            </div>
          </div>
        </div>

        {/* Labs grid */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-5">
            <div>
              <h2 className="text-[#0f172a] font-extrabold text-2xl mb-1.5 tracking-tight">Available Labs</h2>
              <p className="text-gray-500 text-sm">Select a lab to explore the experiments</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="relative flex-1 sm:flex-none">
                 <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search labs..." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500 transition-colors shadow-sm" 
                 />
               </div>
               <select 
                 value={sortOption}
                 onChange={e => setSortOption(e.target.value)}
                 className="border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 appearance-none bg-white shadow-sm font-medium cursor-pointer"
               >
                 <option>Sort by: Default</option>
                 <option>Name (A-Z)</option>
                 <option>Name (Z-A)</option>
               </select>
            </div>
          </div>

          {filteredLabs.length === 0 ? (
            <div className="text-center py-24 bg-white border border-gray-200 rounded-3xl px-8 shadow-sm">
              <div className="text-6xl mb-5 opacity-80">🔬</div>
              <h3 className="text-gray-900 font-bold text-xl mb-2">No labs found</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">We couldn't find any labs matching your search. Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLabs.map((lab) => (
                <Link
                  key={lab.id}
                  to={`/lab/${lab.id}`}
                  className="group bg-white border border-gray-200 rounded-[1.5rem] overflow-hidden hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row h-full sm:h-[240px]"
                >
                  <div className="w-full sm:w-[42%] bg-gradient-to-br from-indigo-50 to-blue-50 relative overflow-hidden flex-shrink-0">
                    {lab.coverPic ? (
                      <img src={lab.coverPic} alt={lab.title} className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                         <span className="text-7xl mb-2">{lab.icon}</span>
                         <span className="text-8xl absolute font-mono font-bold text-blue-900/5 -rotate-12">{'</>'}</span>
                      </div>
                    )}
                    {/* Curved overlay effect */}
                    <svg className="absolute right-[-1px] top-0 bottom-0 h-full hidden sm:block text-white w-12" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M100,0 L100,100 L0,100 C50,100 50,0 0,0 Z" />
                    </svg>
                  </div>
                  <div className="p-7 sm:p-8 flex-1 flex flex-col relative z-10 bg-white">
                    <div className="absolute top-6 right-6 w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-indigo-100">
                      {lab.icon || <Atom className="w-6 h-6" />}
                    </div>
                    <h3 className="text-gray-900 font-extrabold text-[1.35rem] leading-tight mb-3 pr-14">{lab.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">{lab.description}</p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-auto">
                      <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-gray-500">
                        <FlaskConical className="w-4 h-4 text-gray-400" /> {lab._count?.experiments || 0} Experiments
                      </span>
                      <span className="flex items-center gap-1.5 text-[0.85rem] font-bold text-blue-600 group-hover:text-blue-700 group-hover:gap-2.5 transition-all">
                        Open Lab <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
