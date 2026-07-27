import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FlaskConical, Star, Bug, Menu, X, ChevronLeft, CheckCircle, Circle, Loader2, Maximize2, Monitor } from 'lucide-react';
import { api, fileUrl } from '../../utils/api';
import { trackEvent, trackError, EVENTS } from '../../utils/analytics';
import QuizBlock from '../../components/student/QuizBlock';
import { useAuth } from '../../context/AuthContext';

// ── Sidebar sections ─────────────────────────────────────────
const SECTIONS = [
  { id: 'aim',          label: 'Aim' },
  { id: 'theory',       label: 'Theory' },
  { id: 'pretest',      label: 'Pretest' },
  { id: 'procedure',    label: 'Procedure' },
  { id: 'simulation',   label: 'Simulation' },
  { id: 'posttest',     label: 'Posttest' },
  { id: 'references',   label: 'References' },
  { id: 'contributors', label: 'Contributors' },
  { id: 'feedback',     label: 'Feedback' },
];

const DIFFICULTY_STYLE = {
  Beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced:     'bg-rose-50 text-rose-700 border-rose-200',
};



// ── Default Stack Simulation fallback ────────────────────────
function StackSimulation() {
  const MAX = 6;
  const [stack, setStack] = useState([]);
  const [input, setInput] = useState('');
  const [msg,   setMsg]   = useState('');

  const push = () => {
    if (!input.trim()) return;
    if (stack.length >= MAX) { setMsg('⚠️ Stack Overflow! Stack is full.'); return; }
    setStack([...stack, input.trim()]);
    setMsg(`✅ Pushed "${input.trim()}" onto the stack.`);
    setInput('');
  };
  const pop = () => {
    if (stack.length === 0) { setMsg('⚠️ Stack Underflow! Stack is empty.'); return; }
    const val = stack[stack.length - 1];
    setStack(stack.slice(0, -1));
    setMsg(`↩️ Popped "${val}" from the stack.`);
  };
  const peek = () => {
    if (stack.length === 0) { setMsg('Stack is empty.'); return; }
    setMsg(`👁️ Top element: "${stack[stack.length - 1]}"`);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
      <h3 className="text-gray-900 font-bold text-lg mb-6">Stack Simulation</h3>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-2 text-center">Capacity: {MAX} elements</div>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 min-h-64 flex flex-col-reverse gap-2 bg-white">
            {stack.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">Stack is empty</div>
            ) : (
              stack.map((val, i) => (
                <div
                  key={i}
                  className={`relative flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    i === stack.length - 1
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <span>{val}</span>
                  {i === stack.length - 1 && (
                    <span className="text-xs text-blue-200 font-normal">← TOP</span>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
            <span>Size: {stack.length}/{MAX}</span>
            <span>{stack.length === 0 ? 'Empty' : stack.length === MAX ? 'Full' : 'Has space'}</span>
          </div>
        </div>

        <div className="w-full lg:w-56 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Element Value</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && push()}
              placeholder="e.g. 42"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>
          <button onClick={push}  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">Push</button>
          <button onClick={pop}   className="w-full py-2.5 rounded-xl bg-rose-500  hover:bg-rose-600  text-white text-sm font-semibold transition-colors shadow-sm">Pop</button>
          <button onClick={peek}  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors shadow-sm">Peek</button>
          <button onClick={() => { setStack([]); setMsg('Stack cleared.'); }} className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold transition-colors">Reset</button>

          {msg && (
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-700 leading-relaxed">
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Generic Simulation Placeholder ───────────────────────────
function GenericSimulation({ title }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-10 text-center border border-slate-700">
      <div className="text-6xl mb-4">⚗️</div>
      <h3 className="text-white font-bold text-xl mb-2">Interactive Simulation</h3>
      <p className="text-slate-400 text-sm mb-6">
        The interactive simulation for <span className="text-white font-medium">"{title}"</span> is being developed and will be available soon.
      </p>
      <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 text-sm font-medium px-4 py-2 rounded-xl border border-blue-500/30">
        <FlaskConical className="w-4 h-4" />
        Coming Soon
      </div>
    </div>
  );
}

// ── Feedback Form ────────────────────────────────────────────
function FeedbackSection({ onComplete }) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (onComplete) onComplete(rating, comment);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🙏</div>
        <h3 className="text-gray-900 font-bold text-xl mb-2">Thank you for your feedback!</h3>
        <p className="text-gray-500 text-sm">Your response helps us improve Virtual Labs for everyone.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h3 className="text-gray-900 font-bold text-lg mb-6">Rate This Experiment</h3>
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3,4,5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="text-3xl transition-transform hover:scale-110"
          >
            <Star className={`w-8 h-8 transition-colors ${n <= (hovered || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-gray-500 ml-2">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        )}
      </div>
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Comments (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your thoughts about this experiment…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
      >
        Submit Feedback
      </button>
    </div>
  );
}

// ── Main Experiment Page ─────────────────────────────────────
export default function ExperimentPage() {
  const { expId }  = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [active, setActive]         = useState('aim');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trackedEvents, setTrackedEvents] = useState({ simulation: false, pretest: false, posttest: false });

  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [sections, setSections]     = useState({
    aim: null,
    theory: null,
    pretest: [],
    procedure: null,
    posttest: [],
    references: [],
    contributors: [],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const perfStart = performance.now();
      try {
        const expRes = await api.get(`/experiments/${expId}`);
        if (expRes.ok) {
          const expData = await expRes.json();
          setExperiment(expData);
          
          if (expData.contentPath) {
            const docsRes = await api.get(`/experiments/${expId}/docs`);
            if (docsRes.ok) {
              const docsData = await docsRes.json();
              setSections(docsData);
            }
          }
          
          const loadMs = Math.round(performance.now() - perfStart);
          trackEvent({
            category: 'performance',
            action: EVENTS.PERFORMANCE_METRIC,
            metric_name: 'api_load_time_ms',
            value: loadMs,
            experiment_id: expId,
            experiment_name: expData?.title,
            user_id: user?.id
          });
        }
      } catch (err) {
        console.error('Failed to load experiment', err);
        trackError('api_error', 'Failed to load experiment data', { experiment_id: expId });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [expId]);

  const getAnalyticsParams = (status = 'Started') => ({
    vl_exp_id: expId,
    vl_exp_name: experiment?.title,
    vl_sim_name: experiment?.title,
    vl_lab_name: lab?.title ?? undefined,
    vl_institution: user?.org ?? undefined,
    vl_nodal_center: user?.nodalCentreId ?? undefined,
    vl_dept: user?.dept ?? undefined,
    vl_course: user?.course ?? undefined,
    vl_semester: user?.yearSemester ?? undefined,
    vl_role: user?.role ?? undefined,
    vl_user_name: user?.name ?? undefined,
    vl_language: 'en',
    vl_status: status,
    vl_user_id: user?.id ?? undefined
  });

  const [visitId, setVisitId] = useState(null);
  const sessionStartTime = useRef(Date.now());

  // Log active visit on mount
  useEffect(() => {
    if (experiment) {
      const logVisit = async () => {
        try {
          const res = await api.post('/analytics/visit', {
            experimentId: expId,
            device: window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
            browser: navigator.userAgent.toLowerCase().includes('firefox') ? 'firefox' : navigator.userAgent.toLowerCase().includes('safari') && !navigator.userAgent.toLowerCase().includes('chrome') ? 'safari' : 'chrome'
          });
          if (res.ok) {
            const data = await res.json();
            setVisitId(data.id);
          }
        } catch (err) {
          // Silent catch
        }
      };
      logVisit();
    }
  }, [experiment, expId]);

  // Log active tab visits and periodically update duration
  useEffect(() => {
    if (!visitId) return;

    // Log the current tab and the current duration immediately
    if (active) {
      const currentDuration = Math.round((Date.now() - sessionStartTime.current) / 1000);
      api.put(`/analytics/visit/${visitId}`, { tabId: active, duration: currentDuration }).catch(() => {});
    }

    // Periodically update the total duration of this session (every 10s)
    const interval = setInterval(() => {
      const currentDuration = Math.round((Date.now() - sessionStartTime.current) / 1000);
      api.put(`/analytics/visit/${visitId}`, { duration: currentDuration }).catch(() => {});
    }, 10000);

    return () => {
      clearInterval(interval);
      // Try to log the final duration when this effect cleans up (e.g., unmount or tab switch)
      const finalDuration = Math.round((Date.now() - sessionStartTime.current) / 1000);
      api.put(`/analytics/visit/${visitId}`, { duration: finalDuration }).catch(() => {});
    };
  }, [visitId, active]);

  // Listen for custom GA events coming from the simulation iframe via postMessage
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'GA_EVENT') {
        trackEvent({
          category: 'simulation',
          action: e.data.action ? e.data.action.toLowerCase().replace(/\s+/g, '_') : 'unknown_event',
          label: e.data.label || experiment?.title,
          value: e.data.value,
          ...getAnalyticsParams('In Progress'),
          ...(e.data.params || {})
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [experiment, user, expId]);

  const handleFullscreen = () => {
    const elem = document.getElementById('simulation-frame-container');
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  };

  // Math equations rendering (KaTeX)
  useEffect(() => {
    if (window.renderMathInElement) {
      const elements = document.querySelectorAll('.prose');
      elements.forEach(elem => {
        window.renderMathInElement(elem, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      });
    }
  }, [sections, active]);

  // Track simulation exit and duration
  useEffect(() => {
    let startTime;
    if (active === 'simulation') {
      startTime = Date.now();
    }
    return () => {
      if (active === 'simulation' && startTime) {
        const durationSeconds = Math.round((Date.now() - startTime) / 1000);
        trackEvent({
          category: 'experiment',
          action: EVENTS.SIMULATION_EXITED,
          label: experiment?.title,
          duration: durationSeconds,
          ...getAnalyticsParams('Completed')
        });
      }
    };
  }, [active, experiment, expId, user]);



  const handleFeedbackComplete = async (rating, comment) => {
    try {
      await api.post('/analytics/feedback', {
        experimentId: expId,
        rating,
        comment,
      });
      trackEvent({
        category: 'experiment',
        action: EVENTS.EXPERIMENT_COMPLETED,
        label: experiment?.title,
        value: rating,
        experiment_id: expId,
        experiment_name: experiment?.title,
        user_id: user?.id
      });
    } catch (err) {
      console.error(err);
      trackError('api_error', 'Failed to submit feedback', { experiment_id: expId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-gray-900 font-bold text-xl mb-2">Experiment Not Found</h2>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm">← Go Back</button>
        </div>
      </div>
    );
  }

  const lab = experiment.lab;
  const subject = lab?.subject;

  // ── Render section content ──────────────────────────────────
  const renderContent = () => {
    switch (active) {
      case 'aim':
        return (
          <div>
            <SectionHeader title="Aim" />
            {sections.aim ? (
              <div dangerouslySetInnerHTML={{ __html: sections.aim }} className="prose max-w-none text-gray-700" />
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="text-blue-900 text-sm leading-relaxed">{experiment.description || 'No aim described yet.'}</p>
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${DIFFICULTY_STYLE[experiment.difficulty] || 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                {experiment.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full">
                ⏱ {experiment.duration}
              </span>
            </div>
          </div>
        );

      case 'theory':
        return (
          <div>
            <SectionHeader title="Theory" />
            {sections.theory ? (
              <div dangerouslySetInnerHTML={{ __html: sections.theory }} className="prose prose-sm max-w-none text-gray-700" />
            ) : (
              <p className="text-gray-500 italic">Theory content has not been uploaded yet.</p>
            )}
          </div>
        );

      case 'pretest':
        return (
          <div>
            <SectionHeader title="Pretest" subtitle="Answer these questions before starting the simulation to assess your prior knowledge." />
            <QuizBlock 
              experimentId={expId} 
              experimentName={experiment.title}
              userId={user?.id}
              quizType="pretest" 
              questions={sections.pretest?.questions || []} 
            />
          </div>
        );

      case 'procedure':
        return (
          <div>
            <SectionHeader title="Procedure" subtitle="Follow these steps carefully during the simulation." />
            {sections.procedure ? (
              <div dangerouslySetInnerHTML={{ __html: sections.procedure }} className="prose prose-sm max-w-none text-gray-700" />
            ) : (
              <p className="text-gray-500 italic">Procedure steps have not been uploaded yet.</p>
            )}
          </div>
        );

      case 'simulation':
        return (
          <div>
            <SectionHeader title="Simulation" subtitle="Interact with the simulation below. Follow the procedure steps for guidance." />
            {experiment.simulationPath ? (
              <div className="w-full max-w-5xl mx-auto space-y-4">
                {/* Desktop Window Frame Container */}
                <div 
                  id="simulation-frame-container" 
                  className="flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden w-full h-[650px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
                >
                  {/* Browser Header Bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0 select-none">
                    {/* Window Controls (macOS style) */}
                    <div className="flex items-center gap-1.5 w-24">
                      <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                    </div>

                    {/* Address bar */}
                    <div className="bg-slate-950 border border-white/5 px-4 py-1.5 rounded-lg text-[10px] text-slate-400 font-mono tracking-wider w-80 text-center truncate flex items-center justify-center gap-1.5">
                      <Monitor className="w-3 h-3 text-slate-500" />
                      <span>simulation://{experiment.title.toLowerCase().replace(/\s+/g, '-')}.local</span>
                    </div>

                    {/* Full Screen controls */}
                    <div className="flex justify-end w-24">
                      <button 
                        onClick={handleFullscreen}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] text-white font-bold transition-all border border-white/10"
                      >
                        <Maximize2 className="w-3 h-3" /> Full Screen
                      </button>
                    </div>
                  </div>

                  <iframe
                    src={fileUrl(`${experiment.simulationPath}/index.html`)}
                    className="w-full flex-1 border-none bg-[#3CA4AB]"
                    title="Simulation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={(e) => {
                      const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
                      if (measurementId) {
                        e.target.contentWindow.postMessage({ 
                          type: 'INIT_GA', 
                          measurementId,
                          userId: user?.id,
                          experimentId: expId
                        }, '*');
                      }
                    }}
                  />
                </div>
              </div>
            ) : (experiment.id === 'stack-ops' || expId === 'stack-ops') ? (
              <StackSimulation />
            ) : (
              <GenericSimulation title={experiment.title} />
            )}
          </div>
        );

      case 'posttest':
        return (
          <div>
            <SectionHeader title="Posttest" subtitle="Test your understanding after completing the simulation." />
            <QuizBlock 
              experimentId={expId} 
              experimentName={experiment.title}
              userId={user?.id}
              quizType="posttest" 
              questions={sections.posttest?.questions || []} 
            />
          </div>
        );

      case 'references':
        return (
          <div>
            <SectionHeader title="References" />
            {sections.references ? (
              <div dangerouslySetInnerHTML={{ __html: sections.references }} className="prose max-w-none text-gray-700" />
            ) : (
              <p className="text-gray-500 italic">No reference links available.</p>
            )}
          </div>
        );

      case 'contributors':
        return (
          <div>
            <SectionHeader title="Contributors" subtitle="The team who designed and developed this experiment." />
            {sections.contributors ? (
              <div dangerouslySetInnerHTML={{ __html: sections.contributors }} className="prose max-w-none text-gray-700" />
            ) : (
              <p className="text-gray-500 italic">No contributor information uploaded.</p>
            )}
          </div>
        );

      case 'feedback':
        return (
          <div>
            <SectionHeader title="Feedback" subtitle="Help us improve this experiment by sharing your experience." />
            <FeedbackSection onComplete={handleFeedbackComplete} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-3 z-40 shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group" aria-label="VALUE @ Amrita Home">
          <div className="flex items-baseline mt-0.5 ml-1">
            <span className="text-[#1e3a8a] text-base md:text-[1.1rem] font-bold tracking-tight uppercase" style={{ fontFamily: 'Arial, sans-serif' }}>
              VALUE
            </span>
            <span className="text-[#4b5563] text-base md:text-[1.1rem] italic ml-1.5" style={{ fontFamily: 'Georgia, serif' }}>
              @ Amrita
            </span>
          </div>
        </Link>

        <div className="w-px h-5 bg-gray-200 mx-1 hidden md:block" />

        <div className="hidden md:flex items-center gap-1.5 text-xs lg:text-sm text-gray-500 overflow-hidden">
          <Link to="/student" className="hover:text-blue-600 transition-colors flex-shrink-0">Home</Link>
          <span className="text-gray-300">/</span>
          {subject && (
            <>
              <Link to={`/subject/${lab?.subjectId || subject.id}`} className="hover:text-blue-600 transition-colors truncate max-w-[110px] lg:max-w-[140px]">
                {subject.title}
              </Link>
              <span className="text-gray-300">/</span>
            </>
          )}
          {lab && (
            <>
              <Link to={`/lab/${lab.id || experiment.labId}`} className="hover:text-blue-600 transition-colors truncate max-w-[120px] lg:max-w-[160px]">
                {lab.title}
              </Link>
              <span className="text-gray-300">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-[140px] lg:max-w-[200px]">{experiment.title}</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold border border-amber-200 transition-colors">
            <Star className="w-3.5 h-3.5" /> Rate Me
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold border border-red-200 transition-colors">
            <Bug className="w-3.5 h-3.5" /> Report a Bug
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30
          w-44 bg-white border-r border-gray-200 flex-shrink-0
          flex flex-col transition-transform duration-200 ease-in-out
          pt-12 lg:pt-0
        `}>
          <nav className="flex-1 py-3 overflow-y-auto">
            {SECTIONS.map(({ id, label }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => { 
                    const previousTab = active;
                    setActive(id); 
                    setSidebarOpen(false);
                    
                    if (previousTab !== id) {
                      trackEvent({
                        category: 'experiment',
                        action: EVENTS.NAVIGATION_CHANGED,
                        from_tab: previousTab,
                        to_tab: id,
                        ...getAnalyticsParams('In Progress')
                      });
                    }

                    if (id === 'simulation' && !trackedEvents.simulation) {
                      setTrackedEvents(prev => ({ ...prev, simulation: true }));
                      trackEvent({ 
                        category: 'experiment', action: EVENTS.SIMULATION_STARTED, label: experiment?.title,
                        ...getAnalyticsParams('Started')
                      });
                    } else if (id === 'posttest' && !trackedEvents.posttest) {
                      setTrackedEvents(prev => ({ ...prev, posttest: true }));
                      trackEvent({ 
                        category: 'experiment', action: EVENTS.QUIZ_STARTED, label: `${experiment?.title} - Posttest`,
                        quiz_type: 'posttest', ...getAnalyticsParams('Started')
                      });
                    } else if (id === 'pretest' && !trackedEvents.pretest) {
                      setTrackedEvents(prev => ({ ...prev, pretest: true }));
                      trackEvent({ 
                        category: 'experiment', action: EVENTS.QUIZ_STARTED, label: `${experiment?.title} - Pretest`,
                        quiz_type: 'pretest', ...getAnalyticsParams('Started')
                      });
                    }
                  }}
                  className={`w-full text-left px-5 py-3 text-sm transition-all duration-150 relative ${
                    isActive
                      ? 'text-blue-700 font-semibold bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-normal'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-r-full" />
                  )}
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className={`${active === 'simulation' ? 'max-w-7xl' : 'max-w-3xl'} mx-auto px-6 py-8 transition-all duration-300`}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-100">
      <h2 className="text-gray-900 font-bold text-xl">{title}</h2>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
