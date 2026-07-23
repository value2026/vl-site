import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, AlertCircle, Clock, CheckCircle2, 
  ChevronLeft, ChevronRight, Send, AlertTriangle, ArrowLeft 
} from 'lucide-react';
import { api } from '../../utils/api';

export default function DoAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  
  // Quiz taking state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers]             = useState({}); // { qIndex: optionIndex }
  const [submitting, setSubmitting]       = useState(false);
  const [result, setResult]               = useState(null); // { score, maxScore, message }

  // Timer state
  const [timeLeft, setTimeLeft] = useState(null); // seconds remaining

  const fetchAssignment = useCallback(async () => {
    try {
      const res = await api.get(`/assignments/take/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data);
        
        // Calculate remaining seconds
        const end = new Date(data.endTime);
        const now = new Date();
        const diff = Math.floor((end.getTime() - now.getTime()) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);
      } else {
        const data = await res.json();
        setError(data.message || 'Unable to access the exam slot.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      // Auto-submit when time runs out!
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const handleSelectOption = (qIndex, optionIndex) => {
    if (result) return;
    setAnswers(prev => ({
      ...prev,
      [qIndex]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (submitting || result) return;
    
    // If auto-submit is not triggered by 0 time, confirm from student
    if (timeLeft > 0 && !window.confirm('Are you sure you want to submit your answers? This attempt will be locked.')) {
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/assignments/submit/${id}`, { answers });
      if (res.ok) {
        const resData = await res.json();
        setResult(resData);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to submit exam.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const parts = [];
    if (h > 0) parts.push(h.toString().padStart(2, '0'));
    parts.push(m.toString().padStart(2, '0'));
    parts.push(s.toString().padStart(2, '0'));
    return parts.join(':');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-sm">Entering workspace…</p>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center justify-center text-rose-450 mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Exam Not Accessible</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => navigate('/student/assignments')}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            Go back to Assignments
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    // Show Submit Success Screen
    const isReleased = result.score !== null;
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-450 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">Exam Finished!</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">Your attempts have been registered in the academic records.</p>
          </div>

          {isReleased ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-sm mx-auto">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mb-1">Your Score</span>
              <div className="text-white text-4xl font-extrabold flex items-center justify-center gap-1.5">
                {result.score}
                <span className="text-lg text-slate-500 font-normal">/ {result.maxScore}</span>
              </div>
              <span className="text-[10px] text-slate-450 block mt-2">
                Score released immediately.
              </span>
            </div>
          ) : (
            <div className="bg-white/3 border border-white/5 rounded-2xl p-5 max-w-sm mx-auto text-slate-400 text-xs leading-relaxed">
              {result.message}
            </div>
          )}

          <button
            onClick={() => navigate('/student/assignments')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all mt-4"
          >
            Back to Assignments Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = assignment.questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQIndex === assignment.questions.length - 1;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-200">
      {/* Workspace Header */}
      <header className="h-16 border-b border-white/10 bg-slate-900/60 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Your answers will not be saved if you leave this page. Exit?')) {
                navigate('/student/assignments');
              }
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold leading-tight">{assignment.title}</h2>
            <p className="text-[10px] text-slate-500 font-medium">MCQ Exam Workspace</p>
          </div>
        </div>

        {/* Timer Box */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
          timeLeft < 180 
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/25 animate-pulse' 
            : 'bg-white/5 text-blue-400 border-white/10'
        }`}>
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold font-mono tracking-wider">{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 max-w-[1200px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 lg:col-span-1 h-fit">
          <h3 className="text-slate-400 text-xs font-extrabold uppercase tracking-widest mb-4">Question Panel</h3>
          
          <div className="grid grid-cols-5 gap-2.5">
            {assignment.questions.map((_, idx) => {
              const active = currentQIndex === idx;
              const answered = answers[idx] !== undefined;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`h-9 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                      : answered
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-450 hover:bg-blue-500/15'
                        : 'bg-white/3 border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 space-y-2.5 text-xs text-slate-450">
            <div className="flex items-center justify-between">
              <span>Total Questions:</span>
              <span className="font-bold text-white">{assignment.questions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Answered:</span>
              <span className="font-bold text-blue-400">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Remaining:</span>
              <span className="font-bold text-slate-400">{assignment.questions.length - answeredCount}</span>
            </div>
          </div>
        </div>

        {/* Question Workbox */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-slate-900/40 border border-white/10 rounded-3xl p-6 min-h-[400px]">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <span className="text-xs font-bold text-blue-400">Question {currentQIndex + 1} of {assignment.questions.length}</span>
            </div>

            <h1 className="text-white font-extrabold text-base leading-relaxed tracking-tight mb-8">
              {currentQuestion?.questionText}
            </h1>

            {/* Options list */}
            <div className="space-y-3">
              {currentQuestion?.options.map((opt, oIdx) => {
                const selected = answers[currentQIndex] === oIdx;
                return (
                  <div
                    key={oIdx}
                    onClick={() => handleSelectOption(currentQIndex, oIdx)}
                    className={`flex items-center gap-4 px-5 py-4 border rounded-2xl cursor-pointer transition-all duration-200 select-none ${
                      selected
                        ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-inner'
                        : 'bg-white/2 hover:bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-white/10'
                    }`}>
                      {selected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div className="text-xs leading-normal">
                      <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                      {opt}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-8">
            <button
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/15"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Exam <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQIndex(prev => Math.min(assignment.questions.length - 1, prev + 1))}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-755 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
