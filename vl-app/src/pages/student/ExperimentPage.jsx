import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FlaskConical, Star, Bug, Menu, X, ChevronLeft, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { api, fileUrl } from '../../utils/api';

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

function Quiz({ questions = [], type, onComplete }) {
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? questions.filter((q, idx) => answers[idx] === q.correct).length
    : null;

  const handleSubmit = () => {
    const finalScore = questions.filter((q, idx) => answers[idx] === q.correct).length;
    setSubmitted(true);
    if (onComplete) onComplete(finalScore);
  };

  if (questions.length === 0) {
    return <p className="text-gray-500 italic">No quiz questions available.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-gray-900 font-bold text-lg capitalize">{type}</h3>
        {submitted && (
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${score === questions.length ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {score}/{questions.length} correct
          </span>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-gray-900 font-medium text-sm mb-4">
              <span className="text-gray-400 mr-2">Q{qi + 1}.</span>{q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrect  = submitted && oi === q.correct;
                const isWrong    = submitted && isSelected && oi !== q.correct;
                return (
                  <button
                    key={oi}
                    onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}
                    disabled={submitted}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                      isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : isWrong ? 'bg-red-50 border-red-400 text-red-800'
                      : isSelected ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <span className={`w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      isCorrect ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isWrong  ? 'border-red-500 bg-red-500 text-white'
                      : isSelected ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                    }`}>
                      {isSelected || isCorrect ? String.fromCharCode(65 + oi) : ''}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
        >
          Submit Answers
        </button>
      ) : (
        <div className={`mt-6 p-4 rounded-xl border ${score === questions.length ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className={`font-semibold text-sm ${score === questions.length ? 'text-emerald-800' : 'text-amber-800'}`}>
            {score === questions.length ? '🎉 Perfect score! Excellent work.' : `You got ${score} out of ${questions.length}. Review the highlighted answers above.`}
          </p>
        </div>
      )}
    </div>
  );
}

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
  const [active, setActive]         = useState('aim');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      try {
        const expRes = await api.get(`/experiments/${expId}`);
        if (expRes.ok) {
          const expData = await expRes.json();
          setExperiment(expData);
          
          if (expData.contentPath) {
            const secNames = ['aim', 'theory', 'pretest', 'procedure', 'posttest', 'references', 'contributors'];
            const results = await Promise.allSettled(
              secNames.map(async (name) => {
                const res = await api.get(`/experiments/${expId}/content/${name}`);
                if (res.ok) {
                  if (['pretest', 'posttest', 'references', 'contributors'].includes(name)) {
                    return { name, value: await res.json() };
                  } else {
                    return { name, value: await res.text() };
                  }
                }
                throw new Error('Not found');
              })
            );
            
            const loadedSecs = {};
            results.forEach((r) => {
              if (r.status === 'fulfilled') {
                loadedSecs[r.value.name] = r.value.value;
              }
            });
            setSections((prev) => ({ ...prev, ...loadedSecs }));
          }
        }
      } catch (err) {
        console.error('Failed to load experiment', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [expId]);

  // Log active visit on mount
  useEffect(() => {
    if (experiment) {
      const logVisit = async () => {
        try {
          await api.post('/analytics/visit', {
            experimentId: expId,
            device: window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
            browser: navigator.userAgent.toLowerCase().includes('firefox') ? 'firefox' : navigator.userAgent.toLowerCase().includes('safari') && !navigator.userAgent.toLowerCase().includes('chrome') ? 'safari' : 'chrome'
          });
        } catch (err) {
          // Silent catch
        }
      };
      logVisit();
    }
  }, [experiment, expId]);

  const handleQuizComplete = async (score, maxScore, type) => {
    try {
      await api.post('/analytics/quiz', {
        experimentId: expId,
        quizType: type,
        score,
        maxScore,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackComplete = async (rating, comment) => {
    try {
      await api.post('/analytics/feedback', {
        experimentId: expId,
        rating,
        comment,
      });
    } catch (err) {
      console.error(err);
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
            <Quiz questions={sections.pretest} type="pretest" onComplete={(score) => handleQuizComplete(score, sections.pretest.length, 'pretest')} />
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
              <div className="w-full h-[600px] border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <iframe
                  src={fileUrl(`${experiment.simulationPath}/index.html`)}
                  className="w-full h-full border-none"
                  title="Simulation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
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
            <Quiz questions={sections.posttest} type="posttest" onComplete={(score) => handleQuizComplete(score, sections.posttest.length, 'posttest')} />
          </div>
        );

      case 'references':
        return (
          <div>
            <SectionHeader title="References" />
            {sections.references && sections.references.length > 0 ? (
              <div className="space-y-3">
                {sections.references.map((ref, i) => (
                  <a
                    key={i}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg flex-shrink-0">
                      {ref.type === 'book' ? '📖' : ref.type === 'video' ? '🎥' : '🌐'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 text-sm font-medium group-hover:text-blue-700 transition-colors truncate">{ref.title}</div>
                      <div className="text-gray-400 text-xs capitalize mt-0.5">{ref.type}</div>
                    </div>
                    <span className="text-gray-300 group-hover:text-blue-400 transition-colors text-lg">↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No reference links available.</p>
            )}
          </div>
        );

      case 'contributors':
        return (
          <div>
            <SectionHeader title="Contributors" subtitle="The team who designed and developed this experiment." />
            {sections.contributors && sections.contributors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sections.contributors.map((c, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {c.name ? c.name[0] : '?'}
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold text-sm">{c.name}</div>
                      <div className="text-blue-600 text-xs font-medium">{c.role}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{c.institution}</div>
                    </div>
                  </div>
                ))}
              </div>
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

        <Link to="/student" className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-800 hidden sm:block">VL</span>
        </Link>

        <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs transition-colors hidden sm:flex"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> {lab?.title || 'Back'}
        </button>

        <div className="flex-1 min-w-0 text-center">
          <h1 className="text-gray-900 font-semibold text-sm truncate">{experiment.title}</h1>
        </div>

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
                  onClick={() => { setActive(id); setSidebarOpen(false); }}
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
          <div className="max-w-3xl mx-auto px-6 py-8">
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
