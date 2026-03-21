import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Users,
  BookOpen,
  Layout,
  Layers,
  Save,
  Trash2,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';

const ExamConfiguration = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', term: 'First Term', year: '2025/2026', startDate: '', endDate: '' });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exams');
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleAddExam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExam)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewExam({ title: '', term: 'First Term', year: '2025/2026', startDate: '', endDate: '' });
        fetchExams();
      }
    } catch (error) {
      console.error('Error adding exam:', error);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!confirm('Are you sure you want to delete this examination?')) return;
    try {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-500 bg-blue-50';
      case 'In-Progress': return 'text-emerald-500 bg-emerald-50';
      case 'Draft': return 'text-amber-500 bg-amber-50';
      case 'Completed': return 'text-gray-500 bg-gray-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Exam Configuration</h1>
          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Setup & Scheduling</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal/90 transition shadow-lg shadow-primary-teal/20"
        >
          <Plus size={14} />
          New Examination
        </button>
      </div>

      {/* Tabs (Simple Layout) */}
      <div className="flex items-center gap-8 border-b border-gray-100 mb-8">
        {['All Exams', 'Scheduled', 'Draft', 'Completed'].map((tab, i) => (
          <button 
            key={i} 
            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'text-primary-teal border-b-2 border-primary-teal' : 'text-muted-text hover:text-dark-text'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative min-h-[400px]">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded-[2.5rem]"><Loader2 className="animate-spin text-primary-teal" /></div>}
        
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-sm hover:shadow-soft-xl transition-all group p-8">
            <div className="flex items-center justify-between mb-6">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(exam.status)}`}>
                {exam.status}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDeleteExam(exam.id)}
                  className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                >
                  <Trash2 size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-dark-text transition rounded-xl">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-black text-dark-text tracking-tight uppercase mb-2">{exam.title}</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-text uppercase tracking-widest mb-6">
              <Calendar size={12} className="text-primary-teal" />
              {new Date(exam.startDate).toLocaleDateString('en-GB')} - {new Date(exam.endDate).toLocaleDateString('en-GB')}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50">
                <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest mb-1">Term</p>
                <div className="flex items-center gap-2">
                  <Layout size={14} className="text-primary-teal" />
                  <span className="text-sm font-black text-dark-text">{exam.term}</span>
                </div>
              </div>
              <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50">
                <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest mb-1">Academic Year</p>
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-primary-teal" />
                  <span className="text-sm font-black text-dark-text truncate">{exam.year}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest text-dark-text transition">
                Manage Details
              </button>
              <button className="px-4 py-2.5 bg-primary-teal/5 text-primary-teal rounded-xl hover:bg-primary-teal/10 transition">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 hover:border-primary-teal/50 hover:bg-primary-teal/5 transition-all flex flex-col items-center justify-center p-8 min-h-[300px] group"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-4 transition-colors">
            <Plus size={32} className="text-gray-400 group-hover:text-primary-teal" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text group-hover:text-primary-teal">Create New Exam</p>
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-dark-text/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-dark-text uppercase tracking-tight">New Examination</h3>
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Setup a new exam session</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-50 rounded-2xl transition text-muted-text hover:text-dark-text">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddExam} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-4">Exam Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. End of First Term Exam"
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                  value={newExam.title}
                  onChange={e => setNewExam({...newExam, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-4">Term</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                    value={newExam.term}
                    onChange={e => setNewExam({...newExam, term: e.target.value})}
                  >
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-4">Year</label>
                  <input 
                    type="text" 
                    placeholder="2025/2026"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                    value={newExam.year}
                    onChange={e => setNewExam({...newExam, year: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-4">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                    value={newExam.startDate}
                    onChange={e => setNewExam({...newExam, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-4">End Date</label>
                  <input 
                    type="date" 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                    value={newExam.endDate}
                    onChange={e => setNewExam({...newExam, endDate: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-primary-teal text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-teal/90 transition shadow-lg shadow-primary-teal/20"
              >
                Create Examination
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamConfiguration;