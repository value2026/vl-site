import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin, Building, Loader2, CheckCircle2, ArrowRight,
  ClipboardList, MonitorPlay, Ribbon, KeyRound,
  Mail, Phone, FileText, ChevronRight, Users, Globe, Award,
  Calendar, AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import WorkshopRegistrationModal from '../components/public/WorkshopRegistrationModal';
import DynamicBlockRenderer from '../components/public/DynamicBlockRenderer';
import { apiUrl } from '../utils/api';

async function fetchNodalCentresSections() {
  const res = await fetch(apiUrl("/pages/nodal-centres/sections"));
  if (!res.ok) throw new Error('Failed to fetch nodal centres sections');
  return res.json();
}

async function fetchWorkshops() {
  const res = await fetch(apiUrl("/workshops"));
  if (!res.ok) throw new Error('Failed to fetch workshops');
  return res.json();
}

const modeColor = {
  Hybrid:      'bg-purple-100 text-purple-700',
  'In-person': 'bg-green-100 text-green-700',
  Online:      'bg-blue-100 text-blue-700',
};

const TABS = [
  { id: 'overview',      label: 'Overview',        icon: Building },
  { id: 'apply',         label: 'Apply',            icon: ClipboardList },
  { id: 'demo',          label: 'Free Online Demo', icon: MonitorPlay },
  { id: 'inaugurations', label: 'Inaugurations',    icon: Ribbon },
  { id: 'login',         label: 'Unique Login ID',  icon: KeyRound },
];

const BENEFITS = [
  'Free bi-monthly online training of select experiments for students and faculty.',
  'Free support during the implementation phase of the programme.',
  'Assistance in the integration of virtual lab scores into the regular curriculum.',
  'Exclusive features for faculty: lab question paper development, online lab exam setup, and results reporting.',
  'Information on upcoming events and invitation to Nodal Centre activities and forums.',
  'Computer infrastructure assessment.',
  'Updates and feedback on virtual labs development.',
  'Student internship opportunities.',
  'Networking with a vast collection of colleges and institutions.',
];

const INAUGURATION_EVENTS = [
  { year: '2024', title: 'Nodal Centre Inauguration – Amrita Coimbatore', location: 'Coimbatore, Tamil Nadu', description: 'Launch of Virtual Labs Nodal Centre at the School of Engineering, Amrita Vishwa Vidyapeetham.', attendees: '200+', status: 'Completed' },
  { year: '2023', title: 'Virtual Labs Expansion – Southern Consortium', location: 'Bengaluru, Karnataka', description: 'Formal inauguration ceremony for the southern consortium nodal centres, expanding access to 12 new institutions.', attendees: '350+', status: 'Completed' },
  { year: '2023', title: 'NMEICT Nodal Centre Drive', location: 'New Delhi', description: 'National launch event for the 2023 wave of nodal centre registrations under the MHRD NMEICT initiative.', attendees: '500+', status: 'Completed' },
  { year: '2022', title: 'North India Expansion Launch', location: 'Lucknow, Uttar Pradesh', description: 'Inauguration of 8 new nodal centres across Uttar Pradesh, Bihar, and Madhya Pradesh.', attendees: '280+', status: 'Completed' },
];

