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
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initial load: Exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch('/api/exams');
        const data = await res.json();
        setExams(data);
        if (data.length > 0) setSelectedExam(data[0].id);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };
    fetchExams();
  }, []);

  // Fetch marks when exam changes
  useEffect(() => {
    if (!selectedExam) return;
    const fetchMarks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/marks?examId=${selectedExam}`);
        const data = await res.json();
        setMarks(data);
      } catch (error) {
        console.error('Error fetching marks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [selectedExam]);

  const stats = useMemo(() => {
    if (marks.length === 0) return [
      { label: 'Overall Average', value: '0%', trend: '0%', up: true, icon: TrendingUp, color: 'text-primary-teal' },
      { label: 'Pass Rate', value: '0%', trend: '0%', up: true, icon: Target, color: 'text-emerald-500' },
      { label: 'Top Subject', value: '-', trend: '0%', up: true, icon: BookOpen, color: 'text-blue-500' },
      { label: 'Students Sat', value: '0', trend: '0', up: true, icon: Users, color: 'text-amber-500' },
    ];

    const scores = marks.map(m => m.score);
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    const passCount = marks.filter(m => m.score >= 50).length;
    const passRate = ((passCount / marks.length) * 100).toFixed(1);
    const studentsSat = new Set(marks.map(m => m.studentId)).size;

    // Calculate top subject
    const subjectStats = {};
    marks.forEach(m => {
      if (!subjectStats[m.subject]) subjectStats[m.subject] = { total: 0, count: 0 };
      subjectStats[m.subject].total += m.score;
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
      { label: 'Overall Average', value: `${avg}%`, trend: '+0.0%', up: true, icon: TrendingUp, color: 'text-primary-teal' },
      { label: 'Pass Rate', value: `${passRate}%`, trend: '+0.0%', up: true, icon: Target, color: 'text-emerald-500' },
      { label: 'Top Subject', value: topSubject, trend: `${topAvg.toFixed(1)}%`, up: true, icon: BookOpen, color: 'text-blue-500' },
      { label: 'Students Sat', value: studentsSat, trend: '0', up: true, icon: Users, color: 'text-amber-500' },
    ];
  }, [marks]);

  const subjectPerformance = useMemo(() => {
    const subjectStats = {};
    marks.forEach(m => {
      if (!subjectStats[m.subject]) subjectStats[m.subject] = { total: 0, count: 0, passes: 0, max: 0 };
      subjectStats[m.subject].total += m.score;
      subjectStats[m.subject].count += 1;
      if (m.score >= 50) subjectStats[m.subject].passes += 1;
      if (m.score > subjectStats[m.subject].max) subjectStats[m.subject].max = m.score;
    });

    return Object.entries(subjectStats).map(([name, s]) => ({
      name,
      avg: Math.round(s.total / s.count),
      passRate: Math.round((s.passes / s.count) * 100),
      topScore: s.max
    })).sort((a, b) => b.avg - a.avg);
  }, [marks]);

  const gradeDistribution = useMemo(() => {
    const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    marks.forEach(m => {
      if (m.score >= 80) dist.A++;
      else if (m.score >= 70) dist.B++;
      else if (m.score >= 60) dist.C++;
      else if (m.score >= 50) dist.D++;
      else dist.F++;
    });
    
    const max = Math.max(...Object.values(dist), 1);
    return [
      { grade: 'A', count: dist.A, height: `h-[${Math.round((dist.A/max)*80)}%]`, color: 'bg-primary-teal' },
      { grade: 'B', count: dist.B, height: `h-[${Math.round((dist.B/max)*80)}%]`, color: 'bg-primary-teal/80' },
      { grade: 'C', count: dist.C, height: `h-[${Math.round((dist.C/max)*80)}%]`, color: 'bg-primary-teal/60' },
      { grade: 'D', count: dist.D, height: `h-[${Math.round((dist.D/max)*80)}%]`, color: 'bg-primary-teal/40' },
      { grade: 'F', count: dist.F, height: `h-[${Math.round((dist.F/max)*80)}%]`, color: 'bg-rose-400' },
    ];
  }, [marks]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Exam Analytics</h1>
          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Performance & Insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl">
            <Calendar size={14} className="text-primary-teal" />
            <select 
              className="text-[10px] font-black uppercase tracking-widest text-muted-text bg-transparent outline-none cursor-pointer"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              {exams.map(e => <option key={e.id} value={e.id}>{e.title} ({e.year})</option>)}
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
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
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
            )) : <p className="text-xs font-bold text-muted-text italic py-10 text-center uppercase tracking-widest">No subject data available</p>}
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
                  className={`w-full ${bar.color} rounded-t-xl transition-all hover:scale-105 cursor-pointer shadow-soft-sm`} 
                  style={{ height: bar.height.replace('h-[', '').replace(']', '') }}
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