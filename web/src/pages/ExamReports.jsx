import React, { useState } from 'react';
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
  Layout
} from 'lucide-react';

const ExamReports = () => {
  const [activeTab, setActiveTab] = useState('exam-reports');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reportType, setReportType] = useState('specific'); // 'specific', 'term', 'year'
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [includes, setIncludes] = useState(['marks']);

  const tabs = [
    { id: 'exam-reports', title: 'Exam Reports', subtitle: 'Examination reports', icon: FileText },
    { id: 'broadsheet', title: 'Broadsheet Reports', subtitle: 'Combined reports by class/level', icon: Table },
    { id: 'issue-finder', title: 'Issue Finder', subtitle: 'Detect report issues automatically', icon: AlertCircle },
  ];

  // Mock data for Broadsheet
  const broadsheetData = [
    { id: 1, name: 'Adebayo Tunde', math: 85, eng: 78, sci: 92, total: 255, avg: 85, pos: 1 },
    { id: 2, name: 'Chioma Okeke', math: 92, eng: 81, sci: 78, total: 251, avg: 83.6, pos: 2 },
    { id: 3, name: 'Kwame Mensah', math: 78, eng: 65, sci: 88, total: 231, avg: 77, pos: 3 },
  ];

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
      ) : activeTab === 'exam-reports' ? (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-soft-xl p-12 min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-dark-text uppercase tracking-tight">Individual Student Reports</h3>
            <span className="text-[10px] font-black text-primary-teal uppercase tracking-widest">Select students to print</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {broadsheetData.map(s => (
              <div key={s.id} className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50 flex items-center justify-between group hover:bg-white hover:border-primary-teal/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xs font-black text-dark-text shadow-soft-sm">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-black text-dark-text uppercase tracking-tight">{s.name}</p>
                    <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest">Avg: {s.avg}% | Pos: {s.pos}</p>
                  </div>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-primary-teal" />
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
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Math</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">English</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Science</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest font-black text-dark-text">Total</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Avg</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-muted-text uppercase tracking-widest">Pos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {broadsheetData.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-4 text-xs font-black text-dark-text uppercase tracking-tight">{s.name}</td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-muted-text">{s.math}</td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-muted-text">{s.eng}</td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-muted-text">{s.sci}</td>
                    <td className="px-4 py-4 text-center text-xs font-black text-primary-teal">{s.total}</td>
                    <td className="px-4 py-4 text-center text-xs font-black text-dark-text">{s.avg}%</td>
                    <td className="px-8 py-4 text-right">
                      <span className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-dark-text uppercase">{s.pos}</span>
                    </td>
                  </tr>
                ))}
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
                  <option value="mid-term">First Term Mid-Term</option>
                  <option value="end-term">First Term Examination</option>
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
                  <option value="jhs1">JHS 1</option>
                  <option value="jhs2">JHS 2</option>
                  <option value="jhs3">JHS 3</option>
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
