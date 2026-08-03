import { useState } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';
import { trackEvent, trackError, EVENTS } from '../../utils/analytics';
import { useEffect } from 'react';

export default function QuizBlock({ experimentId, experimentName, userId, quizType, questions = [] }) {
  const [answers, setAnswers] = useState({}); // { [questionIndex]: 'a' | 'b' ... }
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

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
    <div className="space-y-6">
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400 flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const selected = answers[qIdx];
          const isCorrect = selected === q.correctAnswer;
          
          return (
            <div 
              key={qIdx} 
              className={`relative overflow-hidden shadow-sm rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                submitted 
                  ? isCorrect 
                    ? 'border border-emerald-200 border-l-[6px] border-l-emerald-500 bg-emerald-50/60' 
                    : 'border border-rose-200 border-l-[6px] border-l-rose-500 bg-rose-50/60'
                  : 'border border-slate-200 border-l-[6px] border-l-blue-600 bg-slate-50/60 hover:bg-slate-50 hover:shadow-md'
              }`}
            >
              <div className="flex gap-4 items-start mb-6">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-extrabold text-white shadow-md ${
                  submitted 
                    ? isCorrect ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-rose-500 to-rose-600'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                }`}>
                  {qIdx + 1}
                </span>
                <h3 className="text-slate-800 font-bold text-lg leading-relaxed flex-1 mt-1">
                  {q.question}
                </h3>
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 gap-3.5">
                {Object.entries(q.answers).map(([key, val]) => {
                  const isSelected = selected === key;
                  const showCorrect = submitted && key === q.correctAnswer;
                  const showIncorrect = submitted && isSelected && !isCorrect;

                  let btnStyle = 'border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 text-slate-700';
                  if (isSelected) {
                    btnStyle = 'border-blue-500 bg-blue-50/80 text-blue-900 ring-1 ring-blue-500 shadow-md scale-[1.01]';
                  }
                  if (showCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500 shadow-md scale-[1.01]';
                  }
                  if (showIncorrect) {
                    btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500 shadow-md scale-[1.01]';
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, key)}
                      className={`group w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left text-[15px] font-semibold transition-all duration-200 ${btnStyle} disabled:cursor-default disabled:hover:-translate-y-0 disabled:hover:scale-100`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center border text-[11px] font-extrabold shadow-sm transition-colors ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : showCorrect
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : showIncorrect
                              ? 'border-rose-600 bg-rose-600 text-white'
                              : 'border-slate-200 text-slate-500 bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700'
                      }`}>
                        {key.toUpperCase()}
                      </span>
                      <span className="flex-1 leading-normal">{val}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation block */}
              {submitted && q.explanations && q.explanations[selected] && (
                <div className={`mt-5 p-4 rounded-xl border text-sm leading-relaxed shadow-sm ${
                  isCorrect 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="font-bold mb-1.5 flex items-center gap-1.5">
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: q.explanations[selected] }} className="opacity-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions / Results */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-6 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-blue-100 shadow-sm rounded-2xl mt-8 relative overflow-hidden">
        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 w-full">
          {!submitted ? (
          <>
            <p className="text-gray-500 text-sm font-medium">
              Complete all questions to view explanations and submit scores.
            </p>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              Submit Answers
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-lg shadow-sm">
                {score}/{questions.length}
              </div>
              <div>
                <h4 className="text-gray-900 font-bold text-lg">
                  🎉 Quiz Completed!
                </h4>
                <p className="text-gray-500 text-sm">
                  You scored {Math.round((score / questions.length) * 100)}%
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-sm text-slate-700 font-bold transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Retake Test
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
