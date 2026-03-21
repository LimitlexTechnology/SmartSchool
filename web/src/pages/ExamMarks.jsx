import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  RotateCcw, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  BookOpen,
  History,
  Loader2
} from 'lucide-react';

const ExamMarks = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Real data for students and their marks
  const [students, setStudents] = useState([]);

  // Initial load: Exams and Classes
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [examsRes, classesRes] = await Promise.all([
          fetch('/api/exams'),
          fetch('/api/classes')
        ]);
        const examsData = await examsRes.json();
        const classesData = await classesRes.json();
        
        setExams(examsData);
        setClasses(classesData);
        
        if (examsData.length > 0) setSelectedExam(examsData[0].id);
        if (classesData.length > 0) setSelectedClass(classesData[0].id);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!selectedClass) return;
    const fetchSubjects = async () => {
      const cls = classes.find(c => c.id === selectedClass);
      if (!cls) return;
      try {
        const res = await fetch(`/api/subjects?grade=${cls.grade}`);
        const data = await res.json();
        setSubjects(data);
        if (data.length > 0) setSelectedSubject(data[0].name || data[0]);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, [selectedClass, classes]);

  // Fetch students and marks when context changes
  useEffect(() => {
    if (!selectedExam || !selectedClass || !selectedSubject) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, marksRes] = await Promise.all([
          fetch(`/api/students?classId=${selectedClass}&pageSize=100`),
          fetch(`/api/marks?examId=${selectedExam}&classId=${selectedClass}&subject=${selectedSubject}`)
        ]);
        
        const studentsData = await studentsRes.json();
        const marksData = await marksRes.json();
        
        const merged = (studentsData.data || []).map(s => {
          const m = marksData.find(mark => mark.studentId === s.id);
          return {
            ...s,
            name: `${s.firstName} ${s.lastName}`,
            admissionNo: s.studentId,
            score: m ? m.score : null,
            status: m ? 'Graded' : 'Pending',
            source: m ? 'Manual Entry' : '-'
          };
        });
        
        setStudents(merged);
      } catch (error) {
        console.error('Error fetching marks data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedExam, selectedClass, selectedSubject]);

  const handleScoreChange = (id, newScore) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { 
        ...s, 
        score: newScore === '' ? null : parseFloat(newScore), 
        status: newScore === '' ? 'Pending' : 'Draft' 
      } : s
    ));
  };

  const handleSave = async () => {
    if (!selectedExam || !selectedClass || !selectedSubject) return;
    setSaving(true);
    try {
      const entries = students
        .filter(s => s.score !== null)
        .map(s => ({ studentId: s.id, score: s.score }));
      
      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam,
          classId: selectedClass,
          subject: selectedSubject,
          entries
        })
      });
      
      if (res.ok) {
        setStudents(prev => prev.map(s => s.status === 'Draft' ? { ...s, status: 'Graded', source: 'Manual Entry' } : s));
        alert('Marks saved successfully!');
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = students.length;
    const graded = students.filter(s => s.status === 'Graded').length;
    const pending = students.filter(s => s.status === 'Pending').length;
    const scores = students.filter(s => s.score !== null).map(s => s.score);
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0';
    
    return [
      { label: 'Total Students', value: total, icon: User, color: 'text-blue-500' },
      { label: 'Graded', value: graded, icon: CheckCircle2, color: 'text-emerald-500' },
      { label: 'Pending', value: pending, icon: AlertCircle, color: 'text-rose-500' },
      { label: 'Avg. Score', value: `${avg}%`, icon: TrendingUp, color: 'text-primary-teal' },
    ];
  }, [students]);

  const getGrade = (score) => {
    if (score === null) return '-';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Graded': return 'text-emerald-500 bg-emerald-50';
      case 'Draft': return 'text-amber-500 bg-amber-50';
      case 'Pending': return 'text-rose-500 bg-rose-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Exam Marks</h1>
          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Mark entry and verification</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 transition shadow-soft-sm">
            <RotateCcw size={14} className="text-primary-teal" />
            Sync Online Campus
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-dark-text tracking-tight">{stat.value}</h4>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-soft-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search student name..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-xl text-xs font-bold text-dark-text focus:bg-white focus:border-primary-teal transition outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="bg-gray-50 border-transparent rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-text focus:bg-white focus:border-primary-teal outline-none transition"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            <option value="">Select Exam</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <select 
            className="bg-gray-50 border-transparent rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-text focus:bg-white focus:border-primary-teal outline-none transition"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            className="bg-gray-50 border-transparent rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-text focus:bg-white focus:border-primary-teal outline-none transition"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-muted-text hover:text-primary-teal hover:bg-primary-teal/5 rounded-xl transition">
            <Filter size={20} />
          </button>
          <button className="p-2.5 text-muted-text hover:text-primary-teal hover:bg-primary-teal/5 rounded-xl transition">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={40} className="text-primary-teal animate-spin" />
              <p className="text-[10px] font-black text-muted-text uppercase tracking-widest">Loading students...</p>
            </div>
          </div>
        )}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Student Information</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Admission No</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Gender</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Score / 100</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Grade</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Source</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-muted-text uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-teal/5 flex items-center justify-center text-primary-teal font-black text-xs uppercase">
                      {(student.firstName?.[0] || '')}{(student.lastName?.[0] || '') || student.name?.[0] || '?'}
                    </div>
                    <span className="text-sm font-black text-dark-text tracking-tight uppercase">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">{student.admissionNo}</span>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">{student.gender || '-'}</span>
                </td>
                <td className="px-6 py-5 text-center">
                  <input 
                    type="number" 
                    className="w-20 px-3 py-2 bg-white border-2 border-gray-100 rounded-xl text-center text-sm font-black text-dark-text focus:border-primary-teal outline-none transition group-hover:border-gray-200"
                    value={student.score === null ? '' : student.score}
                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                    placeholder="--"
                    max="100"
                    min="0"
                  />
                </td>
                <td className="px-6 py-5 text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm ${
                    getGrade(student.score) === 'A' ? 'bg-emerald-50 text-emerald-500' :
                    getGrade(student.score) === 'F' ? 'bg-rose-50 text-rose-500' :
                    'bg-gray-50 text-dark-text'
                  }`}>
                    {getGrade(student.score)}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-muted-text uppercase tracking-widest">{student.source}</span>
                    {student.source === 'Online Campus' && (
                      <button className="text-[8px] font-black text-primary-teal uppercase tracking-widest hover:underline mt-1 flex items-center gap-1">
                        <History size={8} />
                        View History
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(student.status)}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-gray-400 hover:text-dark-text hover:bg-gray-100 rounded-lg transition">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="px-8 py-12 text-center">
                  <p className="text-sm font-bold text-muted-text italic">No students found for this selection.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between px-4">
        <p className="text-[10px] font-black text-muted-text uppercase tracking-widest">
          Showing {filteredStudents.length} students
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
          <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};

export default ExamMarks;