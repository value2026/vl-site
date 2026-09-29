import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowRight, FlaskConical, Loader2, Search, Shield, BarChart, Users, Layers, Atom } from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import { api, getSlug, fileUrl } from '../../utils/api';

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
    } else {
      result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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

      <main className="pt-14 pb-16">
        {/* Subject hero */}
        <div className={`bg-gradient-to-br ${subject.gradient || 'from-[#1e1b4b] to-[#3730a3]'} px-6 pt-10 pb-20 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 50%, white 0%, transparent 50%)' }} />
          
          {/* Right side decoration graphic */}
          <div className="hidden lg:flex absolute right-10 lg:right-20 top-1/2 -translate-y-1/2 w-[340px] h-[240px] items-center justify-center pointer-events-none">
             <div className="absolute w-52 h-52 bg-white/5 rounded-3xl transform rotate-12 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl">
               <span className="text-white/20 text-7xl font-mono">{'</>'}</span>
             </div>
             <div className="absolute w-32 h-32 bg-white/10 rounded-2xl transform -rotate-12 translate-x-16 translate-y-16 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
               <span className="text-white/30 text-5xl font-mono">{'{ }'}</span>
             </div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10 w-full lg:w-2/3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                {subject.icon}
              </div>
              <div>
                <h1 className="text-white text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">{subject.title}</h1>
                <p className="text-white/80 text-sm sm:text-base max-w-xl leading-relaxed mb-4">{subject.description}</p>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                    <FlaskConical className="w-3.5 h-3.5" /> {labs.length} Labs
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                    <FlaskConical className="w-3.5 h-3.5" /> {totalExperiments} Experiments
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Row */}
        <div className="max-w-7xl mx-auto px-6 relative z-20 -mt-8 mb-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-3">
            <div className="flex items-center gap-3.5 flex-1">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0"><Layers className="w-4 h-4" /></div>
               <div>
                 <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Interactive Learning</h4>
                 <p className="text-[11px] text-gray-500 leading-snug">Engaging simulations and hands-on experiments</p>
               </div>
            </div>
            <div className="w-px h-9 bg-gray-100 hidden md:block" />
            <div className="flex items-center gap-3.5 flex-1">
               <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0"><Shield className="w-4 h-4" /></div>
               <div>
                 <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Safe Environment</h4>
                 <p className="text-[11px] text-gray-500 leading-snug">Practice and learn without real-world risks</p>
               </div>
            </div>
            <div className="w-px h-9 bg-gray-100 hidden md:block" />
            <div className="flex items-center gap-3.5 flex-1">
               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><BarChart className="w-4 h-4" /></div>
               <div>
                 <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Track Progress</h4>
                 <p className="text-[11px] text-gray-500 leading-snug">Monitor your learning and results</p>
               </div>
            </div>
            <div className="w-px h-9 bg-gray-100 hidden md:block" />
            <div className="flex items-center gap-3.5 flex-1">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4" /></div>
               <div>
                 <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Expert Designed</h4>
                 <p className="text-[11px] text-gray-500 leading-snug">Curated by academic experts at Amrita</p>
               </div>
            </div>
          </div>
        </div>

        {/* Labs grid */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <div>
              <h2 className="text-[#0f172a] font-extrabold text-xl sm:text-2xl mb-1 tracking-tight">Available Labs</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Select a lab to explore the experiments</p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
               <div className="relative flex-1 sm:flex-none">
                 <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search labs..." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full sm:w-60 pl-9 pr-3.5 py-2 border border-gray-200 rounded-full text-xs sm:text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
                 />
               </div>
               <select 
                 value={sortOption}
                 onChange={e => setSortOption(e.target.value)}
                 className="border border-gray-200 rounded-full px-3.5 py-2 text-xs sm:text-sm text-gray-700 outline-none focus:border-indigo-500 appearance-none bg-white shadow-sm font-medium cursor-pointer"
               >
                 <option>Sort by: Default</option>
                 <option>Name (A-Z)</option>
                 <option>Name (Z-A)</option>
               </select>
            </div>
          </div>

          {filteredLabs.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl px-6 shadow-sm">
              <div className="text-5xl mb-3 opacity-80">🔬</div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">No labs found</h3>
              <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto">We couldn't find any labs matching your search. Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLabs.map((lab) => (
                <Link
                  key={lab.id}
                  to={`/lab/${lab.id}`}
                  className="group bg-white border border-gray-200/90 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="w-full aspect-[2.1/1] bg-gradient-to-br from-indigo-50/60 to-blue-50/60 relative overflow-hidden flex items-center justify-center flex-shrink-0">
                    {lab.coverPic ? (
                      <img 
                        src={fileUrl(lab.coverPic)} 
                        alt={lab.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center relative">
                         <div className="w-11 h-11 rounded-xl bg-white/85 backdrop-blur-sm border border-white shadow-sm flex items-center justify-center text-2xl z-10 transition-transform duration-300 group-hover:scale-110">
                           {lab.icon || <Atom className="w-5 h-5 text-indigo-600" />}
                         </div>
                         <span className="text-6xl absolute font-mono font-bold text-blue-900/5 -rotate-12 select-none">{'</>'}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex items-start gap-2 mb-1">
                        {lab.icon && (
                          <span className="text-base flex-shrink-0 leading-tight select-none">{lab.icon}</span>
                        )}
                        <h3 className="text-gray-900 font-bold text-[15px] leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">{lab.title}</h3>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{lab.description || 'Explore interactive simulations and experiments for this lab.'}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-auto">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                        <FlaskConical className="w-3.5 h-3.5 text-gray-400" /> {lab._count?.experiments || 0} Experiments
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 group-hover:gap-1.5 transition-all">
                        Open Lab <ArrowRight className="w-3.5 h-3.5" />
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