function InlineFreeDemoForm({ demoContent = {} }) {
  const [formData, setFormData]     = useState({});
  const [questions, setQuestions]   = useState([]);
  const [formSchemaSec, setFormSchemaSec] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  // Fetch the same schema used by the home page "Register for Free Demo" modal
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(apiUrl("/pages/nodal-centre-request/sections"));
        if (!res.ok) throw new Error('Failed to load form');
        const sections = await res.json();
        const formSec = sections.find(s => s.sectionKey === 'formSchema');
        if (formSec) {
          setFormSchemaSec(formSec);
          if (formSec.content?.questions) setQuestions(formSec.content.questions);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fc = formSchemaSec?.content || {};
  const pickStr = (a, b, fallback) => (a !== undefined ? a : (b !== undefined ? b : fallback));
  const pickList = (a, b, fallback) => {
    if (Array.isArray(a)) return a.map(item => (typeof item === 'string' ? item : item.text)).filter(Boolean);
    if (Array.isArray(b)) return b.map(item => (typeof item === 'string' ? item : item.text)).filter(Boolean);
    return fallback;
  };
  const formTitle = pickStr(demoContent.formTitle, formSchemaSec?.title, 'Training Registration Form');
  const availabilityBadge = pickStr(demoContent.availabilityBadge, fc.availabilityBadge, 'Currently available only in India');
  const trainingInfo = pickStr(demoContent.trainingInfo, fc.trainingInfo, 'Virtual lab training will be conducted by Subject Matter Experts of Amrita Virtual Labs. A nodal centre can propose a tentative schedule for online/offline training.');
  const onlineReqTitle = pickStr(demoContent.onlineReqTitle, fc.onlineReqTitle, 'Online training requirements:');
  const onlineReqItems = pickList(demoContent.onlineReqItems, fc.onlineReqItems, ['Laptop/Computer with ≥2 Mbps internet', 'Webcam, speakers & microphone/headset']);
  const offlineReqTitle = pickStr(demoContent.offlineReqTitle, fc.offlineReqTitle, 'Offline training requirements:');
  const offlineReqItems = pickList(demoContent.offlineReqItems, fc.offlineReqItems, ['Computer lab with individual internet access', 'Projector/screen, mike and speakers']);
  const formDisclaimer = pickStr(demoContent.formDisclaimer, fc.formDisclaimer, 'By submitting, you express interest in becoming an official MoE (Ministry of Education) Nodal Centre.');
  const submitButtonLabel = pickStr(demoContent.submitButtonLabel, fc.submitButtonLabel, 'Submit Request');
  const successTitle = pickStr(demoContent.successTitle, fc.successTitle, 'Request Submitted!');
  const successMessage = pickStr(demoContent.successMessage, fc.successMessage, 'Your application has been received. Our team will review your details and contact you shortly.');
  const contactEmail = pickStr(demoContent.contactEmail, undefined, 'virtual_labs@am.amrita.edu');
  const showOnlineCard = Boolean(onlineReqTitle || onlineReqItems.length > 0);
  const showOfflineCard = Boolean(offlineReqTitle || offlineReqItems.length > 0);
  const showInfoBlock = Boolean(availabilityBadge || trainingInfo || showOnlineCard || showOfflineCard);

  const handleInput = (id, value) => setFormData(prev => ({ ...prev, [id]: value }));
  const handleCheckbox = (id, option, checked) =>
    setFormData(prev => {
      const cur = prev[id] || [];
      return { ...prev, [id]: checked ? [...cur, option] : cur.filter(o => o !== option) };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(
        apiUrl("/pages/nodal-centre-request/survey"),
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }
      );
      if (!res.ok) throw new Error('Submission failed. Please try again.');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card border border-gray-100 p-12 flex justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="card border border-gray-100 p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">{successTitle}</h4>
        <p className="text-gray-500 max-w-md">
          {successMessage}
        </p>
        <button
          onClick={() => { setSuccess(false); setFormData({}); }}
          className="mt-8 btn-primary px-6 py-2"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="card border border-gray-100 p-8 md:p-10">
      {formTitle && <h3 className="font-heading text-xl font-bold text-gray-900 mb-6">{formTitle}</h3>}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Info block — editable/deletable via Manage Pages -> Nodal Centres -> Free Online Demo */}
      {showInfoBlock && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-6">
          {availabilityBadge && (
            <p className="text-sm text-blue-800 font-semibold mb-3 bg-blue-100/50 inline-block px-3 py-1 rounded-full">
              {availabilityBadge}
            </p>
          )}
          {trainingInfo && (
            <p className="text-slate-700 text-sm leading-relaxed mb-4">
              {trainingInfo}
            </p>
          )}
          {(showOnlineCard || showOfflineCard) && (
            <div className={`grid ${showOnlineCard && showOfflineCard ? 'sm:grid-cols-2' : 'grid-cols-1'} gap-4`}>
              {showOnlineCard && (
                <div className="bg-white rounded-xl p-4 border border-blue-50">
                  {onlineReqTitle && <h5 className="font-bold text-slate-800 text-sm mb-2">{onlineReqTitle}</h5>}
                  {onlineReqItems.length > 0 && (
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      {onlineReqItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {showOfflineCard && (
                <div className="bg-white rounded-xl p-4 border border-blue-50">
                  {offlineReqTitle && <h5 className="font-bold text-slate-800 text-sm mb-2">{offlineReqTitle}</h5>}
                  {offlineReqItems.length > 0 && (
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      {offlineReqItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="font-medium">Registration form is not yet configured.</p>
          <p className="text-sm mt-1">Please contact us directly at {contactEmail}</p>
        </div>
      ) : (
        <form id="demo-registration-form" onSubmit={handleSubmit} className="space-y-5">
          {questions.map((q) => (
            <div key={q.id} className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
              <label className="block text-sm font-bold text-slate-800 mb-3">
                {q.text} {q.required && <span className="text-red-500">*</span>}
              </label>
              {q.type === 'text' || q.type === 'email' || q.type === 'date' || q.type === 'time' ? (
                <input
                  type={q.type} required={q.required}
                  onChange={(e) => handleInput(q.id, e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                  placeholder={q.placeholder || `Enter your ${q.type === 'email' ? 'email address' : 'answer'}...`}
                />
              ) : q.type === 'textarea' ? (
                <textarea required={q.required} rows={4}
                  onChange={(e) => handleInput(q.id, e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors resize-y"
                  placeholder={q.placeholder || 'Type your answer here...'}
                />
              ) : q.type === 'select' ? (
                <select required={q.required} onChange={(e) => handleInput(q.id, e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors">
                  <option value="">Select an option...</option>
                  {q.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              ) : q.type === 'radio' ? (
                <div className="space-y-3">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name={`q-${q.id}`} value={opt} required={q.required}
                        onChange={(e) => handleInput(q.id, e.target.value)}
                        className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" />
                      <span className="text-sm font-medium text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : q.type === 'checkbox' ? (
                <div className="space-y-3">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" value={opt}
                        onChange={(e) => handleCheckbox(q.id, opt, e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500" />
                      <span className="text-sm font-medium text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-400 italic max-w-[60%]">
              {formDisclaimer}
            </p>
            <button type="submit" form="demo-registration-form" disabled={submitting}
              className="btn-primary px-7 py-2.5 flex items-center gap-2 text-sm shadow-lg shadow-primary-500/20 disabled:opacity-70">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitButtonLabel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


export default function NodalCentres() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [freeDemoOpen, setFreeDemoOpen] = useState(false);

  // Sync tab when URL changes (e.g., header dropdown click)
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  const { data: sections, isLoading } = useQuery({
    queryKey: ['nodal-centres-sections'],
    queryFn: fetchNodalCentresSections,
    staleTime: 60_000,
    retry: 1,
  });

  const { data: workshops, isLoading: workshopsLoading } = useQuery({
    queryKey: ['workshops-list'],
    queryFn: fetchWorkshops,
    staleTime: 60_000,
    retry: 1,
  });
  const approvedWorkshops = (workshops || []).filter(w => w.status === 'approved');

  let centres = [];
  let benefits = BENEFITS;
  let inaugurations = INAUGURATION_EVENTS;
  let heroSec = null;
  let aboutSec = null;
  let benefitsSec = null;
  let listSec = null;
  let inaugSec = null;
  let uniqueIdSec = null;
  let applySec = null;
  let demoSec = null;

  if (sections) {
    listSec = sections.find(s => s.sectionKey === 'nc_list');
    aboutSec = sections.find(s => s.sectionKey === 'nc_about');
    benefitsSec = sections.find(s => s.sectionKey === 'nc_benefits');
    heroSec = sections.find(s => s.sectionKey === 'nc_hero');
    inaugSec = sections.find(s => s.sectionKey === 'nc_inaugurations');
    uniqueIdSec = sections.find(s => s.sectionKey === 'nc_unique_id');
    applySec = sections.find(s => s.sectionKey === 'nc_apply');
    demoSec = sections.find(s => s.sectionKey === 'nc_demo');

    if (listSec?.content?.items) centres = listSec.content.items;
    if (benefitsSec?.content?.items) benefits = benefitsSec.content.items.map(b => b.text || b);
    if (inaugSec?.content?.items) inaugurations = inaugSec.content.items;
  }

  const ABOUT_ICON_MAP = {
    Users,
    Globe,
    Award,
    Building,
    ClipboardList,
    KeyRound,
    CheckCircle2,
    MapPin,
    Calendar,
    MonitorPlay,
  };
  const DEFAULT_ABOUT_STATS = [
    { icon: 'Users', title: '500+', sub: 'Registered Institutions' },
    { icon: 'Globe', title: '28', sub: 'States Covered' },
    { icon: 'Award', title: '0', sub: 'Registration Fee' },
  ];
  const aboutTag = aboutSec?.content?.tag || 'About the Programme';
  const aboutTitle = aboutSec?.title || 'What is the Nodal Centre Programme?';
  const aboutSubtitle = aboutSec?.subtitle || 'The Nodal Centre Programme allows educational institutions to follow the progress of Amrita Virtual Labs and contribute towards the future development of Virtual Labs and experiments. Sponsored by MoE (Ministry of Education), it comes with no registration fees, no software products, and no hidden costs.';
  const aboutStats = (Array.isArray(aboutSec?.content?.stats) && aboutSec.content.stats.length > 0)
    ? aboutSec.content.stats
    : DEFAULT_ABOUT_STATS;

  // Set default unique ID content if not present
  const uniqueIdTitle = uniqueIdSec?.title || 'Unique Login ID';
  const uniqueIdSubtitle = uniqueIdSec?.subtitle || 'Registered Nodal Centres receive a unique institutional login ID granting access to exclusive faculty features, progress tracking, and lab management tools.';
  const uniqueIdTag = uniqueIdSec?.content?.tag || 'Access';
  const uniqueIdFeatures = uniqueIdSec?.content?.features || [
    { icon: KeyRound, title: 'Institutional Login', desc: 'A dedicated login ID tied to your institution for centralised access management.' },
    { icon: ClipboardList, title: 'Lab Exam Setup', desc: 'Set up, schedule, and monitor online virtual lab exams directly from your dashboard.' },
    { icon: Users, title: 'Student Enrolment', desc: 'Enrol students under your nodal centre and track their experiment completions and scores.' },
    { icon: Award, title: 'Results Reporting', desc: 'Generate and export detailed performance reports for students and faculty.' },
  ];
  const uniqueIdInstructions = uniqueIdSec?.content?.instructions || 'Nodal coordinator can submit the list of students and faculty members for obtaining the unique login id in the prescribed format to virtual_labs@am.amrita.edu with the subject line - Login ID request - your institute name.';
  let templateLink = uniqueIdSec?.content?.templateLink || '/login_id_template.xlsx';
  if (templateLink.includes('vlab.amrita.edu')) {
    templateLink = '/login_id_template.xlsx';
  }
  const templateLabel = uniqueIdSec?.content?.templateLabel || 'Click Here To Download Login ID Template';


  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-gradient py-12">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            {heroSec?.content?.tag || 'Nodal Centres'}
          </span>
          <h1 className="font-heading text-4xl font-extrabold text-white mb-4">
            {heroSec?.title || 'Join the Virtual Labs Network'}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {heroSec?.subtitle || 'Become a nodal centre and bring world-class virtual lab experiences to your students. Sponsored by MoE (Ministry of Education) — no registration fees, no hidden costs.'}
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 md:justify-center">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-200 ${
                  activeTab === id
                    ? 'border-primary-700 text-primary-800 bg-primary-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────── */}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* About Section */}
          {(!aboutSec || aboutSec.isVisible !== false) && (
            <section className="py-20 bg-white">
              <div className="container-custom max-w-4xl">
                <div className="text-center mb-14">
                  <span className="tag">{aboutTag}</span>
                  <h2 className="section-title mt-4">{aboutTitle}</h2>
                  <p className="section-subtitle">
                    {aboutSubtitle}
                  </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-6 mb-14">
                  {aboutStats.map(({ icon, title, sub }, idx) => {
                    const fallbackIcons = [Users, Globe, Award];
                    const Icon = (typeof icon === 'string' ? ABOUT_ICON_MAP[icon.trim()] : icon) || fallbackIcons[idx % fallbackIcons.length];
                    return (
                      <div key={sub || idx} className="card p-8 text-center border border-gray-100">
                        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-7 h-7 text-primary-700" />
                        </div>
                        <div className="text-4xl font-heading font-extrabold text-gray-900 mb-1">{title}</div>
                        <div className="text-gray-500 text-sm">{sub}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Benefits */}
          <section className="py-20 bg-gray-50">
            <div className="container-custom">
              <div className="text-center mb-12">
                <span className="tag">{benefitsSec?.content?.tag || 'Why Join'}</span>
                <h2 className="section-title mt-4">{benefitsSec?.title || 'Benefits of Becoming a Nodal Centre'}</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                {benefits.map((text, i) => (
                  <div key={i} className="card p-6 border border-gray-100 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button onClick={() => setActiveTab('apply')} className="btn-primary">
                  Apply Now <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Registered Centres */}
          <section className="py-20 bg-white">
            <div className="container-custom">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="tag">{listSec?.content?.tag || 'Network'}</span>
                  <h2 className="section-title mt-4 mb-0">{listSec?.title || 'Registered Nodal Centres'}</h2>
                </div>
                <span className="text-sm text-gray-400">{centres.length} centres listed</span>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : centres.length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 py-10">No nodal centres registered yet.</div>
                ) : (
                  centres.map((c, i) => {
                    const isActive = c.active === true || c.active === 'true';
                    return (
                      <div key={c.id || i} className="card p-5 border border-gray-100 flex flex-col hover:border-primary-300 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Building className="w-4 h-4 text-primary-700" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-snug line-clamp-2 flex-1">{c.name}</h3>
                        <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-1 mb-3 line-clamp-2">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                          {c.location}
                        </div>
                        <div className="mt-auto">
                          <span className="inline-block text-[10px] bg-primary-50/50 border border-primary-100 text-primary-700 px-2 py-1 rounded-md font-medium truncate max-w-full">
                            {c.category || 'Institution'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* APPLY */}
      {activeTab === 'apply' && (!applySec || applySec.isVisible !== false) && (() => {
        const ac = applySec?.content || {};
        const applyTag = ac.tag !== undefined ? ac.tag : 'Application';
        const applyTitle = applySec?.title !== undefined ? applySec.title : 'Apply for Nodal Centre Programme';
        const applySubtitle = applySec?.subtitle !== undefined ? applySec.subtitle : 'We are looking for expressions of interest from reputed educational and research institutions. The programme is completely free — sponsored by MoE (Ministry of Education) under NME-ICT.';
        const eligibilityTitle = ac.eligibilityTitle !== undefined ? ac.eligibilityTitle : 'Eligibility Criteria';
        const defaultEligibility = [
          'Recognised college or university in India',
          'Minimum computer lab with 20+ terminals',
          'Broadband internet connectivity (2 Mbps+)',
          'Dedicated faculty coordinator',
          'Willingness to integrate labs into curriculum',
          'Commitment to host minimum 2 workshops/year',
        ];
        const eligibilityItems = Array.isArray(ac.eligibilityItems)
          ? ac.eligibilityItems.map(item => (typeof item === 'string' ? item : item.text)).filter(Boolean)
          : defaultEligibility;
        const stepsTitle = ac.stepsTitle !== undefined ? ac.stepsTitle : 'How to Apply';
        const defaultSteps = [
          { step: '01', title: 'Download EOI Form', desc: 'Download the Expression of Interest form from the link below.' },
          { step: '02', title: 'Fill & Submit', desc: 'Complete all fields and submit via email to our team.' },
          { step: '03', title: 'Verification', desc: "Our team will verify your institution's details within 5 working days." },
          { step: '04', title: 'Onboarding', desc: 'Receive login credentials and schedule your first training session.' },
        ];
        const steps = Array.isArray(ac.steps) ? ac.steps : defaultSteps;
        const eoiTitle = ac.eoiTitle !== undefined ? ac.eoiTitle : 'Expression of Interest Form';
        const eoiDescription = ac.eoiDescription !== undefined ? ac.eoiDescription : 'Download and fill the EOI form, then send it to virtual_labs@am.amrita.edu';
        const eoiButtonLabel = ac.eoiButtonLabel !== undefined ? ac.eoiButtonLabel : 'Download EOI Form';
        const eoiLink = ac.eoiLink !== undefined ? ac.eoiLink : '/workshop_NodalCentre.pdf';
        const showEligibilityCard = Boolean(eligibilityTitle || eligibilityItems.length > 0);
        const showStepsCard = Boolean(stepsTitle || steps.length > 0);
        const showEoiCard = Boolean(eoiTitle || eoiDescription || (eoiButtonLabel && eoiLink));

        return (
          <section className="py-20 bg-white">
            <div className="container-custom max-w-4xl">
              {(applyTag || applyTitle || applySubtitle) && (
                <div className="text-center mb-14">
                  {applyTag && <span className="tag">{applyTag}</span>}
                  {applyTitle && <h2 className="section-title mt-4">{applyTitle}</h2>}
                  {applySubtitle && (
                    <p className="section-subtitle">
                      {applySubtitle}
                    </p>
                  )}
                </div>
              )}

              {(showEligibilityCard || showStepsCard) && (
                <div className={`grid ${showEligibilityCard && showStepsCard ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8 mb-14`}>
                  {showEligibilityCard && (
                    <div className="card p-8 border border-gray-100">
                      {eligibilityTitle && <h3 className="font-heading text-xl font-bold text-gray-900 mb-6">{eligibilityTitle}</h3>}
                      {eligibilityItems.length > 0 && (
                        <ul className="space-y-3">
                          {eligibilityItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <ChevronRight className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600 text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {showStepsCard && (
                    <div className="card p-8 border border-primary-100 bg-primary-50/30">
                      {stepsTitle && <h3 className="font-heading text-xl font-bold text-gray-900 mb-6">{stepsTitle}</h3>}
                      {steps.length > 0 && (
                        <div className="space-y-4">
                          {steps.map(({ step, title, desc }, idx) => (
                            <div key={step || idx} className="flex gap-4">
                              <div className="w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {step || String(idx + 1).padStart(2, '0')}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">{title}</div>
                                <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {showEoiCard && (
                <div className="card p-8 border border-gray-200 text-center">
                  <FileText className="w-10 h-10 text-primary-700 mx-auto mb-4" />
                  {eoiTitle && <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">{eoiTitle}</h3>}
                  {eoiDescription && <p className="text-gray-500 text-sm mb-6">{eoiDescription}</p>}
                  {eoiButtonLabel && eoiLink && (
                    <div className="flex justify-center">
                      <a
                        href={eoiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        {eoiButtonLabel} <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <DynamicBlockRenderer blocks={applySec?.content?.customBlocks} fields={applySec?.content?.customFields} />
            </div>
          </section>
        );
      })()}

      {/* FREE ONLINE DEMO — inline registration form */}
      {activeTab === 'demo' && (!demoSec || demoSec.isVisible !== false) && (() => {
        const dc = demoSec?.content || {};
        const demoTag = dc.tag !== undefined ? dc.tag : 'Demo Session';
        const demoTitle = demoSec?.title !== undefined ? demoSec.title : 'Free Online Demo';
        const demoSubtitle = demoSec?.subtitle !== undefined ? demoSec.subtitle : 'Register for a live online demonstration of Virtual Labs for your faculty and students — completely free of charge. Our team will walk you through available experiments and how to integrate them into your curriculum.';
        const defaultHighlights = [
          { icon: 'MonitorPlay', title: 'Live Walkthrough', desc: 'A live guided tour of the Virtual Labs platform covering experiments, dashboards, and assessments.' },
          { icon: 'Users', title: 'For Faculty & Students', desc: 'Sessions tailored separately for faculty coordinators and student groups.' },
          { icon: 'CheckCircle2', title: 'No Cost, No Obligation', desc: 'Completely free with no commitment required. Simply register your interest.' },
        ];
        const demoHighlights = Array.isArray(dc.highlights) ? dc.highlights : defaultHighlights;
        const demoEmail = dc.contactEmail !== undefined ? dc.contactEmail : 'virtual_labs@am.amrita.edu';
        const demoPhone = dc.contactPhone !== undefined ? dc.contactPhone : '+91 9446007135 / 0476 280 4528';

        return (
          <section className="py-20 bg-white">
            <div className="container-custom max-w-3xl">
              {(demoTag || demoTitle || demoSubtitle) && (
                <div className="text-center mb-14">
                  {demoTag && <span className="tag">{demoTag}</span>}
                  {demoTitle && <h2 className="section-title mt-4">{demoTitle}</h2>}
                  {demoSubtitle && (
                    <p className="section-subtitle">
                      {demoSubtitle}
                    </p>
                  )}
                </div>
              )}

              {/* Feature highlights */}
              {demoHighlights.length > 0 && (
                <div className="grid md:grid-cols-3 gap-6 mb-14">
                  {demoHighlights.map(({ icon, title, desc }, idx) => {
                    const fallbackIcons = [MonitorPlay, Users, CheckCircle2];
                    const Icon = (typeof icon === 'string' ? ABOUT_ICON_MAP[icon.trim()] : icon) || fallbackIcons[idx % fallbackIcons.length];
                    return (
                      <div key={title || idx} className="card p-7 border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-6 h-6 text-primary-700" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inline Registration Form */}
              <InlineFreeDemoForm demoContent={dc} />

              {(demoEmail || demoPhone) && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
                  {demoEmail && <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-600" /> {demoEmail}</span>}
                  {demoPhone && <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-600" /> {demoPhone}</span>}
                </div>
              )}

              <DynamicBlockRenderer blocks={demoSec?.content?.customBlocks} fields={demoSec?.content?.customFields} />
            </div>
          </section>
        );
      })()}

      {/* Workshop registration modal */}
      {selectedWorkshop && (
        <WorkshopRegistrationModal
          workshop={selectedWorkshop}
          onClose={() => setSelectedWorkshop(null)}
        />
      )}

      {/* Free Demo registration modal */}
      {freeDemoOpen && (
        <WorkshopRegistrationModal
          workshop={FREE_DEMO_WORKSHOP}
          onClose={() => setFreeDemoOpen(false)}
        />
      )}

      {/* INAUGURATIONS */}
      {activeTab === 'inaugurations' && (
        <section className="py-20 bg-white">
          <div className="container-custom max-w-4xl">
            <div className="text-center mb-14">
              <span className="tag">{inaugSec?.content?.tag || 'Events'}</span>
              <h2 className="section-title mt-4">{inaugSec?.title || 'Nodal Centre Inaugurations'}</h2>
              <p className="section-subtitle">
                {inaugSec?.subtitle || 'Celebrating the launch of new nodal centres across India. Each inauguration marks a milestone in expanding quality STEM education.'}
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />

              <div className="space-y-8">
                {inaugurations.map((event, i) => (
                  <div key={i} className="relative flex gap-6">
                    {/* Year bubble */}
                    <div className="hidden sm:flex w-16 h-16 rounded-full bg-primary-700 text-white flex-shrink-0 items-center justify-center font-heading font-bold text-sm z-10 shadow-lg">
                      {event.year}
                    </div>
                    <div className="card p-7 border border-gray-100 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-heading text-lg font-bold text-gray-900 leading-snug">{event.title}</h3>
                        <span className="sm:hidden text-xs font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-full flex-shrink-0 ml-3">{event.year}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
                        <MapPin className="w-4 h-4 text-primary-400" />
                        {event.location}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{event.description}</p>
                      <div className="flex items-center gap-2 text-sm mt-auto">
                        {event.attendees && (
                          <>
                            <Users className="w-4 h-4 text-primary-500" />
                            <span className="text-gray-500">{event.attendees} attendees</span>
                          </>
                        )}
                        <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-semibold ${(event.status || 'Completed').toLowerCase() === 'upcoming' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                          {event.status || 'Completed'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 card p-8 border border-dashed border-primary-300 bg-primary-50/40 text-center">
              <Ribbon className="w-10 h-10 text-primary-600 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">Hosting an Inauguration?</h3>
              <p className="text-gray-500 text-sm mb-6">If your institution is planning to launch a Nodal Centre and would like to organise an inauguration event, reach out to our team for support.</p>
              <a href="mailto:virtual_labs@am.amrita.edu" className="btn-primary">
                <Mail className="w-4 h-4" /> Get in Touch
              </a>
            </div>
          </div>
        </section>
      )}

      {/* UNIQUE LOGIN ID */}
      {activeTab === 'login' && (
        <section className="py-20 bg-white">
          <div className="container-custom max-w-3xl">
            <div className="text-center mb-14">
              <span className="tag">{uniqueIdTag}</span>
              <h2 className="section-title mt-4">{uniqueIdTitle}</h2>
              <p className="section-subtitle">
                {uniqueIdSubtitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {uniqueIdFeatures.map(({ icon, title, desc }) => {
                let RealIcon = KeyRound;
                if (typeof icon === 'string') {
                  if (icon === 'ClipboardList') RealIcon = ClipboardList;
                  else if (icon === 'Users') RealIcon = Users;
                  else if (icon === 'Award') RealIcon = Award;
                  else if (icon === 'KeyRound') RealIcon = KeyRound;
                } else if (icon) {
                  RealIcon = icon;
                }
                return (
                  <div key={title} className="card p-7 border border-gray-100 flex gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <RealIcon className="w-6 h-6 text-primary-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Template Download Section */}
            <div className="card p-8 border border-blue-100 bg-blue-50/50 mb-12 text-center">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-3">Login ID Template</h3>
              <p className="text-gray-700 text-sm max-w-2xl mx-auto leading-relaxed mb-6">
                {uniqueIdInstructions}
              </p>
              <div className="flex justify-center">
                <a
                  href={templateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4" /> {templateLabel}
                </a>
              </div>
            </div>

            <div className="card p-10 border border-primary-100 bg-gradient-to-br from-primary-50 to-white">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <KeyRound className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">Already a Nodal Centre?</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    Log in with your institutional credentials to access the faculty dashboard, manage students, and run virtual lab assessments.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/login" className="btn-primary">
                      <KeyRound className="w-4 h-4" /> Log In Now
                    </Link>
                    <a href="mailto:virtual_labs@am.amrita.edu" className="btn-outline">
                      <Mail className="w-4 h-4" /> Request Login ID
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
