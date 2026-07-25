import React, { useState, useEffect } from 'react';
import { X, Loader2, Download, Users, Mail, Building2, User, Calendar, MapPin, Eye, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WorkshopRegistrationsModal({ workshop, onClose }) {
  const { user, token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [workshop.id]);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/pages/workshop-${workshop.id}/survey/responses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 404) {
        setRegistrations([]);
        setLoading(false);
        return;
      }
      
      if (!res.ok) throw new Error('Failed to fetch registrations');
      
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    window.open(`${import.meta.env.VITE_API_URL || window.location.origin}/api/pages/workshop-${workshop.id}/survey/responses?format=csv&token=${token}`, '_blank');
  };
  
  // Helper to map submission data (keys are IDs) to an object with readable question text as keys
  const getReadableData = (rawData) => {
    const readable = {};
    const schema = workshop?.formSchema || [];
    
    // Create a lookup for id -> question text
    const qMap = {};
    schema.forEach(q => {
      qMap[q.id] = q.text;
    });

    for (const key in rawData) {
      const qText = qMap[key] || key;
      readable[qText] = rawData[key];
    }
    return readable;
  };

  // Try to find common fields to display in the table
  const extractField = (readableData, keysToTry) => {
    for (const key in readableData) {
      const val = readableData[key];
      // Check if the question text contains the keyword
      for (const keyword of keysToTry) {
        if (key.toLowerCase().includes(keyword.toLowerCase())) {
          // If it's an array (checkboxes), join it
          if (Array.isArray(val)) return val.join(', ');
          return val;
        }
      }
    }
    return '-';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/30">
          <div>
            <div className="flex items-center gap-3">
              {selectedRegistration ? (
                <button 
                  onClick={() => setSelectedRegistration(null)}
                  className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 text-purple-400">
                  <Users className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedRegistration ? 'Registration Details' : 'Workshop Registrations'}
                </h3>
                <p className="text-sm text-slate-400">{workshop.title}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedRegistration ? (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-slate-950 border border-slate-700/50 rounded-xl p-6 shadow-inner">
                <div className="mb-6 flex justify-between items-center pb-4 border-b border-slate-800">
                  <h4 className="text-lg font-semibold text-white">Submitted Answers</h4>
                  <span className="text-xs text-slate-500">
                    Registered on: {new Date(selectedRegistration.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-5">
                  {Object.entries(getReadableData(selectedRegistration.data?.data ? selectedRegistration.data.data : (selectedRegistration.data || {}))).map(([question, answer], i) => (
                    <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/50">
                      <p className="text-sm text-slate-400 mb-1 font-medium">{question}</p>
                      <p className="text-base text-slate-200">
                        {Array.isArray(answer) ? answer.join(', ') : (answer || <span className="italic text-slate-600">No answer provided</span>)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-white">{registrations.length}</span> Total Registrations
              </div>
              <div className="w-px h-4 bg-slate-700 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-blue-400" />
                {new Date(workshop.date).toLocaleDateString()}
              </div>
            </div>
            {registrations.length > 0 && (
              <button 
                onClick={handleDownloadCsv}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors border border-white/10"
              >
                <Download className="w-4 h-4" /> Download CSV
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading registrations...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
              {error}
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <Users className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="text-lg font-medium text-slate-200 mb-2">No registrations yet</h4>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                No one has registered for this workshop yet. Check back later once the registration link has been shared.
              </p>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-700/50 rounded-xl overflow-x-auto shadow-inner">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Date Registered</th>
                    <th className="px-5 py-4 font-semibold">Name / Primary Info</th>
                    <th className="px-5 py-4 font-semibold">Email / Contact</th>
                    <th className="px-5 py-4 font-semibold">Institution / Organization</th>
                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {registrations.map((r) => {
                    // Backend saves req.body directly, which is { data: formData }
                    const rawData = r.data?.data ? r.data.data : (r.data || {});
                    const readableData = getReadableData(rawData);
                    
                    return (
                      <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap text-slate-400">
                          {new Date(r.createdAt).toLocaleString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-200">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            {extractField(readableData, ['name', 'first_name', 'full_name', 'participant', 'faculty', 'student'])}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-blue-300">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            {extractField(readableData, ['email', 'e-mail', 'mail', 'contact', 'phone'])}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          <div className="flex items-center gap-2 truncate max-w-xs" title={extractField(readableData, ['institution', 'nodal', 'college', 'organization', 'school', 'university'])}>
                            <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            {extractField(readableData, ['institution', 'nodal', 'college', 'organization', 'school', 'university'])}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedRegistration(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-xs font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
