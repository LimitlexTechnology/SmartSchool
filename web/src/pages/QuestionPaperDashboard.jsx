import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, Tag } from 'lucide-react';

const QuestionPaperDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch('/api/question-papers');
        if (response.ok) {
          const data = await response.json();
          // For each paper, we might want to fetch its details to get section count
          // but for now we'll assume the API returns what we need or we fetch it
          const papersWithDetails = await Promise.all(data.map(async (paper) => {
            const res = await fetch(`/api/question-papers/${paper.id}`);
            return res.ok ? await res.json() : paper;
          }));
          setPapers(papersWithDetails);
        }
      } catch (error) {
        console.error('Failed to fetch question papers:', error);
      }
      setLoading(false);
    };
    fetchPapers();
  }, []);

  const handleCreatePaper = async () => {
    const title = prompt('Enter question paper title:');
    if (title) {
      try {
        const response = await fetch('/api/question-papers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (response.ok) {
          const newPaper = await response.json();
          navigate(`/dashboard/question-bank/${newPaper.id}`);
        }
      } catch (error) {
        console.error('Failed to create question paper:', error);
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-dark-text">Question Bank</h1>
          <p className="text-sm font-bold text-muted-text mt-1">Manage and create exam papers for your classes</p>
        </div>
        <button 
          onClick={handleCreatePaper}
          className="px-6 py-3 bg-primary-teal text-white rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20"
        >
          <Plus size={18} />
          Create Question Paper
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.length > 0 ? papers.map(paper => (
          <Link 
            key={paper.id} 
            to={`/dashboard/question-bank/${paper.id}`} 
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-soft-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-teal/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-primary-teal/10 rounded-2xl flex items-center justify-center text-primary-teal border border-primary-teal/20">
                  <FileText size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  paper.status === 'Published' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {paper.status}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-dark-text group-hover:text-primary-teal transition-colors mb-1 line-clamp-1">
                  {paper.title}
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-text uppercase tracking-widest">
                  <Clock size={12} />
                  <span>Created {new Date(paper.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-dark-text">{paper.sections?.length || 0}</span>
                    <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Sections</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100 mx-2" />
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-dark-text">{paper.questions?.length || 0}</span>
                    <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Questions</span>
                  </div>
                </div>
                <div className="p-2 bg-light-bg rounded-xl text-muted-text group-hover:text-primary-teal transition-colors">
                  <Tag size={18} />
                </div>
              </div>
            </div>
          </Link>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-light-bg rounded-[2rem] flex items-center justify-center text-muted-text mx-auto mb-6">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-black text-dark-text mb-2">No question papers yet</h3>
            <p className="text-sm font-bold text-muted-text max-w-xs mx-auto mb-8">
              Start by creating your first exam paper for students to take online.
            </p>
            <button 
              onClick={handleCreatePaper}
              className="px-8 py-3 bg-primary-teal text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPaperDashboard;
