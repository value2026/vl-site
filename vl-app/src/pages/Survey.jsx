import { useState } from 'react';
import { Loader2, ArrowRight, X, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

async function fetchSurveySections(slug) {
  const res = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/pages/${slug}/sections`);
  if (!res.ok) throw new Error(`Failed to fetch ${slug} sections`);
  return res.json();
}

export default function Survey({ slug }) {
  const [showForm, setShowForm] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const { data: sections, isLoading } = useQuery({
    queryKey: [`${slug}-sections`],
    queryFn: () => fetchSurveySections(slug),
    staleTime: 60_000,
    retry: 1,
  });

  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/pages/${slug}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Submission failed');
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit survey:', err);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  let pageTitle = slug === 'student-survey' ? 'Student Survey' : 'Faculty Survey';
  let pageSubtitle = 'Share your experience to help us improve.';
  let cardHeading = 'Ready to share your feedback?';
  let cardText = 'Please click the button below to open the survey form directly on this page. Your responses are highly valuable to us.';
  let cardButtonLabel = 'Open Survey Form';
  let formUrl = '';
  let customQuestions = [];

  if (sections) {
    const heroSec = sections.find(s => s.sectionKey === 'hero');
    if (heroSec?.content) {
      if (heroSec.content.heading) pageTitle = heroSec.content.heading;
      if (heroSec.content.subheading) pageSubtitle = heroSec.content.subheading;
      if (heroSec.content.cardHeading) cardHeading = heroSec.content.cardHeading;
      if (heroSec.content.cardText) cardText = heroSec.content.cardText;
      if (heroSec.content.cardButtonLabel) cardButtonLabel = heroSec.content.cardButtonLabel;
      if (heroSec.content.formUrl) formUrl = heroSec.content.formUrl;
      if (heroSec.content.questions && Array.isArray(heroSec.content.questions)) {
        customQuestions = heroSec.content.questions;
      }
    }
  }

  let finalFormUrl = formUrl;
  if (finalFormUrl.includes('docs.google.com/forms')) {
    if (finalFormUrl.includes('?')) {
      if (!finalFormUrl.includes('embedded=true')) {
        finalFormUrl += '&embedded=true';
      }
    } else {
      finalFormUrl += '?embedded=true';
    }
    // Also replace /edit with /viewform if accidentally provided
    finalFormUrl = finalFormUrl.replace(/\/edit[^\/]*$/, '/viewform?embedded=true');
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
            Feedback
          </span>
          <h1 className="font-heading text-5xl font-extrabold text-white mb-6">
            {pageTitle}
          </h1>
          <div 
            className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10 [&>p]:mb-4 last:[&>p]:mb-0"
            dangerouslySetInnerHTML={{ __html: pageSubtitle }}
          />
        </div>
      </section>

      {/* Survey Content */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (customQuestions.length > 0 || formUrl) ? (
            <div className={`card p-8 border border-gray-100 shadow-lg relative transition-all duration-500 ${!showForm ? 'text-center' : 'text-left'}`}>
              {!showForm ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{cardHeading}</h2>
                  <p className="text-gray-600 mb-8 max-w-xl mx-auto whitespace-pre-wrap">
                    {cardText}
                  </p>
                  <button 
                    onClick={() => { setShowForm(true); setIsIframeLoading(true); setIsSubmitted(false); }}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {cardButtonLabel} <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className={`relative w-full animate-fade-in ${customQuestions.length > 0 ? 'min-h-[500px]' : 'h-[1200px]'}`}>
                  <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-900">{cardHeading}</h2>
                    <div className="flex items-center gap-4">
                      {formUrl.includes('docs.google.com') && customQuestions.length === 0 && (
                        <a 
                          href={formUrl.replace('/viewform', '/edit').replace('?embedded=true', '')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors"
                          title="Open in a new tab to edit form settings"
                        >
                          Edit in Google Forms
                        </a>
                      )}
                      <button 
                        onClick={() => setShowForm(false)}
                        className="text-gray-500 hover:text-red-500 flex items-center gap-1 text-sm font-medium transition-colors"
                      >
                        <X className="w-4 h-4" /> Close
                      </button>
                    </div>
                  </div>
                  
                  {customQuestions.length > 0 ? (
                    isSubmitted ? (
                      <div className="py-20 flex flex-col items-center justify-center animate-fade-in text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                          <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Thank You!</h3>
                        <p className="text-lg text-gray-600 max-w-md">Your responses have been recorded successfully. We appreciate your feedback.</p>
                        <button onClick={() => setShowForm(false)} className="mt-8 text-blue-600 font-medium hover:underline">Return to Page</button>
                      </div>
                    ) : (
                      <form onSubmit={handleCustomSubmit} className="space-y-8 animate-fade-in pb-8">
                        {customQuestions.map((q, idx) => (
                          <div key={q.id} className="p-6 bg-slate-50 border border-gray-100 rounded-2xl shadow-sm">
                            <label className="block text-gray-900 font-bold mb-4 text-lg">
                              {idx + 1}. {q.label} {q.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            
                            {q.type === 'text' && (
                              <input required={q.required} type="text" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" placeholder="Your answer here..." onChange={e => setFormData({...formData, [q.id]: e.target.value})} />
                            )}
                            
                            {q.type === 'textarea' && (
                              <textarea required={q.required} rows={4} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" placeholder="Please elaborate..." onChange={e => setFormData({...formData, [q.id]: e.target.value})} />
                            )}
                            
                            {q.type === 'radio' && (
                              <div className="space-y-3 pl-2">
                                {q.options?.map((opt, i) => (
                                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                      <input required={q.required} type="radio" name={q.id} value={opt} className="peer sr-only" onChange={e => setFormData({...formData, [q.id]: e.target.value})} />
                                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-white transition-colors group-hover:border-blue-400" />
                                      <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-gray-700 font-medium">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            
                            {q.type === 'rating' && (
                              <div className="flex gap-4 pt-2">
                                {[1,2,3,4,5].map(num => (
                                  <label key={num} className="flex flex-col items-center gap-1 cursor-pointer group relative">
                                    <input required={q.required} type="radio" name={q.id} value={num} className="peer sr-only" onChange={e => setFormData({...formData, [q.id]: e.target.value})} />
                                    <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-bold text-gray-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white group-hover:border-blue-400 transition-all peer-checked:shadow-lg peer-checked:shadow-blue-500/30">
                                      {num}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="pt-4 flex justify-end">
                           <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2 px-8 py-3 text-lg shadow-xl shadow-blue-500/20">
                             {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Survey'}
                           </button>
                        </div>
                      </form>
                    )
                  ) : formUrl ? (
                    <div className="relative w-full h-[calc(100%-4rem)]">
                      {isIframeLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 rounded-lg">
                          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                          <p className="text-slate-500 font-medium animate-pulse">Loading Survey Form...</p>
                        </div>
                      )}
                      <iframe
                        src={finalFormUrl}
                        onLoad={() => setIsIframeLoading(false)}
                        className="w-full h-full border-0 rounded-lg shadow-inner bg-slate-50"
                        title="Survey Form"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-20">
              Survey form is currently not available. Please check back later.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
