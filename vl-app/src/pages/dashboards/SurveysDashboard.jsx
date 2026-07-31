import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SurveyResponsesView from '../../components/dashboard/SurveyResponsesView';
import { ClipboardList } from 'lucide-react';

export default function SurveysDashboard() {
  const { token, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('student-survey');
  const [counts, setCounts] = useState({ 'student-survey': 0, 'faculty-survey': 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [studentRes, facultyRes] = await Promise.all([
          fetch(`${API_URL}/pages/student-survey/survey/responses`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/pages/faculty-survey/survey/responses`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const studentData = studentRes.ok ? await studentRes.json() : [];
        const facultyData = facultyRes.ok ? await facultyRes.json() : [];
        setCounts({
          'student-survey': Array.isArray(studentData) ? studentData.length : 0,
          'faculty-survey': Array.isArray(facultyData) ? facultyData.length : 0
        });
      } catch (err) {
        console.error("Failed to fetch survey counts", err);
      }
    };
    fetchCounts();
  }, [API_URL, token]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-bold flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-emerald-400" />
            Platform Surveys
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Review and export responses from all active platform surveys.
          </p>
        </div>
        
        {/* Survey Selection Tabs */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('student-survey')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'student-survey'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Student Survey
            <span className={`py-0.5 px-2 rounded-full text-xs ${activeTab === 'student-survey' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
              {counts['student-survey']}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('faculty-survey')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'faculty-survey'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Faculty Survey
            <span className={`py-0.5 px-2 rounded-full text-xs ${activeTab === 'faculty-survey' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
              {counts['faculty-survey']}
            </span>
          </button>
        </div>
      </div>

      <SurveyResponsesView 
        pageSlug={activeTab} 
        token={token} 
        API_URL={API_URL} 
      />
    </div>
  );
}
