import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Target, 
  BarChart3, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  Loader2
} from 'lucide-react';

const ExamAnalytics = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [academicPeriod, setAcademicPeriod] = useState({
    year: localStorage.getItem('academicYear') || '',
    term: localStorage.getItem('academicTerm') || ''
  });
  
  const [marks, setMarks] = useState([]);
  const [caMarks, setCaMarks] = useState([]);
  const [examConfigs, setExamConfigs] = useState([]);
  const [allScales, setAllScales] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [allSystems, setAllSystems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initial load: Exams, Classes, Settings
  useEffect(() => {
    const handlePeriodChange = (e) => {
      setAcademicPeriod({
        year: e.detail.year || localStorage.getItem('academicYear') || '',
        term: e.detail.term || localStorage.getItem('academicTerm') || ''
      });
    };
    window.addEventListener('academicPeriod:change', handlePeriodChange);
    return () => window.removeEventListener('academicPeriod:change', handlePeriodChange);
  }, []);

  // Initial load: Exams, Classes, Settings
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

        setExams(examsData);
        setClasses(classesData?.classes || []);
        setExamConfigs(settingsData?.examConfigs || []);
        setAllAssessments(settingsData?.assessments || []);
        setAllScales(settingsData?.scales || []);
        setAllSystems(settingsData?.systems || []);
        
        if (subjectsData?.subjects) setSubjects(subjectsData.subjects);
        else if (Array.isArray(subjectsData)) setSubjects(subjectsData);

        if (examsData.length > 0) setSelectedExam(examsData[0].id);
        if (classesData?.classes?.length > 0) setSelectedClass(classesData.classes[0].id);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      const yearMatch = !academicPeriod.year || e.year === academicPeriod.year;
      const termMatch = !academicPeriod.term || e.term === academicPeriod.term;
      return yearMatch && termMatch;
    });
  }, [exams, academicPeriod]);

  // Update selected exam when filtered list changes
  useEffect(() => {
    if (filteredExams.length > 0) {
      if (!selectedExam || !filteredExams.find(e => e.id === selectedExam)) {
        setSelectedExam(filteredExams[0].id);
      }
    } else {
      setSelectedExam('');
    }
  }, [filteredExams, selectedExam]);

  // Fetch marks when context changes
  useEffect(() => {
    if (!selectedExam) return;
    
    const fetchMarks = async () => {
      setLoading(true);
      try {
        let marksQuery = `examId=${encodeURIComponent(selectedExam)}`;
        if (selectedClass) marksQuery += `&classId=${encodeURIComponent(selectedClass)}`;
        if (selectedSubject) marksQuery += `&subject=${encodeURIComponent(selectedSubject)}`;

        let caQuery = `assessmentType=ca`;
        if (selectedClass) caQuery += `&classId=${encodeURIComponent(selectedClass)}`;
        if (selectedSubject) caQuery += `&subject=${encodeURIComponent(selectedSubject)}`;

        const [marksRes, caRes] = await Promise.all([
          fetch(`/api/marks?${marksQuery}`),
          fetch(`/api/marks?${caQuery}`)
        ]);

        const marksData = await marksRes.json();
        const caData = await caRes.json();

        setMarks(Array.isArray(marksData) ? marksData : []);
        setCaMarks(Array.isArray(caData) ? caData : []);
      } catch (error) {
        console.error('Error fetching marks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [selectedExam, selectedClass, selectedSubject]);

  // Calculate final scaled scores per student
  const finalScores = useMemo(() => {
    if (marks.length === 0) return [];

    // Find the relevant exam config
    let config = examConfigs.find(c => c.id === selectedExam);
    
    // Fallback if no specific config found for this exam
    if (!config && selectedClass) {
      config = examConfigs.find(c => 
        (c.classes || []).includes(selectedClass) || 
        (c.classes || []).some(cls => {
          const targetClass = classes.find(cx => cx.id === selectedClass);
          return targetClass && (cls === targetClass.name || cls === targetClass.grade);
        })
      );
    }

    const scale = allScales.find(s => s.name === (config?.scale || ''));
    const assessment = allAssessments.find(a => a.name === (config?.assessmentType || ''));
    const gradingSystem = allSystems.find(s => s.name === (config?.gradingSystem || '')) || allSystems[0];
    
    const maxCaTotal = assessment?.items?.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) || 100;

    return marks.map(m => {
      // 1. Calculate Student CA Total for THIS subject
      const studentCaMarks = caMarks.filter(cm => cm.studentId === m.studentId && cm.subject === m.subject);
      const studentCaTotal = studentCaMarks.reduce((sum, cm) => sum + (parseFloat(cm.score) || 0), 0);
      
      // 2. Scale CA Score
      const caScaleFactor = scale ? (parseFloat(scale.to) / maxCaTotal) : 0.4;
      const scaledCa = studentCaTotal * caScaleFactor;
      
      // 3. Scale Exam Score
      const examScaleFactor = scale ? (parseFloat(scale.from) / 100) : 0.6;
      const scaledExam = (parseFloat(m.score) || 0) * examScaleFactor;
      
      // 4. Grand Total
      const grandTotal = scaledCa + scaledExam;

      // 5. Determine Grade
      let grade = 'F';
      if (gradingSystem?.grades) {
        const match = gradingSystem.grades.find(g => grandTotal >= g.lower && grandTotal <= g.upper);
        if (match) grade = match.grade;
      }

      return {
        ...m,
        caTotal: studentCaTotal,
        scaledCa,
        scaledExam,
        grandTotal,
        grade
      };
    });
  }, [marks, caMarks, selectedExam, selectedClass, examConfigs, allScales, allAssessments, allSystems, classes]);

  const stats = useMemo(() => {
    if (finalScores.length === 0) return [
      { label: 'Overall Average', value: '0%', trend: 'N/A', up: true, icon: TrendingUp, color: 'text-primary-teal' },
      { label: 'Pass Rate', value: '0%', trend: 'N/A', up: true, icon: Target, color: 'text-emerald-500' },
      { label: 'Top Subject', value: '-', trend: 'N/A', up: true, icon: BookOpen, color: 'text-blue-500' },
      { label: 'Students Sat', value: '0', trend: 'N/A', up: true, icon: Users, color: 'text-amber-500' },
    ];

    // Get grading system to determine pass rate
    let config = examConfigs.find(c => c.id === selectedExam);
    const gradingSystem = allSystems.find(s => s.name === (config?.gradingSystem || '')) || allSystems[0];
    const passThreshold = gradingSystem?.grades?.find(g => g.grade === '8')?.lower || 50;

    const avg = (finalScores.reduce((a, b) => a + b.grandTotal, 0) / finalScores.length).toFixed(1);
    const passCount = finalScores.filter(m => m.grandTotal >= passThreshold).length;
    const passRate = ((passCount / finalScores.length) * 100).toFixed(1);
    const studentsSat = new Set(finalScores.map(m => m.studentId)).size;

    // Calculate top subject
    const subjectStats = {};
    finalScores.forEach(m => {
      if (!subjectStats[m.subject]) subjectStats[m.subject] = { total: 0, count: 0 };
      subjectStats[m.subject].total += m.grandTotal;
      subjectStats[m.subject].count += 1;
    });
    
    let topSubject = '-';
    let topAvg = 0;
    Object.entries(subjectStats).forEach(([name, s]) => {
      const subjectAvg = s.total / s.count;
      if (subjectAvg > topAvg) {
        topAvg = subjectAvg;
        topSubject = name;
      }
    });

    return [
      { label: 'Overall Average', value: `${avg}%`, trend: 'Real-time', up: true, icon: TrendingUp, color: 'text-primary-teal' },
      { label: 'Pass Rate', value: `${passRate}%`, trend: 'Real-time', up: true, icon: Target, color: 'text-emerald-500' },
      { label: 'Top Subject', value: topSubject, trend: `${topAvg.toFixed(1)}%`, up: true, icon: BookOpen, color: 'text-blue-500' },
      { label: 'Students Sat', value: studentsSat, trend: 'Count', up: true, icon: Users, color: 'text-amber-500' },
    ];
  }, [finalScores]);

  const subjectPerformance = useMemo(() => {
    // Get grading system for pass threshold
    let config = examConfigs.find(c => c.id === selectedExam);
    const gradingSystem = allSystems.find(s => s.name === (config?.gradingSystem || '')) || allSystems[0];
    const passThreshold = gradingSystem?.grades?.find(g => g.grade === '8')?.lower || 50;

    const subjectStats = {};
    finalScores.forEach(m => {
      if (!subjectStats[m.subject]) subjectStats[m.subject] = { total: 0, count: 0, passes: 0, max: 0 };
      subjectStats[m.subject].total += m.grandTotal;
      subjectStats[m.subject].count += 1;
      if (m.grandTotal >= passThreshold) subjectStats[m.subject].passes += 1;
      if (m.grandTotal > subjectStats[m.subject].max) subjectStats[m.subject].max = m.grandTotal;
    });

    return Object.entries(subjectStats).map(([name, s]) => ({
      name,
      avg: Math.round(s.total / s.count),
      passRate: Math.round((s.passes / s.count) * 100),
      topScore: s.max.toFixed(1)
    })).sort((a, b) => b.avg - a.avg);
  }, [finalScores, allSystems, examConfigs, selectedExam]);

  const gradeDistribution = useMemo(() => {
    // Get unique grades from the active grading system or fallback to default
    let config = examConfigs.find(c => c.id === selectedExam);
    const gradingSystem = allSystems.find(s => s.name === (config?.gradingSystem || '')) || allSystems[0];
    
    const dist = {};
    const gradeLabels = gradingSystem?.grades?.map(g => g.grade) || ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    gradeLabels.forEach(g => dist[g] = 0);
    
    finalScores.forEach(m => {
      if (dist[m.grade] !== undefined) dist[m.grade]++;
      else dist['F'] = (dist['F'] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(dist), 1);
    return gradeLabels.map((grade, i) => {
      const count = dist[grade] || 0;
      // Primary teal shades
      const opacity = 1 - (i / gradeLabels.length) * 0.7;
      return {
        grade,
        count,
        height: `${Math.round((count/maxCount)*80)}%`,
        color: i < 4 ? `rgba(20, 184, 166, ${opacity})` : (i < 7 ? `rgba(20, 184, 166, ${opacity})` : 'bg-rose-400')
      };
    });
  }, [finalScores, allSystems, examConfigs, selectedExam]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Exam Analytics</h1>
          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Performance & Insights</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Exam Filter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-soft-sm">
            <Calendar size={14} className="text-primary-teal" />
            <select 
              className="text-[10px] font-black uppercase tracking-widest text-muted-text bg-transparent outline-none cursor-pointer min-w-[120px]"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">Select Exam</option>
              {filteredExams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-soft-sm">
            <Users size={14} className="text-primary-teal" />
            <select 
              className="text-[10px] font-black uppercase tracking-widest text-muted-text bg-transparent outline-none cursor-pointer min-w-[100px]"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-soft-sm">
            <BookOpen size={14} className="text-primary-teal" />
            <select 
              className="text-[10px] font-black uppercase tracking-widest text-muted-text bg-transparent outline-none cursor-pointer min-w-[120px]"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-muted-text hover:text-primary-teal transition shadow-soft-sm">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded-[2rem]"><Loader2 className="animate-spin text-primary-teal" /></div>}
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-dark-text tracking-tight">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded-[2.5rem]"><Loader2 className="animate-spin text-primary-teal" /></div>}
        
        {/* Subject Performance Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-dark-text uppercase tracking-tight">Subject Performance</h3>
            <button className="text-[10px] font-black text-primary-teal uppercase tracking-widest flex items-center gap-1 hover:underline">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-6">
            {subjectPerformance.length > 0 ? subjectPerformance.map((subject, i) => (
              <div key={i} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-dark-text uppercase tracking-tight">{subject.name}</span>
                  <span className="text-xs font-black text-primary-teal">{subject.avg}% Avg</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-teal rounded-full transition-all duration-1000 group-hover:bg-primary-teal/80" 
                    style={{ width: `${subject.avg}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[9px] font-bold text-muted-text uppercase tracking-widest">Pass Rate: {subject.passRate}%</span>
                  <span className="text-[9px] font-bold text-muted-text uppercase tracking-widest">Top Score: {subject.topScore}</span>
                </div>
              </div>
            )) : <p className="text-xs font-bold text-muted-text italic py-10 text-center uppercase tracking-widest">No performance data available for current selection</p>}
          </div>
        </div>

        {/* Grade Distribution Chart */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl p-8 flex flex-col">
          <h3 className="text-sm font-black text-dark-text uppercase tracking-tight mb-8">Grade Distribution</h3>
          <div className="flex-1 flex items-end justify-around gap-2 px-4 min-h-[250px]">
            {gradeDistribution.map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-4 w-full max-w-[40px]">
                <span className="text-[10px] font-black text-muted-text">{bar.count}</span>
                <div 
                  className={`w-full rounded-t-xl transition-all hover:scale-105 cursor-pointer shadow-soft-sm ${bar.color.startsWith('bg-') ? bar.color : ''}`} 
                  style={{ 
                    height: bar.height, 
                    backgroundColor: bar.color.startsWith('bg-') ? undefined : bar.color 
                  }}
                />
                <span className="text-xs font-black text-dark-text">{bar.grade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamAnalytics;