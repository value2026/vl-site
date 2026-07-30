import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Plus, Trash2, Save, Loader2, GripVertical, Settings, Info, 
  FileText, X, LayoutTemplate, MapPin, Calendar, Users, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function WorkshopEditor() {
  const { token, API_URL, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const getTodayLocal = () => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().split('T')[0];
  };

  const isNew = id === 'new';
  const rolePath = location.pathname.split('/')[2];
  
  const [activeTab, setActiveTab] = useState('details');
  const [loadingInit, setLoadingInit] = useState(!isNew);
  const [workshop, setWorkshop] = useState(null);
  
  const [details, setDetails] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    mode: 'Online',
    seats: '',
  });

  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const updateQuestion = (qId, field, value) => setQuestions(questions.map(q => q.id === qId ? { ...q, [field]: value } : q));
  const removeQuestion = (qId) => setQuestions(questions.filter(q => q.id !== qId));

  const addOption = (questionId) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, options: [...(q.options || []), 'New Option'] } : q));
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



  const handleSave = async () => {
    if (!details.title.trim() || !details.date) {
      setError("Title and Date are required in the details section.");
      setActiveTab('details');
      return;
    }
    
    // Only validate past dates for new workshops (existing ones might already be in the past)
    if (isNew) {
      const selectedDate = new Date(details.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError("Workshop date cannot be in the past.");
        setActiveTab('details');
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...details,
        seats: details.seats ? parseInt(details.seats, 10) : null,
        formSchema: questions
      };

      const url = !isNew ? `${API_URL}/workshops/${id}/update` : `${API_URL}/workshops`;
      const method = 'POST';

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

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/workshops/${id}/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete workshop');
      }
      navigate(`/dashboard/${rolePath}/workshops`);
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(`/dashboard/${rolePath}/workshops`)}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700 text-white shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <Settings className="w-5 h-5 text-purple-400" />
              </span>
              {!isNew ? 'Edit Workshop' : 'Create New Workshop'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">Configure event details and registration requirements.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {!isNew && (user?.role === 'admin' || workshop?.createdBy?.id === user?.id) && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
          <button 
            onClick={() => navigate(`/dashboard/${rolePath}/workshops`)} 
            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !details.title.trim() || !details.date}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save & Publish
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
          <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${
              activeTab === 'details' 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 border border-purple-500/30 text-white shadow-lg' 
                : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'details' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">Basic Details</div>
              <div className="text-xs opacity-70 mt-0.5">Title, Date, Location</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${
              activeTab === 'form' 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 border border-purple-500/30 text-white shadow-lg' 
                : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'form' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">Registration Form</div>
              <div className="text-xs opacity-70 mt-0.5">Customize questions</div>
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl min-h-[500px]">
          
          {activeTab === 'details' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">Event Information</h2>
                <p className="text-slate-400 text-sm mt-1">Provide the essential details for your workshop.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Workshop Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={details.title}
                  onChange={e => setDetails({ ...details, title: e.target.value })}
                  placeholder="e.g. Virtual Labs Nodal Centre Training"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner placeholder:text-slate-700"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="date"
                      required
                      min={getTodayLocal()}
                      value={details.date}
                      onChange={e => setDetails({ ...details, date: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mode</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <select
                      value={details.mode}
                      onChange={e => setDetails({ ...details, mode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="In-person">In-person</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location / Link</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={details.location}
                      onChange={e => setDetails({ ...details, location: e.target.value })}
                      placeholder="Zoom link or Physical Address"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner placeholder:text-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Available Seats</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="number"
                      value={details.seats}
                      onChange={e => setDetails({ ...details, seats: e.target.value })}
                      placeholder="Leave blank for unlimited"
                      min="1"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Agenda</label>
                <textarea
                  value={details.description}
                  onChange={e => setDetails({ ...details, description: e.target.value })}
                  placeholder="Detail the agenda, requirements, and speakers..."
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner placeholder:text-slate-700 resize-y"
                />
              </div>

              {user?.role !== 'admin' && isNew && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-bold mb-1">Approval Required</h4>
                    <p className="text-sm text-amber-200/70">Your new workshop will remain in a "Pending" state until reviewed and approved by an administrator.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'form' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Registration Fields</h2>
                  <p className="text-slate-400 text-sm mt-1">Configure the form participants will fill out.</p>
                </div>

              </div>

              {questions.length === 0 ? (
                <div className="text-center py-20 bg-slate-950 rounded-3xl border border-slate-800 border-dashed">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-800">
                    <FileText className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Registration Fields</h3>
                  <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">Start building your registration form by adding custom questions.</p>
                  <button
                    onClick={addQuestion}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20"
                  >
                    <Plus className="w-5 h-5" /> Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((q, index) => (
                    <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 relative group shadow-sm hover:shadow-lg transition-all hover:border-purple-500/30">
                      <div className="flex gap-5">
                        <div className="pt-2 text-slate-600 cursor-grab active:cursor-grabbing hover:text-white transition-colors">
                          <GripVertical className="w-6 h-6" />
                        </div>
                        <div className="flex-1 space-y-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Question Text</label>
                              <input
                                type="text"
                                value={q.text}
                                onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                placeholder="e.g. Your Full Name"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner font-medium"
                              />
                            </div>
                            <div className="w-full md:w-64">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Answer Type</label>
                              <select
                                value={q.type}
                                onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer shadow-inner font-medium"
                              >
                                <option value="text">Short Answer</option>
                                <option value="email">Email Address</option>
                                <option value="date">Date</option>
                                <option value="time">Time</option>
                                <option value="select">Dropdown Menu</option>
                                <option value="checkbox">Multiple Checkboxes</option>
                                <option value="radio">Multiple Choice</option>
                              </select>
                            </div>
                          </div>

                          {['select', 'checkbox', 'radio'].includes(q.type) && (
                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-3">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Options</h4>
                              {q.options?.map((opt, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-3">
                                  {q.type === 'radio' ? (
                                    <div className="w-5 h-5 border-2 border-slate-600 rounded-full flex-shrink-0" />
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-slate-600 rounded flex-shrink-0" />
                                  )}
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                                    placeholder={`Option ${optIndex + 1}`}
                                    className="flex-1 bg-transparent border-b-2 border-slate-700 hover:border-slate-500 focus:border-purple-500 px-2 py-1 text-white focus:outline-none transition-colors"
                                  />
                                  <button onClick={() => removeOption(q.id, optIndex)} className="text-slate-500 hover:text-red-400 p-2 rounded-xl hover:bg-slate-800 transition-colors">
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                              <button onClick={() => addOption(q.id)} className="text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors w-full justify-center border border-purple-500/20 border-dashed">
                                <Plus className="w-4 h-4" /> Add Another Option
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={q.required}
                                  onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                                  className="sr-only"
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${q.required ? 'bg-purple-500' : 'bg-slate-700'}`}>
                                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${q.required ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                              </div>
                              <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Required Field</span>
                            </label>
                          </div>
                        </div>
                        <div className="pt-2">
                          <button onClick={() => removeQuestion(q.id)} className="text-slate-500 hover:text-red-400 p-3 bg-slate-900 border border-slate-800 rounded-xl transition-colors hover:border-red-500/30 hover:bg-red-500/10" title="Delete Question">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button onClick={addQuestion} className="w-full flex items-center justify-center gap-2 px-4 py-6 rounded-3xl border-2 border-dashed border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-500 transition-all text-sm font-bold">
                    <Plus className="w-6 h-6" /> Add Another Question
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteConfirm(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Workshop?</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  You are about to permanently delete <strong className="text-white">{details.title}</strong>. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    disabled={deleting}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
