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
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center text-slate-400 text-sm">
        <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-500" />
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
              className={`bg-slate-900/50 border border-white/5 rounded-2xl p-5 transition-all duration-300 ${
                submitted 
                  ? isCorrect 
                    ? 'border-emerald-500/25 bg-emerald-500/[0.02]' 
                    : 'border-red-500/25 bg-red-500/[0.02]'
                  : ''
              }`}
            >
              <div className="flex gap-3 items-start mb-4">
                <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 mt-0.5">
                  {qIdx + 1}
                </span>
                <h3 className="text-white font-semibold text-sm leading-relaxed flex-1">
                  {q.question}
                </h3>
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(q.answers).map(([key, val]) => {
                  const isSelected = selected === key;
                  const showCorrect = submitted && key === q.correctAnswer;
                  const showIncorrect = submitted && isSelected && !isCorrect;

                  let btnStyle = 'border-white/5 bg-white/3 hover:bg-white/5 text-slate-300';
                  if (isSelected) {
                    btnStyle = 'border-blue-500/50 bg-blue-500/10 text-white';
                  }
                  if (showCorrect) {
                    btnStyle = 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200';
                  }
                  if (showIncorrect) {
                    btnStyle = 'border-red-500/50 bg-red-500/20 text-red-200';
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs font-medium transition-all ${btnStyle} disabled:cursor-default`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                        isSelected 
                          ? 'border-blue-400 bg-blue-400 text-slate-950' 
                          : showCorrect
                            ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                            : showIncorrect
                              ? 'border-red-400 bg-red-400 text-slate-950'
                              : 'border-white/20 text-slate-400'
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
                <div className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isCorrect 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-350' 
                    : 'bg-red-500/10 border-red-500/20 text-red-350'
                }`}>
                  <div className="font-bold mb-1">{isCorrect ? '✓ Correct Answer' : '✗ Incorrect Answer'}</div>
                  <div dangerouslySetInnerHTML={{ __html: q.explanations[selected] }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions / Results */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-900 border border-white/5 rounded-2xl mt-6">
        {!submitted ? (
          <>
            <p className="text-slate-400 text-xs">
              Complete all questions to view explanations and submit scores.
            </p>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all"
            >
              Submit Answers
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                (score / questions.length) >= 0.5 ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {score}/{questions.length}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">
                  {(score / questions.length) >= 0.5 ? '🎉 You Passed!' : '😢 Try Again'}
                </h4>
                <p className="text-slate-400 text-xs">
                  Your completion rate is {Math.round((score / questions.length) * 100)}%
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retake Test
            </button>
          </>
        )}
      </div>
    </div>
  );
}
