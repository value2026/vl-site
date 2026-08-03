import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Loader2, GripVertical, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ManageWorkshopFormModal({ workshop, onClose, onSave }) {
  const { token, API_URL } = useAuth();
  
  // Initialize with existing schema or default template if requested
  const [questions, setQuestions] = useState(
    workshop?.formSchema ? (Array.isArray(workshop.formSchema) ? workshop.formSchema : []) : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: 'New Question',
        type: 'text', // text, email, select, checkbox
        required: true,
        options: []
      }
    ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
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

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/workshops/${workshop.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ formSchema: questions })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update form schema');
      }
      onSave(); // Refresh data in parent
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = () => {
    if (!window.confirm("This will replace your current form. Continue?")) return;
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
      { id: '9', text: 'Select the mode of training', type: 'select', required: true, options: ['Online', 'Offline'] },
      { id: '10', text: 'Proposed Date', type: 'date', required: true, options: [] },
      { id: '11', text: 'Proposed Time', type: 'time', required: true, options: [] }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Manage Registration Form
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configure questions for {workshop?.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadTemplate}
              className="text-xs font-semibold px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20"
            >
              Load Training Template
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
              <p className="text-slate-400 text-sm mb-4">No questions added yet.</p>
              <button
                onClick={addQuestion}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="bg-slate-800/50 border border-white/10 rounded-xl p-4 relative group">
                  
                  <div className="flex gap-4">
                    <div className="pt-2 text-slate-500 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      {/* Question Text & Type Row */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={q.text}
                            onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                            placeholder="Question text"
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                          />
                        </div>
                        <div className="w-full sm:w-48 flex items-center gap-3">
                          <select
                            value={q.type}
                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                            className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                          >
                            <option value="text">Short Answer</option>
                            <option value="email">Email</option>
                            <option value="date">Date</option>
                            <option value="time">Time</option>
                            <option value="select">Dropdown</option>
                            <option value="checkbox">Checkboxes</option>
                            <option value="radio">Multiple Choice</option>
                          </select>
                        </div>
                      </div>

                      {/* Options (for select, checkbox, radio) */}
                      {['select', 'checkbox', 'radio'].includes(q.type) && (
                        <div className="pl-4 space-y-2 border-l-2 border-slate-700">
                          {q.options?.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <div className="w-4 h-4 border border-slate-600 rounded-sm bg-slate-900 flex-shrink-0" />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                                className="flex-1 bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 px-1 py-1 text-sm text-slate-300 focus:outline-none"
                              />
                              <button
                                onClick={() => removeOption(q.id, optIndex)}
                                className="text-slate-500 hover:text-red-400 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(q.id)}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
                          >
                            <Plus className="w-3 h-3" /> Add Option
                          </button>
                        </div>
                      )}

                      {/* Required Toggle */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                            className="w-3.5 h-3.5 rounded bg-slate-900 border-white/20 text-blue-500 focus:ring-blue-500/50"
                          />
                          Required Field
                        </label>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 bg-slate-900 border border-white/5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addQuestion}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-slate-900/50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Form Schema
          </button>
        </div>
        
      </div>
    </div>
  );
}
