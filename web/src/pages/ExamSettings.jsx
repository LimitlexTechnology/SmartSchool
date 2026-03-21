import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Target, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  AlertCircle,
  TrendingUp,
  Layout,
  Layers,
  Search,
  BookOpen,
  Loader2
} from 'lucide-react';

const ExamSettings = () => {
  const [activeTab, setActiveTab] = useState('grading');
  const [grades, setGrades] = useState([]);
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exam-settings');
      const data = await res.json();
      setGrades(data.grades || []);
      setRules(data.rules || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/exam-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades, rules })
      });
      if (res.ok) alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGradeChange = (id, field, value) => {
    setGrades(prev => prev.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  const deleteGrade = (id) => {
    setGrades(prev => prev.filter(g => g.id !== id));
  };

  const addGrade = () => {
    const newId = grades.length > 0 ? Math.max(...grades.map(g => g.id)) + 1 : 1;
    setGrades([...grades, { id: newId, label: 'New', min: 0, max: 0, remark: '' }]);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Exam Settings</h1>
          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Global Exam Configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSettings}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 transition shadow-soft-sm"
          >
            <RotateCcw size={14} className="text-primary-teal" />
            Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal/90 transition shadow-lg shadow-primary-teal/20 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex gap-8 relative min-h-[500px]">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded-[2.5rem]"><Loader2 className="animate-spin text-primary-teal" /></div>}
        
        {/* Sidebar Tabs */}
        <div className="w-64 space-y-2">
          {[
            { id: 'grading', label: 'Grading Scales', icon: Target },
            { id: 'rules', label: 'Examination Rules', icon: AlertCircle },
            { id: 'reports', label: 'Report Settings', icon: Layout },
            { id: 'terms', label: 'Academic Terms', icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-white border-primary-teal shadow-soft-sm text-primary-teal' 
                  : 'bg-transparent border-transparent text-muted-text hover:bg-gray-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === tab.id ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20' : 'bg-gray-100'
              }`}>
                <tab.icon size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'grading' && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-dark-text uppercase tracking-tight mb-1">Grading Scale</h3>
                  <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest leading-none">Define how marks are converted to grades</p>
                </div>
                <button 
                  onClick={addGrade}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-teal/5 text-primary-teal rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal/10 transition"
                >
                  <Plus size={14} />
                  Add Grade
                </button>
              </div>

              <div className="space-y-4">
                {grades.map((grade) => (
                  <div key={grade.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-50 group hover:border-primary-teal/20 hover:bg-white transition-all">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-dark-text shadow-soft-sm">
                      <input 
                        type="text" 
                        className="w-full bg-transparent text-center focus:outline-none" 
                        value={grade.label} 
                        onChange={(e) => handleGradeChange(grade.id, 'label', e.target.value)}
                      />
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-8">
                      <div>
                        <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest mb-1">Min Mark</p>
                        <input 
                          type="number" 
                          className="w-full bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-dark-text focus:border-primary-teal outline-none transition"
                          value={grade.min}
                          onChange={(e) => handleGradeChange(grade.id, 'min', e.target.value)}
                        />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest mb-1">Max Mark</p>
                        <input 
                          type="number" 
                          className="w-full bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-dark-text focus:border-primary-teal outline-none transition"
                          value={grade.max}
                          onChange={(e) => handleGradeChange(grade.id, 'max', e.target.value)}
                        />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest mb-1">Remark</p>
                        <input 
                          type="text" 
                          className="w-full bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-dark-text focus:border-primary-teal outline-none transition"
                          value={grade.remark}
                          onChange={(e) => handleGradeChange(grade.id, 'remark', e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteGrade(grade.id)}
                      className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl p-8">
              <h3 className="text-sm font-black text-dark-text uppercase tracking-tight mb-8">Examination Rules</h3>
              <div className="space-y-6">
                {[
                  { id: 'autoCalculatePositions', label: 'Auto-calculate Positions', desc: 'Automatically rank students by their total marks' },
                  { id: 'showPositionOnReport', label: 'Show Position on Report', desc: 'Include the student rank in final printed reports' },
                  { id: 'allowTeacherModifications', label: 'Allow Teacher Modifications', desc: 'Teachers can edit marks after submission' },
                  { id: 'requireAdminApproval', label: 'Require Admin Approval', desc: 'Final marks must be approved by an administrator' },
                ].map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                    <div>
                      <p className="text-xs font-black text-dark-text uppercase tracking-tight mb-1">{rule.label}</p>
                      <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest leading-none">{rule.desc}</p>
                    </div>
                    <button 
                      onClick={() => setRules(prev => ({ ...prev, [rule.id]: !prev[rule.id] }))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${rules[rule.id] ? 'bg-primary-teal' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${rules[rule.id] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamSettings;