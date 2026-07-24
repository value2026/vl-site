import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WorkshopRegistrationModal({ workshop, onClose }) {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const questions = Array.isArray(workshop?.formSchema) ? workshop.formSchema : [];
  
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pages/workshop-${workshop.id}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData })
      });

      if (!res.ok) throw new Error('Registration failed. Please try again.');
      
      localStorage.setItem(`registered-workshop-${workshop.id}`, 'true');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-snug">{workshop.title}</h3>
            <p className="text-sm text-gray-500 mt-1">Workshop Registration</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h4>
              <p className="text-gray-500 max-w-md">
                Your registration for <strong>{workshop.title}</strong> has been submitted. A copy of your responses will be emailed to the address you provided.
              </p>
              <button onClick={onClose} className="mt-8 btn-primary px-6 py-2">Close</button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Registration is currently unavailable.</h4>
              <p className="text-gray-500">There is no registration form configured for this workshop.</p>
            </div>
          ) : (
            <form id="workshop-registration-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {questions.map((q) => (
                <div key={q.id} className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    {q.text} {q.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {q.type === 'text' || q.type === 'email' || q.type === 'date' || q.type === 'time' ? (
                    <input
                      type={q.type}
                      required={q.required}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                      placeholder={`Enter your ${q.type === 'email' ? 'email' : 'answer'}...`}
                    />
                  ) : q.type === 'select' ? (
                    <select
                      required={q.required}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                    >
                      <option value="">Select an option...</option>
                      {q.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : q.type === 'radio' ? (
                    <div className="space-y-3">
                      {q.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt}
                            required={q.required}
                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                            className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'checkbox' ? (
                    <div className="space-y-3">
                      {q.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            value={opt}
                            onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
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
        {!success && questions.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
            <p className="text-xs text-gray-500 italic max-w-[60%]">
              By submitting this form, you agree to the Virtual Labs training terms and conditions.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="workshop-registration-form"
                disabled={submitting}
                className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm shadow-lg shadow-primary-500/20 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Registration
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
