import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NodalCentreRequestModal({ onClose }) {
  const [formData, setFormData] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pages/nodal-centre-request/sections`);
        if (!res.ok) throw new Error('Failed to load application form');
        const sections = await res.json();
        const formSec = sections.find(s => s.sectionKey === 'formSchema');
        if (formSec && formSec.content?.questions) {
          setQuestions(formSec.content.questions);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();
  }, []);

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id, option, checked) => {
    setFormData(prev => {
      const current = prev[id] || [];
      if (checked) {
        return { ...prev, [id]: [...current, option] };
      } else {
        return { ...prev, [id]: current.filter(o => o !== option) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pages/nodal-centre-request/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Request submission failed. Please try again.');
      
      localStorage.setItem('nodal-centre-requested', 'true');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-snug">Training Registration Form</h3>
            <p className="text-sm text-slate-500 mt-1">Host a Virtual Labs Workshop at your Nodal Centre</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h4>
              <p className="text-slate-500 max-w-md">
                Your application to become a Nodal Centre has been received. Our team will review your details and contact you shortly.
              </p>
              <button onClick={onClose} className="mt-8 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors">Close Window</button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <h4 className="text-lg font-medium text-slate-900 mb-2">Application is currently unavailable.</h4>
              <p className="text-slate-500">The request form has not been configured by the administrator yet.</p>
            </div>
          ) : (
            <form id="nodal-request-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 sm:p-6 mb-6">
                <p className="text-sm text-blue-800 font-semibold mb-4 bg-blue-100/50 inline-block px-3 py-1 rounded-full">
                  (Currently, the training program is available only in India)
                </p>
                
                <p className="text-slate-700 text-sm leading-relaxed mb-6">
                  Virtual lab training will be conducted by the Subject Matter Experts of Amrita Virtual Labs. A nodal centre can propose a tentative schedule for the virtual lab online/offline training.
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-4 border border-blue-50">
                    <h5 className="font-bold text-slate-800 text-sm mb-3">Requirements for online training:</h5>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                      <li>Laptop/Computer with internet connectivity of at least 2 Mbps.</li>
                      <li>Webcam</li>
                      <li>Speakers and Microphone/Headset with mic</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-blue-50">
                    <h5 className="font-bold text-slate-800 text-sm mb-3">Facilitating condition for offline training:</h5>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                      <li>Computer lab facility with an internet connection for the hands-on session (individual computer for each participant).</li>
                      <li>Projector/screen, mike and speakers – For the presentation and demonstration.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {questions.map((q) => (
                <div key={q.id} className="bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm">
                  <label className="block text-sm font-bold text-slate-800 mb-3">
                    {q.text} {q.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {q.type === 'text' || q.type === 'email' || q.type === 'date' || q.type === 'time' ? (
                    <input
                      type={q.type}
                      required={q.required}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-inner"
                      placeholder={`Enter your ${q.type === 'email' ? 'email address' : 'answer'}...`}
                    />
                  ) : q.type === 'textarea' ? (
                    <textarea
                      required={q.required}
                      rows={4}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-inner resize-y"
                      placeholder="Type your answer here..."
                    />
                  ) : q.type === 'select' ? (
                    <select
                      required={q.required}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer shadow-inner"
                    >
                      <option value="">Select an option...</option>
                      {q.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : q.type === 'radio' ? (
                    <div className="space-y-3">
                      {q.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt}
                            required={q.required}
                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'checkbox' ? (
                    <div className="space-y-3">
                      {q.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={opt}
                            onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </form>
          )}
        </div>

        {/* Footer */}
        {!success && questions.length > 0 && !loading && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-between items-center">
            <p className="text-xs text-slate-500 italic max-w-[60%]">
              By submitting this form, you express interest in becoming an official MHRD Nodal Centre.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="nodal-request-form"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-70 transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Request
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
