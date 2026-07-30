import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Users, Eye, GripVertical, ChevronLeft, Plus, Trash2, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HostWorkshopRequestsManager() {
  const { token, API_URL } = useAuth();
  
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'form'
  const [error, setError] = useState('');

  // ── Form Builder State ──
  const [questions, setQuestions] = useState([]);
  const [formSectionId, setFormSectionId] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [savingForm, setSavingForm] = useState(false);

  // ── Requests State ──
  const [requests, setRequests] = useState([]);
  const [loadingReq, setLoadingReq] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);

  // --- Fetch Form Schema ---
  const fetchFormSchema = useCallback(async () => {
    setLoadingForm(true);
    try {
      const res = await fetch(`${API_URL}/pages/nodal-centre-request/sections`);
      if (!res.ok) throw new Error('Failed to fetch form schema');
      const sections = await res.json();
      const formSec = sections.find(s => s.sectionKey === 'formSchema');
      if (formSec) {
        setFormSectionId(formSec.id);
        setQuestions(formSec.content?.questions || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load form schema');
    } finally {
      setLoadingForm(false);
    }
  }, [API_URL]);

  // --- Fetch Requests ---
  const fetchRequests = useCallback(async () => {
    setLoadingReq(true);
    try {
      const res = await fetch(`${API_URL}/pages/nodal-centre-request/survey/responses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 404) {
        setRequests([]);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load requests');
    } finally {
      setLoadingReq(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (activeTab === 'form') fetchFormSchema();
    if (activeTab === 'requests') {
      fetchFormSchema(); // Needed to map question IDs to labels
      fetchRequests();
    }
  }, [activeTab, fetchFormSchema, fetchRequests]);

  // --- Form Builder Handlers ---
  const addQuestion = () => setQuestions([...questions, { id: Date.now().toString(), text: 'New Question', type: 'text', required: true, options: [] }]);
  const updateQuestion = (qId, field, value) => setQuestions(questions.map(q => q.id === qId ? { ...q, [field]: value } : q));
  const removeQuestion = (qId) => setQuestions(questions.filter(q => q.id !== qId));
  const addOption = (qId) => setQuestions(questions.map(q => q.id === qId ? { ...q, options: [...(q.options || []), 'New Option'] } : q));
  const updateOption = (qId, index, value) => setQuestions(questions.map(q => {
    if (q.id === qId) {
      const newOptions = [...q.options];
      newOptions[index] = value;
      return { ...q, options: newOptions };
    }
    return q;
  }));
  const removeOption = (qId, index) => setQuestions(questions.map(q => {
    if (q.id === qId) {
      const newOptions = [...q.options];
      newOptions.splice(index, 1);
      return { ...q, options: newOptions };
    }
    return q;
  }));

  const saveFormSchema = async () => {
    if (!formSectionId) return;
    setSavingForm(true);
    try {
      const res = await fetch(`${API_URL}/pages/nodal-centre-request/sections/${formSectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: { questions } })
      });
      if (!res.ok) throw new Error('Failed to save form');
      alert("Form schema saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingForm(false);
    }
  };

  // --- Helper for Requests Display ---
  const getReadableData = (rawData) => {
    const readable = {};
    const qMap = {};
    questions.forEach(q => { qMap[q.id] = q.text; });
    for (const key in rawData) {
      readable[qMap[key] || key] = rawData[key];
    }
    return readable;
  };

  const extractField = (readableData, keywords) => {
    for (const key in readableData) {
      for (const keyword of keywords) {
        if (key.toLowerCase().includes(keyword.toLowerCase())) {
          return Array.isArray(readableData[key]) ? readableData[key].join(', ') : readableData[key];
        }
      }
    }
    return '-';
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
      {/* Internal Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/80 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'requests' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" /> Received Requests
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'form' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" /> Edit Request Form
          </button>
        </div>
        {activeTab === 'form' && (
          <button onClick={saveFormSchema} disabled={savingForm} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50">
            {savingForm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Form Schema
          </button>
        )}
      </div>

      {error && (
        <div className="m-6 mb-0 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6 flex-1 bg-slate-950/30 overflow-y-auto">
        
        {/* Tab: Requests Viewer */}
        {activeTab === 'requests' && (
          loadingReq ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
          ) : viewingRequest ? (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
              <button onClick={() => setViewingRequest(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
                <ChevronLeft className="w-4 h-4" /> Back to List
              </button>
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                <div className="mb-6 pb-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Host Workshop Request Details</h3>
                  <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full font-semibold">
                    {new Date(viewingRequest.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-5">
                  {Object.entries(getReadableData(viewingRequest.data)).map(([q, a], i) => (
                    <div key={i} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 shadow-inner">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{q}</p>
                      <p className="text-base text-slate-200 font-medium">
                        {Array.isArray(a) ? a.join(', ') : (a || <span className="italic text-slate-600">No answer</span>)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Date Submitted</th>
                    <th className="px-6 py-4">Institution / Contact</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requests.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">No requests received yet.</td></tr>
                  ) : (
                    requests.map(req => {
                      const readable = getReadableData(req.data);
                      return (
                        <tr key={req.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="px-6 py-4 text-slate-400 text-sm font-medium">
                            {new Date(req.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white text-base mb-1">
                              {extractField(readable, ['institution', 'college', 'university', 'name'])}
                            </div>
                            <div className="text-sm text-slate-500">
                              {extractField(readable, ['email', 'mail', 'contact'])}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setViewingRequest(req)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition-colors"
                            >
                              <Eye className="w-4 h-4" /> View Application
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab: Form Builder */}
        {activeTab === 'form' && (
          loadingForm ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div>
                  <h3 className="text-xl font-bold text-white">Application Form Structure</h3>
                  <p className="text-sm text-slate-400 mt-1">Configure the form that institutions fill out to request hosting a workshop.</p>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <FileText className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Form Fields</h3>
                  <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">Start building the application form by adding your first question.</p>
                  <button onClick={addQuestion} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20">
                    <Plus className="w-5 h-5" /> Add First Field
                  </button>
                </div>
              ) : (
                <div className="space-y-6 pb-10">
                  {questions.map((q, index) => (
                    <div key={q.id} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 relative group shadow-lg hover:border-purple-500/30 transition-all">
                      <div className="flex gap-5">
                        <div className="pt-2 text-slate-600 cursor-grab hover:text-white transition-colors">
                          <GripVertical className="w-6 h-6" />
                        </div>
                        <div className="flex-1 space-y-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Field Label</label>
                              <input
                                type="text"
                                value={q.text}
                                onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                placeholder="e.g. Institution Name"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner font-medium"
                              />
                            </div>
                            <div className="w-full md:w-64">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Type</label>
                              <select
                                value={q.type}
                                onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer shadow-inner font-medium"
                              >
                                <option value="text">Short Answer</option>
                                <option value="textarea">Long Answer</option>
                                <option value="email">Email Address</option>
                                <option value="select">Dropdown Menu</option>
                                <option value="checkbox">Multiple Checkboxes</option>
                                <option value="radio">Multiple Choice</option>
                              </select>
                            </div>
                          </div>

                          {['select', 'checkbox', 'radio'].includes(q.type) && (
                            <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-3">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Options</h4>
                              {q.options?.map((opt, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-3">
                                  <div className={`w-5 h-5 border-2 border-slate-600 ${q.type === 'radio' ? 'rounded-full' : 'rounded'} flex-shrink-0`} />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                                    className="flex-1 bg-transparent border-b-2 border-slate-700 hover:border-slate-500 focus:border-purple-500 px-2 py-1 text-white focus:outline-none transition-colors"
                                  />
                                  <button onClick={() => removeOption(q.id, optIndex)} className="text-slate-500 hover:text-red-400 p-2 rounded-xl hover:bg-slate-800 transition-colors">
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                              <button onClick={() => addOption(q.id)} className="text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors w-full justify-center border border-purple-500/20 border-dashed">
                                <Plus className="w-4 h-4" /> Add Option
                              </button>
                            </div>
                          )}
                          <div className="flex items-center pt-4 border-t border-slate-800">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <div className="relative">
                                <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)} className="sr-only" />
                                <div className={`w-10 h-6 rounded-full transition-colors ${q.required ? 'bg-purple-500' : 'bg-slate-700'}`}>
                                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${q.required ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                              </div>
                              <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Required Field</span>
                            </label>
                          </div>
                        </div>
                        <div className="pt-2">
                          <button onClick={() => removeQuestion(q.id)} className="text-slate-500 hover:text-red-400 p-3 bg-slate-950 border border-slate-800 rounded-xl transition-colors hover:border-red-500/30 hover:bg-red-500/10">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addQuestion} className="w-full flex items-center justify-center gap-2 px-4 py-6 rounded-3xl border-2 border-dashed border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-bold">
                    <Plus className="w-6 h-6" /> Add Another Field
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
