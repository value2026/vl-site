import { useState } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';
import { trackEvent, trackError, EVENTS } from '../../utils/analytics';
import { useEffect } from 'react';

export default function QuizBlock({ experimentId, experimentName, userId, quizType, questions = [], onComplete }) {
  const [answers, setAnswers] = useState({}); // { [questionIndex]: 'a' | 'b' ... }
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset quiz state when experimentId or quizType changes
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setErrorMessage('');
  }, [experimentId, quizType]);

  // Track quiz duration when unmounted
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      trackEvent({
        category: 'experiment',
        action: EVENTS.QUIZ_EXITED,
        label: `${experimentId} - ${quizType}`,
        vl_duration: durationSeconds,
        vl_exp_id: experimentId,
        vl_exp_name: experimentName,
        vl_quiz_type: quizType,
        vl_user_id: userId,
        vl_completed: submitted
      });
    };
  }, [experimentId, experimentName, quizType, userId, submitted]);

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
        <HelpCircle className="w-10 h-10 mx-auto mb-3 text-slate-400" />
        No questions available for this quiz.
      </div>
    );
  }

  const handleSelect = (qIdx, optionKey) => {
    if (submitted) return; // lock inputs after submit
    setAnswers({ ...answers, [qIdx]: optionKey });
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    
    // Check all questions answered
    const unanswered = questions.some((_, i) => !answers[i]);
    if (unanswered) {
      setErrorMessage('Please answer all questions before submitting.');
      return;
    }

    // Calculate score
    let calculatedScore = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true);
    setLoading(true);

    if (onComplete) {
      onComplete(calculatedScore, questions.length);
    }

    try {
      const res = await api.post('/analytics/quiz', {
        experimentId,
        quizType,
        score: calculatedScore,
        maxScore: questions.length,
      });
      if (!res.ok) {
        console.warn('Failed to record quiz attempt in analytics.');
      }
      trackEvent({
        category: 'experiment',
        action: EVENTS.QUIZ_COMPLETED,
        label: `${experimentId} - ${quizType}`,
        vl_score_pct: Math.round((calculatedScore / questions.length) * 100),
        vl_exp_id: experimentId,
        vl_exp_name: experimentName,
        vl_quiz_type: quizType,
        vl_score: calculatedScore,
        vl_max_score: questions.length,
        vl_user_id: userId
      });
    } catch (err) {
      console.error('Quiz record error:', err);
      trackError('api_error', 'Failed to record quiz analytics', { experiment_id: experimentId, quiz_type: quizType });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setErrorMessage('');
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-red-400 flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const selected = answers[qIdx];
          const isCorrect = selected === q.correctAnswer;
          
          return (
            <div 
              key={qIdx} 
              className={`relative overflow-hidden shadow-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 border border-slate-200 bg-white ${
                submitted && !isCorrect ? 'border-slate-200/90' : 'hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex gap-3 items-start mb-4">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white shadow-sm flex-shrink-0 mt-0.5 ${
                  submitted 
                    ? isCorrect
                      ? 'bg-emerald-600'
                      : 'bg-rose-600'
                    : 'bg-blue-600'
                }`}>
                  {qIdx + 1}
                </span>
                <h3 className="text-slate-800 font-semibold text-base sm:text-lg leading-snug flex-1">
                  {q.question}
                </h3>
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(q.answers).map(([key, val]) => {
                  const isSelected = selected === key;
                  const showCorrect = submitted && key === q.correctAnswer;
                  const showIncorrect = submitted && isSelected && !isCorrect;

                  let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300 text-slate-700';
                  if (isSelected && !submitted) {
                    btnStyle = 'border-blue-500 bg-blue-50/60 text-blue-900 ring-1 ring-blue-500 shadow-sm';
                  }
                  if (submitted) {
                    if (showCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-500/80 shadow-sm font-semibold';
                    } else if (showIncorrect) {
                      btnStyle = 'border-rose-400 bg-rose-50/80 text-rose-900 ring-1 ring-rose-400/80 shadow-sm font-medium';
                    } else {
                      btnStyle = 'border-slate-200 bg-slate-50/40 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, key)}
                      className={`group w-full flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl border text-left text-sm transition-all duration-200 ${btnStyle} disabled:cursor-default`}
                    >
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center border text-[11px] font-extrabold shadow-xs transition-colors flex-shrink-0 ${
                        submitted
                          ? showCorrect
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : showIncorrect
                              ? 'border-rose-600 bg-rose-600 text-white'
                              : 'border-slate-200 text-slate-400 bg-slate-100'
                          : isSelected 
                            ? 'border-blue-600 bg-blue-600 text-white' 
                            : 'border-slate-200 text-slate-500 bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700'
                      }`}>
                        {key.toUpperCase()}
                      </span>
                      <span className="flex-1 leading-snug">{val}</span>
                      {submitted && showCorrect && (
                        <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                      )}
                      {submitted && showIncorrect && (
                        <span className="w-5 h-5 rounded-full bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation block */}
              {submitted && q.explanations && q.explanations[selected] && (
                <div className="mt-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/90 text-xs sm:text-sm leading-relaxed text-slate-700 shadow-xs">
                  <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                    Explanation
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: q.explanations[selected] }} className="opacity-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions / Results */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-blue-100 shadow-sm rounded-xl sm:rounded-2xl mt-6 relative overflow-hidden">
        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {!submitted ? (
          <>
            <p className="text-gray-500 text-xs sm:text-sm font-medium">
              Complete all questions to view explanations and submit scores.
            </p>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow transition-all"
            >
              Submit Answers
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-base shadow-xs">
                {score}/{questions.length}
              </div>
              <div>
                <h4 className="text-gray-900 font-bold text-base">
                  🎉 Quiz Completed!
                </h4>
                <p className="text-gray-500 text-xs">
                  You scored {Math.round((score / questions.length) * 100)}%
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs sm:text-sm text-slate-700 font-semibold transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retake Test
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
