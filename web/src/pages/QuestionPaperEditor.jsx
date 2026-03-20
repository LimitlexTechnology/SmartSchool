import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Plus, Trash2, CheckCircle2, Circle, ChevronUp, ChevronDown, Save } from 'lucide-react';

const QuestionPaperEditor = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPaper = async () => {
    try {
      const response = await fetch(`/api/question-papers/${paperId}`);
      if (response.ok) {
        const data = await response.json();
        setPaper(data);
      }
    } catch (error) {
      console.error('Failed to fetch question paper:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPaper();
  }, [paperId]);

  const handleAddSection = async () => {
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId }),
      });
      if (response.ok) fetchPaper();
    } catch (error) {
      console.error('Failed to add section:', error);
    }
  };

  const handleUpdatePaper = async (updates) => {
    try {
      const response = await fetch(`/api/question-papers/${paperId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setPaper(prev => ({ ...prev, ...updated }));
      }
    } catch (error) {
      console.error('Failed to update paper:', error);
    }
  };

  const handleUpdateSection = async (sectionId, updates) => {
    try {
      await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      setPaper(prev => ({
        ...prev,
        sections: prev.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
      }));
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const moveSection = async (index, direction) => {
    const newSections = [...paper.sections].sort((a, b) => a.order - b.order);
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= newSections.length) return;

    const current = newSections[index];
    const other = newSections[otherIndex];

    const tempOrder = current.order;
    current.order = other.order;
    other.order = tempOrder;

    await Promise.all([
      handleUpdateSection(current.id, { order: current.order }),
      handleUpdateSection(other.id, { order: other.order })
    ]);
    fetchPaper();
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section and all its questions?')) return;
    try {
      const response = await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' });
      if (response.ok) fetchPaper();
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  const handleAddQuestion = async (sectionId) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId }),
      });
      if (response.ok) fetchPaper();
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  const handleUpdateQuestion = async (questionId, updates) => {
    try {
      await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      setPaper(prev => ({
        ...prev,
        questions: prev.questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
      }));
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  };

  const moveQuestion = async (sectionQuestions, index, direction) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= sectionQuestions.length) return;

    const current = sectionQuestions[index];
    const other = sectionQuestions[otherIndex];

    const tempOrder = current.order;
    current.order = other.order;
    other.order = tempOrder;

    await Promise.all([
      handleUpdateQuestion(current.id, { order: current.order }),
      handleUpdateQuestion(other.id, { order: other.order })
    ]);
    fetchPaper();
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, { method: 'DELETE' });
      if (response.ok) fetchPaper();
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const handleAddMCQOption = (question) => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    handleUpdateQuestion(question.id, { options: newOptions });
  };

  const handleUpdateMCQOption = (question, index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    handleUpdateQuestion(question.id, { options: newOptions });
  };

  const handleRemoveMCQOption = (question, index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    const newCorrect = question.correctAnswer === question.options[index] ? null : question.correctAnswer;
    handleUpdateQuestion(question.id, { options: newOptions, correctAnswer: newCorrect });
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!paper) return <div className="p-8 text-center">Paper not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard/question-bank')} className="p-2 rounded-full hover:bg-gray-100 transition">
              <X size={24} className="text-gray-600" />
            </button>
            <div className="flex flex-col">
              <input 
                className="text-lg font-bold text-gray-800 bg-transparent border-none focus:ring-0 p-0"
                value={paper.title}
                onChange={(e) => setPaper({...paper, title: e.target.value})}
                onBlur={() => fetch(`/api/question-papers/${paper.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: paper.title })
                })}
              />
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{paper.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleUpdatePaper({ status: paper.status === 'Published' ? 'Draft' : 'Published' })}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition shadow-lg ${
                paper.status === 'Published' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
              }`}
            >
              {paper.status === 'Published' ? 'Revert to Draft' : 'Publish'}
            </button>
            <button 
              onClick={() => navigate('/dashboard/question-bank')}
              className="px-8 py-2 bg-primary-teal text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 flex items-center gap-2"
            >
              <Save size={16} />
              Done
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {paper.sections.sort((a, b) => a.order - b.order).map((section, sIndex) => {
          const sectionQuestions = paper.questions
            .filter(q => q.sectionId === section.id)
            .sort((a, b) => a.order - b.order);

          return (
            <div key={section.id} className="relative group/section">
              <div className="bg-white rounded-2xl shadow-soft-sm border-l-[6px] border-primary-teal transition-all hover:shadow-md">
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black bg-primary-teal text-white px-3 py-1.5 rounded-full uppercase tracking-[0.2em]">
                      Section {sIndex + 1} of {paper.sections.length}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
                      <button onClick={() => moveSection(sIndex, -1)} disabled={sIndex === 0} className="p-2 hover:bg-light-bg text-muted-text disabled:opacity-20 rounded-xl transition" title="Move Up">
                        <ChevronUp size={20} />
                      </button>
                      <button onClick={() => moveSection(sIndex, 1)} disabled={sIndex === paper.sections.length - 1} className="p-2 hover:bg-light-bg text-muted-text disabled:opacity-20 rounded-xl transition" title="Move Down">
                        <ChevronDown size={20} />
                      </button>
                      <button onClick={() => handleAddQuestion(section.id)} className="p-2 hover:bg-light-bg text-muted-text hover:text-primary-teal rounded-xl transition" title="Add Question">
                        <Plus size={20} />
                      </button>
                      <button onClick={() => handleDeleteSection(section.id)} className="p-2 hover:bg-rose-50 text-muted-text hover:text-rose-500 rounded-xl transition" title="Delete Section">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input 
                      type="text" 
                      value={section.title}
                      onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                      placeholder="Section Title"
                      className="w-full text-2xl font-black text-dark-text border-none focus:ring-0 p-0 placeholder:text-gray-300"
                    />
                    <textarea 
                      value={section.description}
                      onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })}
                      placeholder="Add section instructions or description..."
                      className="w-full text-sm font-bold text-muted-text border-none focus:ring-0 p-0 resize-none min-h-[40px] placeholder:text-gray-300"
                    />
                  </div>

                  {/* Questions Area */}
                  <div className="mt-10 space-y-8">
                    {sectionQuestions.map((question, qIndex) => (
                      <div key={question.id} className="p-6 bg-light-bg/50 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white transition-all group/question relative">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-primary-teal">Q{qIndex + 1}.</span>
                              <input 
                                value={question.text}
                                onChange={(e) => handleUpdateQuestion(question.id, { text: e.target.value })}
                                placeholder="Type your question here..."
                                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-dark-text placeholder:text-gray-400"
                              />
                            </div>

                            {/* Question Type Specific Content */}
                            {question.type === 'Multiple Choice' ? (
                              <div className="pl-8 space-y-3">
                                {question.options?.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center gap-3 group/option">
                                    <button 
                                      onClick={() => handleUpdateQuestion(question.id, { correctAnswer: option })}
                                      className="transition shrink-0"
                                    >
                                      {question.correctAnswer === option ? (
                                        <CheckCircle2 size={18} className="text-primary-teal" />
                                      ) : (
                                        <Circle size={18} className="text-gray-300 hover:text-primary-teal" />
                                      )}
                                    </button>
                                    <input 
                                      value={option}
                                      onChange={(e) => handleUpdateMCQOption(question, oIndex, e.target.value)}
                                      className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-muted-text"
                                    />
                                    <button 
                                      onClick={() => handleRemoveMCQOption(question, oIndex)}
                                      className="p-1.5 opacity-0 group-hover/option:opacity-100 hover:bg-rose-50 text-rose-400 rounded-lg transition"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                                <button 
                                  onClick={() => handleAddMCQOption(question)}
                                  className="text-[10px] font-black text-primary-teal uppercase tracking-widest flex items-center gap-2 mt-2 hover:opacity-70 transition"
                                >
                                  <Plus size={14} /> Add Option
                                </button>
                              </div>
                            ) : (
                              <div className="pl-8">
                                <div className="h-10 border-b border-dashed border-gray-200 w-full opacity-50" />
                              </div>
                            )}
                          </div>

                          <div className="w-full md:w-48 flex flex-row md:flex-col gap-3 shrink-0">
                            <select 
                              value={question.type}
                              onChange={(e) => handleUpdateQuestion(question.id, { type: e.target.value })}
                              className="flex-1 bg-white border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-teal transition"
                            >
                              <option>Multiple Choice</option>
                              <option>Short Answer</option>
                              <option>Long Answer</option>
                            </select>
                            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2">
                              <span className="text-[10px] font-black text-muted-text uppercase">Marks:</span>
                              <input 
                                type="number" 
                                value={question.marks}
                                onChange={(e) => handleUpdateQuestion(question.id, { marks: parseInt(e.target.value) || 0 })}
                                className="w-12 bg-transparent border-none focus:ring-0 p-0 text-xs font-black text-primary-teal text-center"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover/question:opacity-100 transition-all">
                          <button onClick={() => moveQuestion(sectionQuestions, qIndex, -1)} disabled={qIndex === 0} className="p-2 bg-white shadow-md border border-gray-100 rounded-xl text-muted-text disabled:opacity-20 hover:text-primary-teal transition">
                            <ChevronUp size={16} />
                          </button>
                          <button onClick={() => moveQuestion(sectionQuestions, qIndex, 1)} disabled={qIndex === sectionQuestions.length - 1} className="p-2 bg-white shadow-md border border-gray-100 rounded-xl text-muted-text disabled:opacity-20 hover:text-primary-teal transition">
                            <ChevronDown size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 bg-white shadow-md border border-gray-100 rounded-xl text-rose-500 hover:scale-110 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={() => handleAddQuestion(section.id)}
                      className="px-6 py-2.5 rounded-full border-2 border-dashed border-gray-100 text-muted-text hover:border-primary-teal/30 hover:text-primary-teal hover:bg-primary-teal/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                    >
                      <Plus size={16} /> Add Question
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating toolbar for section (Right side) */}
              <div className="absolute -right-16 top-0 hidden lg:flex flex-col gap-2 p-2 bg-white rounded-2xl shadow-soft-sm border border-gray-100 opacity-0 group-hover/section:opacity-100 transition-opacity">
                <button onClick={() => moveSection(sIndex, -1)} disabled={sIndex === 0} className="p-3 hover:bg-light-bg text-muted-text disabled:opacity-20 rounded-xl transition">
                  <ChevronUp size={24} />
                </button>
                <button onClick={() => moveSection(sIndex, 1)} disabled={sIndex === paper.sections.length - 1} className="p-3 hover:bg-light-bg text-muted-text disabled:opacity-20 rounded-xl transition">
                  <ChevronDown size={24} />
                </button>
                <button onClick={() => handleAddQuestion(section.id)} className="p-3 hover:bg-light-bg text-muted-text hover:text-primary-teal rounded-xl transition">
                  <Plus size={24} />
                </button>
              </div>
            </div>
          );
        })}

        <button 
          onClick={handleAddSection}
          className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[2rem] text-muted-text hover:border-primary-teal/30 hover:text-primary-teal hover:bg-primary-teal/5 transition-all flex flex-col items-center gap-2 group"
        >
          <div className="p-3 bg-white shadow-soft-sm rounded-2xl group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em]">Add New Section</span>
        </button>
      </main>
    </div>
  );
};

export default QuestionPaperEditor;
