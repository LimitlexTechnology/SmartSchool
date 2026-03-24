import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  UserCheck, 
  Save, 
  RotateCcw, 
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ZapOff,
  X,
  ChevronDown,
  ChevronRight,
  ArrowDownRight,
  Plus,
  UserX,
  Search
} from 'lucide-react';

const ExamSettings = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allExams, setAllExams] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [repeatingStudents, setRepeatingStudents] = useState([]);
  
  const [showWindowModal, setShowWindowModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  const [windowExam, setWindowExam] = useState('');
  const [windowFrom, setWindowFrom] = useState('');
  const [windowTo, setWindowTo] = useState('');
  
  const [publishExam, setPublishExam] = useState('');

  const [settings, setSettings] = useState({
    minTests: 1,
    manualAttendance: true,
    calculatePositionsByLevel: false,
    disableAI: false,
    resultsWindow: { open: false, start: '', end: '' },
    resultsPublished: false,
    promotionCriteria: { minAverage: 50, mandatorySubjects: [] }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, studentsRes] = await Promise.all([
        fetch('/api/exam-settings'),
        fetch('/api/students?pageSize=1000')
      ]);
      
      const settingsData = await settingsRes.json();
      if (settingsData.rules) {
        setSettings(prev => ({
          ...prev,
          ...settingsData.rules
        }));
      }
      if (settingsData.examConfigs) {
        setAllExams(settingsData.examConfigs.filter(e => e.status !== 'archived'));
      }
      if (settingsData.repeatingStudents) {
        setRepeatingStudents(settingsData.repeatingStudents);
      }

      const studentsData = await studentsRes.json();
      setAllStudents(studentsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentRes = await fetch('/api/exam-settings');
      const currentData = await currentRes.json();
      
      const res = await fetch('/api/exam-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...currentData,
          rules: {
            ...currentData.rules,
            ...settings
          },
          repeatingStudents
        })
      });
      if (res.ok) alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveWindow = async () => {
    if (!windowExam || !windowFrom || !windowTo) return;
    alert(`Results entry window set for ${windowExam} from ${windowFrom} to ${windowTo}`);
    setShowWindowModal(false);
  };

  const handlePublishResults = async () => {
    if (!publishExam) return;
    alert(`Results published for ${publishExam}! Students and parents can now view them.`);
    setShowPublishModal(false);
  };

  const addRepeatingStudent = (studentId) => {
    if (!repeatingStudents.includes(studentId)) {
      setRepeatingStudents([...repeatingStudents, studentId]);
    }
    setShowStudentSearch(false);
    setStudentSearchQuery('');
  };

  const removeRepeatingStudent = (studentId) => {
    setRepeatingStudents(repeatingStudents.filter(id => id !== studentId));
  };

  const filteredStudents = allStudents.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const query = studentSearchQuery.toLowerCase();
    return (fullName.includes(query) || s.studentId?.toLowerCase().includes(query)) && !repeatingStudents.includes(s.id);
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Set Results Entry Window Modal */}
      {showWindowModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
          <div className="w-full max-w-md relative flex flex-col items-center">
            <button 
              onClick={() => setShowWindowModal(false)}
              className="absolute -top-16 -right-16 p-3 bg-white shadow-soft-xl rounded-full text-gray-400 hover:text-dark-text transition-all"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-dark-text uppercase tracking-tight mb-8">Set Results Entry Window</h3>
            
            <div className="w-full space-y-4">
              <div className="relative">
                <select 
                  value={windowExam}
                  onChange={(e) => setWindowExam(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-6 py-4 text-xs font-bold text-muted-text outline-none focus:border-primary-teal transition cursor-pointer pr-12"
                >
                  <option value="">Exam</option>
                  {allExams.map(exam => (
                    <option key={exam.id} value={exam.name}>{exam.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase text-primary-teal tracking-widest">From</div>
                  <input 
                    type="date"
                    value={windowFrom}
                    onChange={(e) => setWindowFrom(e.target.value)}
                    className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-4 text-xs font-bold text-muted-text outline-none focus:border-primary-teal transition"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase text-primary-teal tracking-widest">To</div>
                  <input 
                    type="date"
                    value={windowTo}
                    onChange={(e) => setWindowTo(e.target.value)}
                    className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-4 text-xs font-bold text-muted-text outline-none focus:border-primary-teal transition"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveWindow}
                className="w-full py-4 bg-primary-teal/40 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal transition shadow-lg shadow-primary-teal/10 flex items-center justify-center gap-2"
              >
                <Save size={14} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Results Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
          <div className="w-full max-w-md relative flex flex-col items-center">
            <button 
              onClick={() => setShowPublishModal(false)}
              className="absolute -top-16 -right-16 p-3 bg-white shadow-soft-xl rounded-full text-gray-400 hover:text-dark-text transition-all"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-dark-text uppercase tracking-tight mb-8">Select an Exam to publish results</h3>
            
            <div className="w-full space-y-4">
              <div className="relative">
                <select 
                  value={publishExam}
                  onChange={(e) => setPublishExam(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-6 py-4 text-xs font-bold text-muted-text outline-none focus:border-primary-teal transition cursor-pointer pr-12"
                >
                  <option value="">Exam</option>
                  {allExams.map(exam => (
                    <option key={exam.id} value={exam.name}>{exam.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>

              <button 
                onClick={handlePublishResults}
                className="w-full py-4 bg-primary-teal/40 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal transition shadow-lg shadow-primary-teal/10 flex items-center justify-center gap-2"
              >
                Publish now
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Search Modal for Promotion */}
      {showStudentSearch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden relative p-10 flex flex-col">
            <button onClick={() => setShowStudentSearch(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-dark-text">
              <X size={24} />
            </button>
            <h3 className="text-xl font-black text-dark-text uppercase tracking-tight mb-6">Select Student to Repeat</h3>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" size={18} />
              <input 
                type="text"
                autoFocus
                placeholder="Search by name or ID..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <button 
                    key={student.id}
                    onClick={() => addRepeatingStudent(student.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-primary-teal/5 border border-transparent hover:border-primary-teal/20 rounded-2xl transition group text-left"
                  >
                    <div>
                      <p className="text-xs font-black text-dark-text uppercase tracking-tight">{student.firstName} {student.lastName}</p>
                      <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest">{student.studentId || student.id.slice(0, 8)}</p>
                    </div>
                    <Plus size={16} className="text-gray-300 group-hover:text-primary-teal transition-colors" />
                  </button>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-xs font-bold text-muted-text uppercase tracking-widest italic">No students found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Exam Settings</h1>
          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest italic opacity-70">Adjust exam settings</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:text-primary-teal transition shadow-soft-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="text-primary-teal" />}
          Save
        </button>
      </div>

      {/* Top Tabs */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all text-left min-w-[240px] ${
            activeTab === 'exams' ? 'bg-white border-primary-teal shadow-soft-xl' : 'bg-white border-transparent hover:border-gray-100 shadow-soft-sm'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            activeTab === 'exams' ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20' : 'bg-gray-50 text-gray-400'
          }`}>
            <Settings size={24} />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <h3 className={`text-xs font-black uppercase tracking-tight truncate ${activeTab === 'exams' ? 'text-dark-text' : 'text-muted-text'}`}>Exam Settings</h3>
            <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60 truncate">Adjust exam settings</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('promotion')}
          className={`flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all text-left min-w-[240px] ${
            activeTab === 'promotion' ? 'bg-white border-primary-teal shadow-soft-xl' : 'bg-white border-transparent hover:border-gray-100 shadow-soft-sm'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            activeTab === 'promotion' ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20' : 'bg-gray-50 text-gray-400'
          }`}>
            <UserCheck size={24} />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <h3 className={`text-xs font-black uppercase tracking-tight truncate ${activeTab === 'promotion' ? 'text-dark-text' : 'text-muted-text'}`}>Promotion Settings</h3>
            <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60 truncate">Set your promotions criteria</p>
          </div>
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          {activeTab === 'exams' ? (
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-soft-xl overflow-hidden p-12">
              <div className="flex flex-col items-center mb-12">
                <div className="w-full h-32 bg-gray-50 rounded-[2rem] mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-teal via-transparent to-transparent"></div>
                  <Settings size={48} className="text-primary-teal/20" />
                </div>
                <h2 className="text-xl font-black text-dark-text uppercase tracking-tight">General Exam Settings</h2>
              </div>

              {/* Term Based Actions */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                    <Calendar size={16} />
                  </div>
                  <h3 className="text-[11px] font-black text-dark-text uppercase tracking-widest">Term Based Actions</h3>
                </div>
                
                <div className="space-y-4 border-t border-gray-50 pt-6">
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-[11px] font-black text-dark-text uppercase tracking-tight">Set a window for results entry</p>
                    </div>
                    <button 
                      onClick={() => setShowWindowModal(true)}
                      className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition shadow-lg shadow-rose-500/20"
                    >
                      Set window
                    </button>
                  </div>

                  <div className="flex items-center justify-between group pt-4">
                    <div>
                      <p className="text-[11px] font-black text-dark-text uppercase tracking-tight">Publish results for this term</p>
                    </div>
                    <button 
                      onClick={() => setShowPublishModal(true)}
                      className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition shadow-lg shadow-rose-500/20"
                    >
                      Publish results
                    </button>
                  </div>

                  <div className="flex items-center justify-between group pt-4">
                    <div>
                      <p className="text-[11px] font-black text-dark-text uppercase tracking-tight">Minimum tests per term/semester</p>
                      <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60 mt-1">Set a minimum number of tests to be taken per term/semester for each assessment type.</p>
                    </div>
                    <input 
                      type="number" 
                      value={settings.minTests}
                      onChange={(e) => setSettings(prev => ({ ...prev, minTests: parseInt(e.target.value) }))}
                      className="w-20 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-dark-text text-center focus:bg-white focus:border-primary-teal outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Miscellaneous */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                    <Settings size={16} />
                  </div>
                  <h3 className="text-[11px] font-black text-dark-text uppercase tracking-widest">Miscellaneous</h3>
                </div>

                <div className="space-y-6 border-t border-gray-50 pt-6">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={settings.manualAttendance}
                        onChange={() => toggleSetting('manualAttendance')}
                      />
                      <div className={`w-5 h-5 border-2 rounded-lg transition-all ${settings.manualAttendance ? 'bg-primary-teal border-primary-teal shadow-lg shadow-primary-teal/20' : 'bg-white border-gray-200 group-hover:border-primary-teal/50'}`}>
                        {settings.manualAttendance && <CheckCircle2 size={12} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-dark-text uppercase tracking-tight">Input attendance manually on report card</p>
                      <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60 mt-1 leading-relaxed max-w-lg">
                        Use this option if you would like to calculate attendance yourself and input that on students' report cards. This will override the automatic one generated by the system.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={settings.calculatePositionsByLevel}
                        onChange={() => toggleSetting('calculatePositionsByLevel')}
                      />
                      <div className={`w-5 h-5 border-2 rounded-lg transition-all ${settings.calculatePositionsByLevel ? 'bg-primary-teal border-primary-teal shadow-lg shadow-primary-teal/20' : 'bg-white border-gray-200 group-hover:border-primary-teal/50'}`}>
                        {settings.calculatePositionsByLevel && <CheckCircle2 size={12} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-dark-text uppercase tracking-tight">Calculate positions based on level</p>
                      <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60 mt-1 leading-relaxed">
                        Both class and subject positions will be calculated across levels and not by class.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={settings.disableAI}
                        onChange={() => toggleSetting('disableAI')}
                      />
                      <div className={`w-5 h-5 border-2 rounded-lg transition-all ${settings.disableAI ? 'bg-primary-teal border-primary-teal shadow-lg shadow-primary-teal/20' : 'bg-white border-gray-200 group-hover:border-primary-teal/50'}`}>
                        {settings.disableAI && <CheckCircle2 size={12} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-dark-text uppercase tracking-tight">Disable system generated fills and AI generation for report cards</p>
                      <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60 mt-1 leading-relaxed">
                        Check this option if you would like to disable all system generated options and AI generation for remarks and report cards.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-gray-50">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-10 py-4 bg-primary-teal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-soft-xl overflow-hidden p-12">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                    <ArrowDownRight size={20} />
                  </div>
                  <h3 className="text-sm font-black text-dark-text uppercase tracking-tight">Promotion & Repeating</h3>
                </div>
              </div>

              {/* Promotion Criteria */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                    <Trophy size={16} />
                  </div>
                  <h3 className="text-[11px] font-black text-dark-text uppercase tracking-widest">Promotion Criteria</h3>
                </div>
                
                <div className="space-y-6 border-t border-gray-50 pt-6">
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-[11px] font-black text-dark-text uppercase tracking-tight">Minimum overall average to pass (%)</p>
                      <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60 mt-1 leading-relaxed">Students below this average will be automatically flagged for review.</p>
                    </div>
                    <input 
                      type="number" 
                      value={settings.promotionCriteria?.minAverage || 50}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        promotionCriteria: { ...prev.promotionCriteria, minAverage: parseInt(e.target.value) } 
                      }))}
                      className="w-20 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-dark-text text-center focus:bg-white focus:border-primary-teal outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Repeating List */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                      <UserX size={16} />
                    </div>
                    <h3 className="text-[11px] font-black text-dark-text uppercase tracking-widest">Manual Repeating List</h3>
                  </div>
                  <button 
                    onClick={() => setShowStudentSearch(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[10px] font-black uppercase tracking-widest text-muted-text transition rounded-xl"
                  >
                    <Plus size={14} />
                    Add student
                  </button>
                </div>
                
                <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest mb-4 opacity-60">Students listed below will be repeated regardless of their performance for this term.</p>
                <div className="w-full min-h-[120px] p-8 border-2 border-gray-100 rounded-[2.5rem] flex flex-wrap gap-3 items-center content-start bg-gray-50/30">
                  {repeatingStudents.length > 0 ? (
                    repeatingStudents.map(studentId => {
                      const student = allStudents.find(s => s.id === studentId);
                      return (
                        <span 
                          key={studentId}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-primary-teal/20 text-primary-teal rounded-full text-[10px] font-black uppercase tracking-widest shadow-soft-sm hover:border-rose-200 hover:text-rose-500 transition group cursor-default"
                        >
                          {student ? `${student.firstName} ${student.lastName}` : `ID: ${studentId.slice(0, 8)}`}
                          <X 
                            size={12} 
                            className="cursor-pointer opacity-40 group-hover:opacity-100 transition-opacity" 
                            onClick={() => removeRepeatingStudent(studentId)}
                          />
                        </span>
                      );
                    })
                  ) : (
                    <div className="w-full py-10 flex flex-col items-center justify-center text-center opacity-30">
                      <UserX size={32} className="mb-2 text-muted-text" />
                      <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">No students selected for repetition</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-gray-50">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-10 py-4 bg-primary-teal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamSettings;
