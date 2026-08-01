import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SurveyResponsesView from '../../components/dashboard/SurveyResponsesView';
import { ClipboardList, GraduationCap, Briefcase } from 'lucide-react';

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
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('student-survey')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 ${
              activeTab === 'student-survey'
                ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${activeTab === 'student-survey' ? 'text-emerald-400' : 'text-slate-500'}`} />
            Student Survey
            <span className={`py-0.5 px-2.5 rounded-full text-[11px] font-bold tracking-wide transition-colors ${
              activeTab === 'student-survey' ? 'bg-emerald-500/30 text-emerald-400' : 'bg-slate-900 text-slate-400'
            }`}>
              {counts['student-survey']}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('faculty-survey')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 ${
              activeTab === 'faculty-survey'
                ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Briefcase className={`w-4 h-4 ${activeTab === 'faculty-survey' ? 'text-emerald-400' : 'text-slate-500'}`} />
            Faculty Survey
            <span className={`py-0.5 px-2.5 rounded-full text-[11px] font-bold tracking-wide transition-colors ${
              activeTab === 'faculty-survey' ? 'bg-emerald-500/30 text-emerald-400' : 'bg-slate-900 text-slate-400'
            }`}>
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
