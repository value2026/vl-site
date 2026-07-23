import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Save, Loader2, GripVertical, Settings, Info, FileText, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function WorkshopEditor() {
  const { token, API_URL, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'new';
  const rolePath = location.pathname.split('/')[2]; // e.g. 'admin' or 'vl-manager'
  
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'form'
  const [loadingInit, setLoadingInit] = useState(!isNew);
  const [workshop, setWorkshop] = useState(null);
  
  // Basic Details State
  const [details, setDetails] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    mode: 'Online',
    seats: '',
  });

  // Form Schema State
  const [questions, setQuestions] = useState([]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    
    const fetchWorkshop = async () => {
      try {
        const res = await fetch(`${API_URL}/workshops/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load workshop');
        const data = await res.json();
        
        setWorkshop(data);
        setDetails({
          title: data.title || '',
          description: data.description || '',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          location: data.location || '',
          mode: data.mode || 'Online',
          seats: data.seats || '',
        });
        setQuestions(data.formSchema ? (Array.isArray(data.formSchema) ? data.formSchema : []) : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingInit(false);
      }
    };
    
    fetchWorkshop();
  }, [id, API_URL, token, isNew]);

  // --- Form Schema Handlers ---
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: 'New Question',
        type: 'text',
        required: true,
        options: []
      }
    ]);
  };

  const updateQuestion = (qId, field, value) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (qId) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...(q.options || []), 'New Option'] };
      }
      return q;
    }));
  };

  const updateOption = (questionId, index, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (questionId, index) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions.splice(index, 1);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const loadTemplate = () => {
    if (questions.length > 0 && !window.confirm("This will replace your current form. Continue?")) return;
    setQuestions([
      { id: '1', text: 'Email', type: 'email', required: true, options: [] },
      { id: '2', text: 'Name of the nodal centre', type: 'text', required: true, options: [] },
      { id: '3', text: 'Name of the faculty member', type: 'text', required: true, options: [] },
      { id: '4', text: 'Designation', type: 'text', required: true, options: [] },
      { id: '5', text: 'Department', type: 'text', required: true, options: [] },
      { id: '6', text: 'Contact number', type: 'text', required: true, options: [] },
      { id: '7', text: 'Select the department(s) those who are attending the workshop', type: 'checkbox', required: true, options: [
        'Physics', 'Chemistry', 'Biotechnology', 'Mechanical Engineering', 'Civil Engineering', 'Computer Science', 'Electronics and communications', 'Electrical Engineering', 'Other'
      ]},
      { id: '8', text: 'Expected number of participants', type: 'text', required: true, options: [] },
      { id: '9', text: 'Select the mode of training', type: 'select', required: true, options: ['Online', 'Offline'] }
    ]);
  };

  // --- Save Handler ---
  const handleSave = async () => {
    if (!details.title.trim() || !details.date) {
      setError("Title and Date are required in the details section.");
      setActiveTab('details');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...details,
        seats: details.seats ? parseInt(details.seats, 10) : null,
        formSchema: questions
      };

      const url = !isNew ? `${API_URL}/workshops/${id}` : `${API_URL}/workshops`;
      const method = !isNew ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save workshop');
      }
      navigate(`/dashboard/${rolePath}/workshops`);
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[85vh]">
      
      {/* Header & Tabs */}
      <div className="flex flex-col border-b border-white/10 bg-slate-800/50">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/dashboard/${rolePath}/workshops`)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-white/10 text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                {!isNew ? 'Edit Workshop' : 'Create New Workshop'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure workshop details and registration form.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/dashboard/${rolePath}/workshops`)} 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !details.title.trim() || !details.date}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Publish
            </button>
          </div>
        </div>
        
        <div className="px-6 flex gap-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 text-sm font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'details' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" /> Basic Details
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`pb-3 px-1 border-b-2 text-sm font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'form' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Registration Form
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {activeTab === 'details' ? (
          <div className="space-y-6 max-w-3xl mx-auto py-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-100">Don't forget the Registration Form!</h4>
                <p className="text-xs text-blue-200/70 mt-1">
                  After filling out these basic details, switch to the <strong>Registration Form</strong> tab above to configure the questions participants must answer when registering for this workshop.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workshop Title *</label>
              <input
                type="text"
                required
                value={details.title}
                onChange={e => setDetails({ ...details, title: e.target.value })}
                placeholder="e.g. Introduction to Virtual Labs"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={details.date}
                  onChange={e => setDetails({ ...details, date: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mode</label>
                <select
                  value={details.mode}
                  onChange={e => setDetails({ ...details, mode: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="In-person">In-person</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                <input
                  type="text"
                  value={details.location}
                  onChange={e => setDetails({ ...details, location: e.target.value })}
                  placeholder="e.g. IIT Bombay / Virtual"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Seats</label>
                <input
                  type="number"
                  value={details.seats}
                  onChange={e => setDetails({ ...details, seats: e.target.value })}
                  placeholder="e.g. 100"
                  min="1"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={details.description}
                onChange={e => setDetails({ ...details, description: e.target.value })}
                placeholder="Brief agenda or description..."
                rows={5}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none transition-colors"
              />
            </div>
            
            {user?.role !== 'admin' && isNew && (
              <p className="text-xs text-amber-400/80 italic mt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <span className="font-bold">Note:</span> New workshops require admin approval before becoming active.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto py-4">
            <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-white/5">
              <div>
                <h4 className="text-white font-semibold mb-1">Registration Fields</h4>
                <p className="text-xs text-slate-400">Configure the questions participants must answer when registering.</p>
              </div>
              <button
                onClick={loadTemplate}
                className="text-xs font-semibold px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20 whitespace-nowrap"
              >
                Load Standard Template
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-16 bg-slate-900 rounded-2xl border border-white/5 border-dashed">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">No fields configured</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Start building your registration form by adding custom questions or load the standard template.</p>
                <button
                  onClick={addQuestion}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" /> Add First Question
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div key={q.id} className="bg-slate-900 border border-white/10 rounded-2xl p-5 relative group shadow-sm hover:border-white/20 transition-colors">
                    <div className="flex gap-5">
                      <div className="pt-2 text-slate-600 cursor-grab active:cursor-grabbing hover:text-white transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-5">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={q.text}
                              onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                              placeholder="Question text (e.g. Your Name)"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="w-full md:w-56 flex items-center gap-3">
                            <select
                              value={q.type}
                              onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="text">Short Answer</option>
                              <option value="email">Email Address</option>
                              <option value="date">Date</option>
                              <option value="time">Time</option>
                              <option value="select">Dropdown Menu</option>
                              <option value="checkbox">Multiple Checkboxes</option>
                              <option value="radio">Multiple Choice (Radio)</option>
                            </select>
                          </div>
                        </div>

                        {['select', 'checkbox', 'radio'].includes(q.type) && (
                          <div className="pl-5 space-y-3 border-l-2 border-slate-700 ml-2">
                            {q.options?.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                {q.type === 'radio' ? (
                                  <div className="w-4 h-4 border-2 border-slate-600 rounded-full flex-shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 border-2 border-slate-600 rounded flex-shrink-0" />
                                )}
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="flex-1 bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 px-2 py-1 text-sm text-slate-200 focus:outline-none transition-colors"
                                />
                                <button onClick={() => removeOption(q.id, optIndex)} className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button onClick={() => addOption(q.id)} className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 mt-2 px-2 py-1 rounded hover:bg-blue-500/10 transition-colors">
                              <Plus className="w-3.5 h-3.5" /> Add Option
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                          <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                              className="w-4 h-4 rounded bg-slate-900 border-white/20 text-blue-500 focus:ring-blue-500/50"
                            />
                            Required Field
                          </label>
                        </div>
                      </div>
                      <div className="pt-1">
                        <button onClick={() => removeQuestion(q.id)} className="text-slate-500 hover:text-red-400 p-2 bg-slate-950 border border-white/5 rounded-xl transition-colors hover:border-red-500/30">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button onClick={addQuestion} className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border border-dashed border-white/20 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold">
                  <Plus className="w-5 h-5" /> Add Another Question
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
