import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Table, 
  AlertCircle, 
  Filter, 
  PenTool, 
  ListOrdered, 
  Users, 
  Download, 
  Mail,
  ChevronRight,
  Search,
  X,
  ChevronDown,
  BookOpen,
  MessageSquare,
  BarChart3,
  Layout,
  Loader2
} from 'lucide-react';

const CORE_SUBJECTS = ['MATHEMATICS', 'ENGLISH', 'ENGLISH LANGUAGE', 'INTEGRATED SCIENCE', 'SOCIAL STUDIES', 'COMPUTING', 'NUMERACY', 'LITERACY'];

const ExamReports = () => {
  const [activeTab, setActiveTab] = useState('exam-reports');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reportType, setReportType] = useState('specific'); // 'specific', 'term', 'year'
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [includes, setIncludes] = useState(['marks']);
  
  const [exams, setExams] = useState([]);
  const [examConfigs, setExamConfigs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [allScales, setAllScales] = useState([]);
  const [gradingSystems, setGradingSystems] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [caMarks, setCaMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [reportRemarks, setReportRemarks] = useState({ attendance: '', headRemarks: '', teacherRemarks: '' });
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [examsRes, classesRes, settingsRes, subjectsRes] = await Promise.all([
          fetch('/api/exams'),
          fetch('/api/classes'),
          fetch('/api/exam-settings'),
          fetch('/api/subjects')
        ]);
        const examsData = await examsRes.json();
        const classesData = await classesRes.json();
        const settingsData = await settingsRes.json();
        const subjectsData = await subjectsRes.json();
        
        setExams(Array.isArray(examsData) ? examsData : []);
        if (Array.isArray(classesData)) setClasses(classesData);
        else if (classesData && Array.isArray(classesData.classes)) setClasses(classesData.classes);
        else setClasses([]);

        setExamConfigs(settingsData?.examConfigs || []);
        setAllAssessments(settingsData?.assessments || []);
        setAllScales(settingsData?.scales || []);
        setGradingSystems(settingsData?.systems || []);
        
        if (subjectsData && Array.isArray(subjectsData.subjects)) setSubjects(subjectsData.subjects);
        else if (Array.isArray(subjectsData)) setSubjects(subjectsData.map(s => typeof s === 'string' ? s : s.name));
        else if (subjectsData && Array.isArray(subjectsData.data)) setSubjects(subjectsData.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedStudentId || !selectedExam) return;
    const fetchRemarks = async () => {
      try {
        const res = await fetch(`/api/reports/remarks?studentId=${selectedStudentId}&examId=${selectedExam}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setReportRemarks({
            attendance: data[0].attendance || '',
            headRemarks: data[0].headRemarks || '',
            teacherRemarks: data[0].teacherRemarks || ''
          });
        } else {
          setReportRemarks({ attendance: '', headRemarks: '', teacherRemarks: '' });
        }
      } catch (e) {
        console.error('Error fetching remarks:', e);
      }
    };
    fetchRemarks();
  }, [selectedStudentId, selectedExam]);

  const handleSaveRemarks = async () => {
    if (!selectedStudentId || !selectedExam) return;
    setIsSavingRemarks(true);
    try {
      await fetch('/api/reports/remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          examId: selectedExam,
          ...reportRemarks
        })
      });
    } catch (e) {
      console.error('Error saving remarks:', e);
    } finally {
      setIsSavingRemarks(false);
    }
  };

  useEffect(() => {
    if (!selectedClass || !selectedExam) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const promises = [
          fetch(`/api/students?classId=${encodeURIComponent(selectedClass)}&pageSize=100`),
          fetch(`/api/marks?examId=${encodeURIComponent(selectedExam)}&classId=${encodeURIComponent(selectedClass)}`),
          fetch(`/api/marks?classId=${encodeURIComponent(selectedClass)}&assessmentType=ca`)
        ];
        const responses = await Promise.all(promises);
        const stData = await responses[0].json();
        const mData = await responses[1].json();
        const caData = await responses[2].json();
        
        setStudents(stData.data || []);
        setMarks(Array.isArray(mData) ? mData : []);
        setCaMarks(Array.isArray(caData) ? caData : []);
      } catch (e) {
        console.error('Error fetching marks data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedClass, selectedExam]);

  const tabs = [
    { id: 'exam-reports', title: 'Exam Reports', subtitle: 'Examination reports', icon: FileText },
    { id: 'broadsheet', title: 'Broadsheet Reports', subtitle: 'Combined reports by class/level', icon: Table },
    { id: 'issue-finder', title: 'Issue Finder', subtitle: 'Detect report issues automatically', icon: AlertCircle },
  ];

  // Dynamic computation of Broadsheet Data
  const broadsheetData = useMemo(() => {
    if (!students.length || !selectedExam) return [];
    
    // Find exam config and scale
    let config = examConfigs.find(c => c.id === selectedExam);
    if (!config) {
      config = examConfigs.find(c => 
        (c.classes || []).includes(selectedClass) || 
        (c.classes || []).some(cls => {
          const targetClass = classes.find(cx => cx.id === selectedClass);
          return targetClass && (cls === targetClass.name || cls === targetClass.grade);
        })
      );
    }
    
    let scale;
    let assessment;
    if (config) {
      scale = allScales.find(s => s.name === config.scale);
      assessment = allAssessments.find(a => a.name === config.assessmentType);
    }
    const maxCaTotal = assessment?.items?.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) || 100;
    const caScaleFactor = scale ? (parseFloat(scale.to) / maxCaTotal) : 0.4;
    const examScaleFactor = scale ? (parseFloat(scale.from) / 100) : 0.6;

    // Helper to get grade based on config
    const getGradeAndRemarks = (score) => {
      const system = gradingSystems.find(s => s.id === config?.gradingSystem || s.name === config?.gradingSystem) || gradingSystems[0];
      if (!system) return { grade: '-', remarks: '-' };
      const g = system.grades.find(gr => score >= parseFloat(gr.lower) && score <= parseFloat(gr.upper));
      return g ? { grade: g.grade, remarks: g.remarks } : { grade: '-', remarks: '-' };
    };

    // First, map all student subject scores to calculate per-subject rankings
    const subjectRankings = {};
    subjects.forEach(subj => {
      const subjectScores = students.map(s => {
        const stCaMarks = caMarks.filter(m => m.studentId === s.id && m.subject === subj);
        const caSum = stCaMarks.reduce((sum, m) => sum + (parseFloat(m.score) || 0), 0);
        const examMark = marks.find(m => m.studentId === s.id && m.subject === subj);
        const examScore = examMark ? parseFloat(examMark.score) || 0 : 0;
        return (caSum * caScaleFactor) + (examScore * examScaleFactor);
      });
      subjectRankings[subj] = subjectScores.sort((a,b) => b-a);
    });

    const records = students.map(s => {
      const record = { 
        id: s.id, 
        wristbandId: s.wristbandId,
        firstName: s.firstName,
        lastName: s.lastName,
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown', 
        scores: {}, 
        details: {},
        total: 0, 
        avg: 0 
      };
      
      let subjectCount = 0;
      subjects.forEach(subj => {
        const stCaMarks = caMarks.filter(m => m.studentId === s.id && m.subject === subj);
        const caSum = stCaMarks.reduce((sum, m) => sum + (parseFloat(m.score) || 0), 0);
        const scaledCa = parseFloat((caSum * caScaleFactor).toFixed(1));
        
        const examMark = marks.find(m => m.studentId === s.id && m.subject === subj);
        const examScore = examMark ? parseFloat(examMark.score) || 0 : 0;
        const scaledExam = parseFloat((examScore * examScaleFactor).toFixed(1));
        
        const grandTotal = parseFloat((scaledCa + scaledExam).toFixed(1));
        const { grade, remarks } = getGradeAndRemarks(grandTotal);
        
        // Find position in subject rankings
        const pos = subjectRankings[subj].indexOf(grandTotal) + 1;
        const posSuffix = pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th';

        if (stCaMarks.length > 0 || examMark) {
          record.scores[subj] = grandTotal;
          record.details[subj] = {
            ca: scaledCa,
            exam: scaledExam,
            total: grandTotal,
            grade,
            remarks,
            position: `${pos}${posSuffix}`
          };
          record.total += grandTotal;
          subjectCount++;
        }
      });
      
      record.avg = subjectCount > 0 ? parseFloat((record.total / subjectCount).toFixed(1)) : 0;
      record.total = parseFloat(record.total.toFixed(1));
      record.overallGrade = getGradeAndRemarks(record.avg).grade;
      return record;
    });
    
    records.sort((a, b) => b.total - a.total);
    records.forEach((r, idx) => {
      const p = idx + 1;
      const sfx = p === 1 ? 'st' : p === 2 ? 'nd' : p === 3 ? 'rd' : 'th';
      r.posDisplay = `${p}${sfx}`;
      r.pos = p;
    });

    // Calculate Class-wide Summary Stats
    const classAvg = records.length > 0 
      ? parseFloat((records.reduce((sum, r) => sum + r.avg, 0) / records.length).toFixed(1)) 
      : 0;
    
    // Add class-level stats to each record for easy access in the UI
    records.forEach(r => {
      r.classAverageMark = classAvg;
      // Calculate Aggregate (sum of best 6 or specialized logic)
      const sortedGrades = Object.values(r.details)
        .map(d => parseInt(d.grade) || 9)
        .sort((a,b) => a-b);
      r.aggregate = sortedGrades.slice(0, 6).reduce((a,b) => a+b, 0);
    });
    
    return records;
  }, [students, marks, caMarks, selectedExam, selectedClass, classes, examConfigs, allScales, allAssessments, subjects, gradingSystems]);

  // Mock data for Issue Finder
  const issues = [
    { type: 'Missing Mark', student: 'Sarah Johnson', subject: 'Mathematics', severity: 'high' },
    { type: 'Invalid Mark', student: 'Mohammed Ali', subject: 'Integrated Science', detail: 'Score (105) exceeds max (100)', severity: 'medium' },
  ];

  const includeOptions = [
    { id: 'marks', label: 'Marks', icon: BookOpen },
    { id: 'comments', label: 'Subject Comments', icon: MessageSquare },
    { id: 'synopsis', label: 'Synopsis', icon: FileText },
    { id: 'qualitative', label: 'Qualitative reports', icon: BarChart3 },
  ];

  const toggleInclude = (id) => {
    setIncludes(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 relative overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Exam Reports</h1>
        <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Examination reports</p>
      </div>

      {/* Tab Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all text-left group ${
                isActive 
                  ? 'bg-white border-primary-teal shadow-soft-xl' 
                  : 'bg-white border-transparent hover:border-gray-100 shadow-soft-sm'
              }`}
            >
              <div className="space-y-1">
                <h3 className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-dark-text' : 'text-muted-text'}`}>
                  {tab.title}
                </h3>
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest opacity-60">
                  {tab.subtitle}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                isActive ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
              }`}>
                <Icon size={24} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 transition shadow-soft-sm"
        >
          <Filter size={14} className="text-primary-teal" />
          Filter
        </button>
        <button 
          disabled={!selectedExam || activeTab === 'issue-finder'} 
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-soft-sm"
        >
          <PenTool size={14} className={selectedExam && activeTab !== 'issue-finder' ? "text-primary-teal" : ""} />
          Generate remarks
        </button>
        <button 
          disabled={!selectedExam || activeTab === 'issue-finder'} 
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-soft-sm"
        >
          <ListOrdered size={14} className={selectedExam && activeTab !== 'issue-finder' ? "text-primary-teal" : ""} />
          Calculate positions
        </button>
        <button 
          disabled={!selectedExam || activeTab === 'issue-finder'} 
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-soft-sm"
        >
          <Users size={14} className={selectedExam && activeTab !== 'issue-finder' ? "text-primary-teal" : ""} />
          Calculate attendance
        </button>
        <button 
          disabled={!selectedExam || activeTab === 'issue-finder'} 
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-soft-sm"
        >
          <Download size={14} className={selectedExam && activeTab !== 'issue-finder' ? "text-primary-teal" : ""} />
          Export PDF
        </button>
        <button 
          disabled={!selectedExam || activeTab === 'issue-finder'} 
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-soft-sm"
        >
          <Mail size={14} className={selectedExam && activeTab !== 'issue-finder' ? "text-primary-teal" : ""} />
          Mail
        </button>
      </div>

      {/* Main Content Area */}
      {!selectedExam ? (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-soft-xl p-20 flex flex-col items-center justify-center text-center min-h-[500px]">
          <div className="w-32 h-32 bg-primary-teal/5 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-soft-xl flex items-center justify-center border border-primary-teal/10">
              <Search size={40} className="text-primary-teal opacity-40" />
            </div>
          </div>
          <p className="text-lg font-bold text-dark-text tracking-tight max-w-sm leading-relaxed">
            Please select an exam and then select a class or level to proceed.
          </p>
        </div>
      ) : selectedStudentId ? (() => {
          const student = broadsheetData.find(s => s.id === selectedStudentId);
          const exam = exams.find(e => e.id === selectedExam) || examConfigs.find(e => e.id === selectedExam);
          const className = classes.find(c => c.id === selectedClass)?.grade || 'Class';
          
          if (!student) return null;

          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="flex items-center gap-2 translate-x-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-teal hover:bg-primary-teal/5 rounded-full transition-all"
              >
                <ChevronDown size={16} className="rotate-90" />
                Back to list
              </button>

              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-soft-xl overflow-hidden">
                {/* Student Header Card */}
                <div className="p-12 border-b border-gray-50 bg-gray-50/10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-32 h-32 rounded-[2rem] bg-white border border-gray-100 shadow-soft-xl flex items-center justify-center overflow-hidden">
                        {(student.profilePicture || student.photo) ? (
                          <img src={student.profilePicture || student.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users size={48} className="text-gray-200" />
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-black text-dark-text tracking-tight uppercase">{student.name}</h2>
                          <p className="text-xs font-bold text-muted-text uppercase tracking-widest">{student.wristbandId || student.id.slice(0,8).toUpperCase()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-primary-teal uppercase tracking-widest">{exam?.title || exam?.name}</p>
                          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{exam?.year || '2025/2026'} Academic Year</p>
                          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{exam?.term || 'Second Term'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1">Overall Class Position</p>
                      <h3 className="text-xl font-black text-primary-teal tracking-tighter uppercase whitespace-nowrap">
                        Position: {student.posDisplay || 'Not yet determined!!'}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Subject Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-12 py-6 text-left text-[10px] font-black text-muted-text uppercase tracking-[0.2em]">Subject</th>
                        <th className="px-6 py-6 text-center text-[10px] font-black text-muted-text uppercase tracking-[0.2em]">Class (60)</th>
                        <th className="px-6 py-6 text-center text-[10px] font-black text-muted-text uppercase tracking-[0.2em]">Exam (40)</th>
                        <th className="px-6 py-6 text-center text-[10px] font-black text-muted-text uppercase tracking-[0.2em] font-black text-dark-text">Total</th>
                        <th className="px-6 py-6 text-center text-[10px] font-black text-muted-text uppercase tracking-[0.2em]">Position</th>
                        <th className="px-6 py-6 text-center text-[10px] font-black text-muted-text uppercase tracking-[0.2em]">Grade</th>
                        <th className="px-12 py-6 text-right text-[10px] font-black text-muted-text uppercase tracking-[0.2em]">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {subjects.map(subj => {
                        const detail = student.details[subj];
                        return (
                          <tr key={subj} className="hover:bg-gray-50/30 transition-colors">
                            <td className="px-12 py-6">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-dark-text uppercase tracking-tight">{subj}</span>
                                {CORE_SUBJECTS.includes(subj.toUpperCase()) && (
                                  <div className="w-5 h-5 rounded-full bg-dark-text text-white text-[8px] flex items-center justify-center font-bold" title="Core Subject">C</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center text-sm font-bold text-muted-text">{detail ? detail.ca : '0.0'}</td>
                            <td className="px-6 py-6 text-center text-sm font-bold text-muted-text">{detail ? detail.exam : '0.0'}</td>
                            <td className="px-6 py-6 text-center text-sm font-black text-dark-text">{detail ? detail.total : '0'}</td>
                            <td className="px-6 py-6 text-center text-sm font-bold text-muted-text">{detail ? detail.position : '-'}</td>
                            <td className="px-6 py-6 text-center text-sm font-black text-primary-teal">{detail ? detail.grade : '-'}</td>
                            <td className="px-12 py-6 text-right text-[10px] font-black text-muted-text uppercase tracking-widest">{detail ? detail.remarks : 'LOWEST'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary Row */}
                <div className="bg-gray-50/30 p-8 flex flex-wrap items-center justify-center gap-12 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Aggregate:</span>
                    <span className="text-xs font-black text-dark-text">{student.aggregate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Class Average Mark:</span>
                    <span className="text-xs font-black text-dark-text">{student.classAverageMark}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Total score:</span>
                    <span className="text-xs font-black text-dark-text">{student.total}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Average Mark:</span>
                    <span className="text-xs font-black text-dark-text">{student.avg}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Overall Grade:</span>
                    <span className="text-xs font-black text-primary-teal">{student.overallGrade}</span>
                  </div>
                </div>

                {/* Customizable Remarks Section */}
                <div className="p-12 space-y-8 bg-white">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-2">
                         <PenTool size={14} className="text-primary-teal" />
                         <span className="text-[10px] font-black text-dark-text uppercase tracking-widest">Attendance</span>
                      </div>
                      <input 
                        className="bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-muted-text focus:ring-1 focus:ring-primary-teal/20 transition-all outline-none"
                        value={reportRemarks.attendance}
                        onChange={(e) => setReportRemarks(prev => ({ ...prev, attendance: e.target.value }))}
                        onBlur={handleSaveRemarks}
                        placeholder="e.g. 68 out of 70 days Present"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-2">
                         <PenTool size={14} className="text-primary-teal" />
                         <span className="text-[10px] font-black text-dark-text uppercase tracking-widest">Academic Head's Remarks</span>
                      </div>
                      <textarea 
                        className="bg-gray-50 border-none rounded-[1.5rem] px-6 py-4 text-xs font-bold text-muted-text focus:ring-1 focus:ring-primary-teal/20 transition-all outline-none min-h-[80px] resize-none"
                        value={reportRemarks.headRemarks}
                        onChange={(e) => setReportRemarks(prev => ({ ...prev, headRemarks: e.target.value }))}
                        onBlur={handleSaveRemarks}
                        placeholder="Enter headmaster's remarks..."
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-2">
                         <PenTool size={14} className="text-primary-teal" />
                         <span className="text-[10px] font-black text-dark-text uppercase tracking-widest">Class teacher's remarks</span>
                      </div>
                      <textarea 
                        className="bg-gray-50 border-none rounded-[1.5rem] px-6 py-4 text-xs font-bold text-muted-text focus:ring-1 focus:ring-primary-teal/20 transition-all outline-none min-h-[80px] resize-none"
                        value={reportRemarks.teacherRemarks}
                        onChange={(e) => setReportRemarks(prev => ({ ...prev, teacherRemarks: e.target.value }))}
                        onBlur={handleSaveRemarks}
                        placeholder="Enter teacher's remarks..."
                      />
                    </div>
                  </div>
                  
                  {isSavingRemarks && (
                    <div className="flex items-center justify-end gap-2 text-primary-teal">
                      <Loader2 size={12} className="animate-spin" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Auto-saving...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })() : activeTab === 'exam-reports' ? (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-soft-xl p-12 min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-dark-text uppercase tracking-tight">Individual Student Reports</h3>
            <span className="text-[10px] font-black text-primary-teal uppercase tracking-widest">Select students to print</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {broadsheetData.map(s => (
              <div key={s.id} 
                onClick={() => setSelectedStudentId(s.id)}
                className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50 flex items-center justify-between group hover:bg-white hover:border-primary-teal/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xs font-black text-dark-text shadow-soft-sm">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-black text-dark-text uppercase tracking-tight">{s.name}</p>
                    <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest">Avg: {s.avg}% | Pos: {s.posDisplay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-teal transition-colors" />
                   <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-primary-teal" 
                    onClick={(e) => e.stopPropagation()} 
                   />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'broadsheet' ? (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-soft-xl overflow-hidden min-h-[500px]">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-dark-text uppercase tracking-tight">Broadsheet - {selectedClass || 'All Classes'}</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 text-muted-text hover:text-primary-teal transition"><Download size={18} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Student</th>
                  {subjects.map(subj => (
                    <th key={subj} className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">{subj.substring(0,3)}</th>
                  ))}
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest font-black text-dark-text">Total</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Avg</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-muted-text uppercase tracking-widest">Pos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={subjects.length + 4} className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-primary-teal">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <span className="text-sm font-black text-dark-text">Loading Broadsheet Data...</span>
                      </div>
                    </td>
                  </tr>
                ) : broadsheetData.length > 0 ? broadsheetData.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-4 text-xs font-black text-dark-text uppercase tracking-tight">{s.name}</td>
                    {subjects.map(subj => (
                      <td key={subj} className="px-4 py-4 text-center text-xs font-bold text-muted-text">
                        {s.scores[subj] !== undefined ? s.scores[subj] : '-'}
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center text-xs font-black text-primary-teal">{s.total}</td>
                    <td className="px-4 py-4 text-center text-xs font-black text-dark-text">{s.avg}%</td>
                    <td className="px-8 py-4 text-right">
                      <span className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-dark-text uppercase">{s.pos}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={subjects.length + 4} className="px-8 py-12 text-center">
                      <p className="text-sm font-bold text-muted-text italic">No marks found for the selected examination and class.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-soft-xl p-12 min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-dark-text uppercase tracking-tight">Issue Finder</h3>
            <span className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest">
              {issues.length} Issues Detected
            </span>
          </div>
          <div className="space-y-4">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50 group hover:bg-white hover:border-rose-100 transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${issue.severity === 'high' ? 'bg-rose-100 text-rose-500' : 'bg-amber-100 text-amber-500'}`}>
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-dark-text uppercase tracking-tight mb-1">{issue.type}: {issue.student}</p>
                  <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{issue.subject} {issue.detail ? `| ${issue.detail}` : ''}</p>
                </div>
                <button className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-teal hover:bg-primary-teal hover:text-white transition shadow-soft-sm">
                  Fix Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-6">
        <p className="text-[10px] font-black text-muted-text uppercase tracking-widest">
          Mirekua International Community School
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">3.22.9</span>
          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/20" />
        </div>
      </div>

      {/* Filter Drawer Backdrop */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[1000] transition-opacity duration-300"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Filter Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-[1001] transition-transform duration-500 ease-out transform ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Drawer Header */}
          <div className="p-8 flex items-center justify-between">
            <h2 className="text-xl font-black text-dark-text tracking-tight">Filter</h2>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition"
            >
              <X size={16} />
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            {/* Report Type */}
            <div className="mb-10">
              <p className="text-[10px] font-black text-muted-text uppercase tracking-[0.2em] mb-4">Report Type</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'specific', label: 'Specific exam' },
                  { id: 'term', label: 'Combined term report' },
                  { id: 'year', label: 'Combined year report' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-bold transition-all border-2 ${
                      reportType === type.id 
                        ? 'bg-white border-primary-teal text-primary-teal shadow-md shadow-primary-teal/10' 
                        : 'bg-white border-gray-100 text-muted-text hover:border-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selects */}
            <div className="space-y-4 mb-10">
              <div className="relative group">
                <select 
                  className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-muted-text focus:outline-none focus:border-primary-teal transition group-hover:border-gray-200"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                >
                  <option value="" disabled>Exam</option>
                  {examConfigs.length > 0 ? (
                    examConfigs.map(e => <option key={e.id} value={e.id}>{e.name}</option>)
                  ) : (
                    exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)
                  )}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative group">
                <select 
                  className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-muted-text focus:outline-none focus:border-primary-teal transition group-hover:border-gray-200"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="" disabled>Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.grade || ''}{c.name ? ` - ${c.name}` : ''}{!c.grade && !c.name ? `Class ${c.id.substring(0,4)}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Include Section */}
            <div>
              <p className="text-xl font-black text-dark-text tracking-tight mb-6">Include</p>
              <div className="space-y-3">
                {includeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = includes.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleInclude(opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        isSelected 
                          ? 'bg-primary-teal/5 border-primary-teal shadow-soft-sm' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary-teal text-white' : 'bg-gray-50 text-gray-400'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <span className={`text-xs font-bold ${isSelected ? 'text-primary-teal' : 'text-muted-text'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamReports;
