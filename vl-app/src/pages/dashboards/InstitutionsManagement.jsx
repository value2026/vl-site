import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, RefreshCw, AlertCircle, CheckCircle2, Loader2, Save, X, Trash2, Upload, Download, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function InstitutionsManagement() {
  const { token, API_URL } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingInst, setEditingInst] = useState(null);
  const [form, setForm] = useState({ collegeId: '', name: '', code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Bulk Import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkData, setBulkData] = useState([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/institutions`);
      const data = await res.json();
      setInstitutions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch institutions');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const openAddModal = () => {
    setEditingInst(null);
    setForm({ collegeId: '', name: '', code: '' });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (inst) => {
    setEditingInst(inst);
    setForm({
      collegeId: inst.collegeId || (inst.legacyId ? inst.legacyId.toString() : '') || '',
      name: inst.name || '',
      code: inst.code || ''
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const url = editingInst ? `${API_URL}/institutions/${editingInst.id}/update` : `${API_URL}/institutions`;
      const method = 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || null,
          collegeId: form.collegeId.trim() || null,
          legacyId: form.collegeId.trim() && !isNaN(parseInt(form.collegeId.trim(), 10)) ? parseInt(form.collegeId.trim(), 10) : null
        })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || `Failed to ${editingInst ? 'update' : 'create'} institution`);
      }
      setShowModal(false);
      setEditingInst(null);
      setForm({ collegeId: '', name: '', code: '' });
      fetchInstitutions();
      setSuccess(`Institution ${editingInst ? 'updated' : 'created'} successfully.`);
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeleteInstitution = (inst) => {
    setDeleteConfirm(inst);
  };

  const confirmDeleteInstitution = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    setActionLoading(id);
    
    try {
      const res = await fetch(`${API_URL}/institutions/${id}/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete institution');
      
      fetchInstitutions();
      setSuccess('Institution deleted successfully.');
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk TSV/CSV parsing
  const parseBulkInput = (rawText) => {
    if (!rawText.trim()) {
      setBulkData([]);
      return;
    }
    const lines = rawText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      setBulkData([]);
      return;
    }

    // Determine delimiter: tab or comma
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    
    // Parse headers
    const headerRow = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
    
    let nameIdx = -1;
    let codeIdx = -1;
    let legacyIdIdx = -1;
    let oldCreatedAtIdx = -1;

    // Try mapping headers based on user description:
    // College ID | Institute Name | Abbreviation
    headerRow.forEach((h, idx) => {
      if (h.includes('institute name') || h.includes('institution name') || h === 'name') {
        nameIdx = idx;
      } else if (h.includes('college id') || h.includes('institute id') || h.includes('legacy id') || h === 'id') {
        legacyIdIdx = idx;
      } else if (h.includes('abrivation') || h.includes('abbreviation') || h.includes('code') || h.includes('abbr')) {
        codeIdx = idx;
      }
    });

    // Fallbacks to default TSV positions if headers not recognized
    if (nameIdx === -1) {
      if (headerRow.length >= 2) {
        // Col 0: College ID, Col 1: Institute Name, Col 2: Abbreviation
        legacyIdIdx = 0;
        nameIdx = 1;
        codeIdx = 2;
      } else {
        nameIdx = 0;
      }
    }

    const parsed = [];
    const startIndex = 1; // skip header row

    for (let i = startIndex; i < lines.length; i++) {
      const columns = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (columns.length === 0 || (columns.length === 1 && !columns[0])) continue;

      const name = nameIdx !== -1 && columns[nameIdx] ? columns[nameIdx] : '';
      const legacyId = legacyIdIdx !== -1 && columns[legacyIdIdx] ? columns[legacyIdIdx] : '';
      const code = codeIdx !== -1 && columns[codeIdx] ? columns[codeIdx] : '';
      const oldCreatedAt = oldCreatedAtIdx !== -1 && columns[oldCreatedAtIdx] ? columns[oldCreatedAtIdx] : '';

      if (name) {
        parsed.push({
          name,
          code: code || null,
          collegeId: legacyId || null,
          legacyId: legacyId && !isNaN(parseInt(legacyId, 10)) ? parseInt(legacyId, 10) : null,
          oldCreatedAt: oldCreatedAt || null,
          status: 'Valid'
        });
      } else {
        parsed.push({
          name: '[Missing Name]',
          code: code || '',
          collegeId: legacyId || '',
          legacyId: legacyId || '',
          oldCreatedAt: oldCreatedAt || '',
          status: 'Invalid: Name is required'
        });
      }
    }
    setBulkData(parsed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setBulkText(text);
      parseBulkInput(text);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = ['College ID', 'Institute Name', 'Abbreviation'];
    const rows = [
      ['2', 'VMKV Engineering College', 'vmkv'],
      ['5', 'MET Nashik', 'met'],
      ['6', 'Global Academy Of Technolgy', 'glat/gat']
    ];
    const content = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'colleges_template.tsv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkSubmit = async () => {
    const validRows = bulkData.filter(d => d.status === 'Valid');
    if (validRows.length === 0) {
      alert('No valid rows to import.');
      return;
    }
    setBulkImporting(true);
    try {
      const res = await fetch(`${API_URL}/institutions/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ institutions: validRows })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Bulk upload failed');
      setBulkResult(data);
      fetchInstitutions();
      setSuccess('Bulk import completed successfully.');
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    } finally {
      setBulkImporting(false);
    }
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setBulkText('');
    setBulkData([]);
    setBulkResult(null);
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            Nodal Centres / Institutions
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage partner institutions for Virtual Labs.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchInstitutions}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-all"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Institution
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/5 rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">College ID</th>
                <th className="px-4 py-3">Institution Name</th>
                <th className="px-4 py-3">Abbreviation / Code</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {institutions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No institutions registered yet.
                  </td>
                </tr>
              ) : (
                institutions.map(inst => (
                  <tr key={inst.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-300 text-sm">{inst.collegeId || inst.legacyId || '-'}</td>
                    <td className="px-4 py-3 font-medium text-white">{inst.name}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{inst.code || '-'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{inst.oldCreatedAt || '-'}</td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(inst)}
                        disabled={actionLoading === inst.id}
                        className="text-slate-400 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
                        title="Edit institution"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => requestDeleteInstitution(inst)}
                        disabled={actionLoading === inst.id}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
                        title="Delete institution"
                      >
                        {actionLoading === inst.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingInst ? 'Edit Institution' : 'Add New Institution'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">College ID</label>
                <input
                  type="text"
                  value={form.collegeId}
                  onChange={e => setForm({ ...form, collegeId: e.target.value })}
                  placeholder="e.g. 101 or COL-01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Amrita Vishwa Vidyapeetham"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Abbreviation / Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. AMRITA or AVV"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeBulkModal} />
          <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Bulk Import Institutions
              </h3>
              <button onClick={closeBulkModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkResult ? (
              <div className="space-y-6 py-4 flex-1 overflow-y-auto">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                  <h4 className="text-emerald-400 font-bold mb-1">Import Completed Successfully</h4>
                  <p className="text-slate-300 text-sm">{bulkResult.message}</p>
                </div>
                {bulkResult.skippedCount > 0 && (
                  <div>
                    <h5 className="text-amber-400 font-bold text-sm mb-3">Skipped Rows Details:</h5>
                    <div className="overflow-x-auto border border-white/5 rounded-xl max-h-60">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-white/5 text-slate-400 font-semibold uppercase">
                          <tr>
                            <th className="px-4 py-2.5">Row ID</th>
                            <th className="px-4 py-2.5">Name</th>
                            <th className="px-4 py-2.5">Abbreviation</th>
                            <th className="px-4 py-2.5">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {bulkResult.skippedDetails.map((detail, idx) => (
                            <tr key={idx} className="hover:bg-white/5">
                              <td className="px-4 py-2">{detail.item?.legacyId || '-'}</td>
                              <td className="px-4 py-2 font-medium text-white">{detail.item?.name || '-'}</td>
                              <td className="px-4 py-2">{detail.item?.code || '-'}</td>
                              <td className="px-4 py-2 text-amber-400">{detail.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={closeBulkModal}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">TSV/CSV Format Requirements</span>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download template.tsv
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Upload a <strong>colleges.tsv</strong> file or copy-paste directly from Excel/Spreadsheet. Columns should be: 
                    <code className="bg-black/40 px-1.5 py-0.5 rounded text-blue-300 mx-1">College ID</code> | 
                    <code className="bg-black/40 px-1.5 py-0.5 rounded text-blue-300 mx-1">Institute Name</code> | 
                    <code className="bg-black/40 px-1.5 py-0.5 rounded text-blue-300 mx-1">Abbreviation</code>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 min-h-0 flex-1">
                  <div className="flex flex-col h-full">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                      <span>Paste Raw Tab/Comma separated text</span>
                      <span className="text-[10px] text-slate-500 font-normal">First row must contain headers</span>
                    </label>
                    <textarea
                      value={bulkText}
                      onChange={(e) => {
                        setBulkText(e.target.value);
                        parseBulkInput(e.target.value);
                      }}
                      placeholder={`College ID\tInstitute Name\tAbbreviation\n2\tVMKV Engineering College\tvmkv`}
                      className="w-full flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[200px]"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Or select a file:</span>
                      <input
                        type="file"
                        accept=".tsv,.csv,.txt"
                        onChange={handleFileUpload}
                        className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 file:cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col h-full min-h-0">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                      <span>Preview ({bulkData.length} rows parsed)</span>
                      <span>Valid: {bulkData.filter(d => d.status === 'Valid').length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto border border-white/10 rounded-2xl bg-white/5 max-h-[350px]">
                      {bulkData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-xs italic p-4 text-center">
                          Pasted data or uploaded file preview will show here.
                        </div>
                      ) : (
                        <table className="w-full text-xs text-left">
                          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase sticky top-0">
                            <tr>
                              <th className="px-3 py-2">ID</th>
                              <th className="px-3 py-2">Name</th>
                              <th className="px-3 py-2">Abbr</th>
                              <th className="px-3 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-300">
                            {bulkData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-white/5">
                                <td className="px-3 py-2">{row.legacyId || '-'}</td>
                                <td className="px-3 py-2 font-medium text-white truncate max-w-[150px]" title={row.name}>{row.name}</td>
                                <td className="px-3 py-2">{row.code || '-'}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    row.status === 'Valid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10 flex-shrink-0">
                  <button
                    type="button"
                    onClick={closeBulkModal}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    disabled={bulkImporting || bulkData.filter(d => d.status === 'Valid').length === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50"
                  >
                    {bulkImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Confirm & Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-900 border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Confirm Deletion</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Are you sure you want to permanently delete <strong className="text-white">{deleteConfirm.name}</strong>?
                  <br /><br />
                  <span className="text-red-400 font-semibold">Note: You cannot delete an institution if it still has users associated with it. This action cannot be undone.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteInstitution}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-colors"
                  >
                    Yes, Delete
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
