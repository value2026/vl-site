import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Plus, FileText, Calendar, Clock, 
  Trash2, Bell, Users, Search, Loader2, AlertCircle, 
  CheckCircle2, X, ChevronRight, BookOpen
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all';

export default function TeacherAssignments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled' or 'papers'
  const [papers, setPapers]       = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Modal States
  const [paperModalOpen, setPaperModalOpen]       = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // New Paper Form State
  const [paperForm, setPaperForm] = useState({
    title: '',
    questions: [
      { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }
    ]
  });
  const [paperSaving, setPaperSaving] = useState(false);

  // Scheduling Form State
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [students, setStudents]           = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loadingStudents, setLoadingStudents]       = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    maxAttempts: '1',
    resultDisplay: 'immediate'
  });
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Load backend data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [papersRes, schedRes] = await Promise.all([
        api.get('/assignments/papers'),
        api.get('/assignments/active-assignments')
      ]);

      if (papersRes.ok) setPapers(await papersRes.json());
      if (schedRes.ok) setScheduled(await schedRes.json());
    } catch (e) {
      console.error(e);
      setError('Failed to load assignments data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load students for scheduling
  useEffect(() => {
    if (!scheduleModalOpen) return;
    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await api.get('/users?filterRole=student');
        if (res.ok) {
          const list = await res.json();
          setStudents(list);
          // Auto-select all by default
          setSelectedStudentIds(list.map(s => s.id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, [scheduleModalOpen]);

  // Handle Question Paper creation
  const handleAddQuestion = () => {
    setPaperForm(prev => ({
      ...prev,
      questions: [...prev.questions, { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]
    }));
  };

  const handleRemoveQuestion = (idx) => {
    if (paperForm.questions.length === 1) return;
    setPaperForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleQuestionTextChange = (idx, text) => {
    setPaperForm(prev => {
      const list = [...prev.questions];
      list[idx].questionText = text;
      return { ...prev, questions: list };
    });
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    setPaperForm(prev => {
      const list = [...prev.questions];
      const opts = [...list[qIdx].options];
      opts[optIdx] = val;
      list[qIdx].options = opts;
      return { ...prev, questions: list };
    });
  };

  const handleCorrectIndexChange = (qIdx, val) => {
    setPaperForm(prev => {
      const list = [...prev.questions];
      list[qIdx].correctOptionIndex = parseInt(val, 10);
      return { ...prev, questions: list };
    });
  };

  const handleSavePaper = async (e) => {
    e.preventDefault();
    if (!paperForm.title.trim()) return setError('Please enter a paper title');
    
    // Basic validation
    for (let i = 0; i < paperForm.questions.length; i++) {
      const q = paperForm.questions[i];
      if (!q.questionText.trim()) return setError(`Please fill question text for question ${i + 1}`);
      if (q.options.some(opt => !opt.trim())) return setError(`Please fill all 4 options for question ${i + 1}`);
    }

    setPaperSaving(true);
    setError('');
    try {
      const res = await api.post('/assignments/papers', paperForm);
      if (res.ok) {
        setSuccess('Question paper saved successfully!');
        setPaperModalOpen(false);
        setPaperForm({
          title: '',
          questions: [{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]
        });
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save question paper');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setPaperSaving(false);
    }
  };

  const handleDeletePaper = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question paper? This cannot be undone.')) return;
    try {
      const res = await api.post(`/assignments/papers/${id}/delete`);
      if (res.ok) {
        setSuccess('Question paper deleted.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Scheduling
  const handleOpenSchedule = (paper) => {
    setSelectedPaper(paper);
    setScheduleForm({
      title: `${paper.title} - Exam`,
      startTime: '',
      endTime: '',
      maxAttempts: '1',
      resultDisplay: 'immediate'
    });
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.startTime || !scheduleForm.endTime) {
      return setError('Please provide start and end times');
    }
    if (selectedStudentIds.length === 0) {
      return setError('Please select at least one student');
    }

    setScheduleSaving(true);
    setError('');
    try {
      const payload = {
        ...scheduleForm,
        questionPaperId: selectedPaper.id,
        studentIds: selectedStudentIds
      };
      const res = await api.post('/assignments/schedule', payload);
      if (res.ok) {
        setSuccess('Assignment scheduled successfully!');
        setScheduleModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to schedule assignment');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while scheduling.');
    } finally {
      setScheduleSaving(false);
    }
  };

  // Publish manual results
  const handlePublishResults = async (id) => {
    try {
      const res = await api.post(`/assignments/publish/${id}/update`);
      if (res.ok) {
        setSuccess('Student results published successfully!');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Send manual reminder notification
  const handleSendReminder = async (id) => {
    try {
      const res = await api.post(`/assignments/remind/${id}`);
      if (res.ok) {
        setSuccess('Exam reminders dispatched to students!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getAssignmentStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return { label: 'Yet to Start', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    if (now > end) return { label: 'Closed', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    return { label: 'Active', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <DashboardLayout title="Assignments & Exams">
      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto hover:opacity-80"><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto hover:opacity-80"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/5">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'scheduled'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
          >
            Scheduled Slots
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'papers'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
          >
            Question Papers
          </button>
        </div>

        {activeTab === 'papers' && (
          <button
            onClick={() => { setError(''); setPaperModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Paper
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <span>Loading data...</span>
        </div>
      ) : activeTab === 'scheduled' ? (
        /* Scheduled Slots tab view */
        scheduled.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-white/5 rounded-2xl p-6 text-slate-500 flex flex-col items-center justify-center">
            <ClipboardList className="w-10 h-10 text-slate-700 mb-3" />
            <h4 className="text-white font-semibold text-base mb-1">No scheduled assignments yet</h4>
            <p className="text-xs text-slate-450 max-w-sm mb-4">Go to the "Question Papers" tab to schedule exams for your students.</p>
            <button
              onClick={() => setActiveTab('papers')}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 hover:underline"
            >
              View question papers <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduled.map(slot => {
              const status = getAssignmentStatus(slot.startTime, slot.endTime);
              return (
                <div key={slot.id} className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="text-white font-bold text-base tracking-tight">{slot.title}</h4>
                        <p className="text-slate-450 text-[11px] mt-0.5">Paper: {slot.questionPaper.title}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${status.badge}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>Start: {new Date(slot.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Deadline: {new Date(slot.endTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span>Target: {slot.students.length} Student(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-white/5">
                    <button
                      onClick={() => navigate(`/dashboard/teacher/assignments/report/${slot.id}`)}
                      className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all text-center"
                    >
                      View Report
                    </button>

                    {status.label !== 'Closed' && (
                      <button
                        onClick={() => handleSendReminder(slot.id)}
                        title="Send Notification Reminder to Students"
                        className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Bell className="w-3.5 h-3.5" /> Remind
                      </button>
                    )}

                    {slot.resultDisplay === 'manual' && !slot.resultsPublished && (
                      <button
                        onClick={() => handlePublishResults(slot.id)}
                        className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-all"
                      >
                        Publish Results
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Question papers tab view */
        papers.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-white/5 rounded-2xl p-6 text-slate-500 flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 text-slate-700 mb-3" />
            <h4 className="text-white font-semibold text-base mb-1">No question papers created</h4>
            <p className="text-xs text-slate-450 max-w-sm mb-4">Create your first MCQ question bank to schedule tests for students in your nodal centre.</p>
            <button
              onClick={() => { setError(''); setPaperModalOpen(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
            >
              Create Question Paper
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {papers.map(paper => (
              <div key={paper.id} className="bg-slate-900/40 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between min-h-48 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-white font-bold text-sm leading-snug truncate">{paper.title}</h4>
                  <p className="text-slate-500 text-xs mt-1.5">
                    {Array.isArray(paper.questions) ? paper.questions.length : 0} MCQ Questions
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleOpenSchedule(paper)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Schedule Slot
                  </button>
                  <button
                    onClick={() => handleDeletePaper(paper.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── CREATE PAPER MODAL ── */}
      {paperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setPaperModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white text-lg font-bold flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <FileText className="w-5 h-5 text-blue-400" /> Create Question Paper
            </h3>

            <form onSubmit={handleSavePaper} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Paper Title / Exam Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Final Exam, Pre-Test 1"
                  className={inputCls}
                  value={paperForm.title}
                  onChange={e => setPaperForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Questions List */}
              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1">
                {paperForm.questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">Question #{qIdx + 1}</span>
                      {paperForm.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-xs text-red-400 hover:text-red-300 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Enter question text..."
                        className={inputCls}
                        value={q.questionText}
                        onChange={e => handleQuestionTextChange(qIdx, e.target.value)}
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">{String.fromCharCode(65 + optIdx)}.</span>
                          <input
                            type="text"
                            required
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            value={opt}
                            onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Index */}
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-450 font-semibold">Correct Option Index:</label>
                      <select
                        className="bg-slate-950 text-xs text-white border border-white/15 rounded-lg px-2 py-1 focus:outline-none"
                        value={q.correctOptionIndex}
                        onChange={e => handleCorrectIndexChange(qIdx, e.target.value)}
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  + Add Question
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPaperModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paperSaving}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-750 transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                  >
                    {paperSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Question Paper'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SCHEDULE TEST MODAL ── */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setScheduleModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white text-lg font-bold flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <Calendar className="w-5 h-5 text-blue-400" /> Schedule Assignment
            </h3>

            <form onSubmit={handleSaveSchedule} className="space-y-6">
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 mb-4">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mb-1">Target Question Bank</span>
                <span className="text-sm font-semibold text-white">{selectedPaper?.title}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Custom Slot Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCQ Test - Unit 1"
                    className={inputCls}
                    value={scheduleForm.title}
                    onChange={e => setScheduleForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Max Attempts
                  </label>
                  <select
                    className={inputCls}
                    value={scheduleForm.maxAttempts}
                    onChange={e => setScheduleForm(prev => ({ ...prev, maxAttempts: e.target.value }))}
                  >
                    <option value="1">1 Attempt</option>
                    <option value="2">2 Attempts</option>
                    <option value="3">3 Attempts</option>
                    <option value="5">5 Attempts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className={inputCls}
                    value={scheduleForm.startTime}
                    onChange={e => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className={inputCls}
                    value={scheduleForm.endTime}
                    onChange={e => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Results Release visibility
                </label>
                <select
                  className={inputCls}
                  value={scheduleForm.resultDisplay}
                  onChange={e => setScheduleForm(prev => ({ ...prev, resultDisplay: e.target.value }))}
                >
                  <option value="immediate">Release Immediately (After student submits)</option>
                  <option value="manual">Release Manually (Only after teacher publishing)</option>
                </select>
              </div>

              {/* Student selection board */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select Target Students * ({selectedStudentIds.length} Selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds(students.map(s => s.id))}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-[10px] text-slate-650">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds([])}
                      className="text-[10px] text-rose-450 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search students in your institution..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                </div>

                {loadingStudents ? (
                  <div className="py-6 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-center py-6 text-slate-500 text-xs italic">No students registered in your institution.</p>
                ) : (
                  <div className="max-h-[180px] overflow-y-auto space-y-1.5 border border-white/5 rounded-2xl p-3 bg-white/2 pr-1.5">
                    {filteredStudents.map(student => {
                      const active = selectedStudentIds.includes(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => {
                            setSelectedStudentIds(prev => 
                              active ? prev.filter(id => id !== student.id) : [...prev, student.id]
                            );
                          }}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all border ${
                            active
                              ? 'bg-blue-600/10 border-blue-500/25 text-white'
                              : 'bg-white/2 hover:bg-white/5 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            readOnly
                            className="rounded border-white/10 bg-slate-950 text-blue-500 focus:ring-0 focus:ring-offset-0 pointer-events-none"
                          />
                          <div>
                            <span className="font-bold">{student.name}</span>
                            <span className="text-[10px] opacity-60 ml-2">({student.email})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleSaving}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-750 transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                >
                  {scheduleSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scheduling...
                    </>
                  ) : (
                    'Confirm Schedule'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
