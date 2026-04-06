import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Timer,
  Trophy,
  X
} from 'lucide-react';

const TakeTest = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { assignmentId, paperId } = location.state || {};

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [integrityViolations, setIntegrityViolations] = useState(0);
  const [showIntegrityWarning, setShowIntegrityWarning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        setIntegrityViolations(prev => prev + 1);
        setShowIntegrityWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isFinished]);

  useEffect(() => {
    if (!paperId) {
      navigate(-1);
      return;
    }
    fetchPaper();
  }, [paperId]);

  const fetchPaper = async () => {
    try {
      const response = await fetch(`/api/question-papers/${paperId}`);
      if (response.ok) {
        const data = await response.json();
        setPaper(data);
        // Set timer if duration exists (assuming 60 mins for now if not specified)
        setTimeLeft(60 * 60); 
      }
    } catch (error) {
      console.error('Failed to fetch paper:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (timeLeft === null || isFinished) return;
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleShortAnswerChange = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Calculate score for MCQs
      let totalScore = 0;
      let possibleScore = 0;
      
      paper.questions.forEach(q => {
        possibleScore += q.marks || 0;
        const isMCQ = q.type === 'MCQ' || q.type === 'Multiple Choice';
        if (isMCQ) {
          const selectedOptionIndex = answers[q.id];
          const selectedOptionValue = q.options[selectedOptionIndex];
          if (selectedOptionValue === q.correctAnswer) {
            totalScore += q.marks || 0;
          }
        }
      });

      const studentId = localStorage.getItem('studentTableId');
      const r = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          studentId,
          fileName: `Digital Exam: ${paper.title}`,
          submittedAt: new Date().toISOString(),
          answers,
          score: totalScore,
          status: 'Turned In',
          integrityViolations // Send the violation count to the server
        })
      });

      if (r.ok) {
        setScore(totalScore);
        setIsFinished(true);
      }
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-soft-xl border border-gray-100 animate-slide-up">
          <div className="w-24 h-24 bg-primary-teal/10 rounded-[2rem] flex items-center justify-center text-primary-teal mx-auto mb-8">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-black text-dark-text mb-2 tracking-tight">Exam Completed!</h2>
          <p className="text-sm font-bold text-muted-text mb-8 uppercase tracking-widest">Your submission has been received.</p>
          
          <div className="bg-light-bg rounded-2xl p-6 mb-8 border border-gray-100">
            <p className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-2">Your Score</p>
            <p className="text-4xl font-black text-primary-teal">{score} <span className="text-sm text-muted-text">points</span></p>
          </div>

          <button 
            onClick={() => navigate(`/portal/subject/${subjectId}`)}
            className="w-full py-4 bg-primary-teal text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20"
          >
            Back to Classroom
          </button>
        </div>
      </div>
    );
  }

  const currentSection = paper?.sections.sort((a, b) => a.order - b.order)[currentSectionIndex];
  const sectionQuestions = paper?.questions.filter(q => q.sectionId === currentSection?.id).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      {/* Integrity Warning Overlay */}
      {showIntegrityWarning && !isFinished && (
        <div className="fixed inset-0 z-[1000] bg-rose-500/90 backdrop-blur-md flex items-center justify-center p-6 text-white">
          <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Focus Warning!</h2>
            <p className="text-lg font-bold opacity-90 leading-relaxed">
              We detected that you switched tabs or left the browser window.
            </p>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Violation Record</p>
              <p className="text-2xl font-black">{integrityViolations} incidents logged</p>
            </div>
            <p className="text-xs font-bold opacity-70">
              This activity has been flagged and will be reported to your teacher. Please return to the exam and stay focused.
            </p>
            <button 
              onClick={() => setShowIntegrityWarning(false)}
              className="w-full py-4 bg-white text-rose-500 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition shadow-xl"
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-text/40 backdrop-blur-sm" onClick={() => setShowExitConfirm(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-dark-text tracking-tight uppercase mb-2">Exit Exam?</h3>
              <p className="text-sm font-bold text-muted-text leading-relaxed mb-8">
                Are you sure you want to exit? Your current progress will not be saved.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmExit}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition shadow-lg shadow-rose-500/20"
                >
                  Yes, Exit Now
                </button>
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-4 bg-light-bg text-muted-text rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-text/40 backdrop-blur-sm" onClick={() => setShowSubmitConfirm(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-dark-text tracking-tight uppercase mb-2">Submit Exam?</h3>
              <p className="text-sm font-bold text-muted-text leading-relaxed mb-8">
                Are you sure you want to finish and submit your exam? You won't be able to change your answers after this.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    handleSubmit();
                  }}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
                >
                  Yes, Submit Now
                </button>
                <button 
                  onClick={() => setShowSubmitConfirm(false)}
                  className="w-full py-4 bg-light-bg text-muted-text rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 py-4 shadow-soft-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-light-bg rounded-xl text-muted-text transition">
              <X size={20} />
            </button>
            <div>
              <h1 className="text-sm font-black text-dark-text uppercase tracking-wider leading-none mb-1">{paper?.title}</h1>
              <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">
                Section {currentSectionIndex + 1} of {paper?.sections.length}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timeLeft < 300 ? 'bg-rose-50 border-rose-100 text-rose-500 animate-pulse' : 'bg-primary-teal/5 border-primary-teal/10 text-primary-teal'}`}>
            <Timer size={18} />
            <span className="text-sm font-black tracking-tighter tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-100 sticky top-[73px] z-50">
        <div 
          className="h-full bg-primary-teal transition-all duration-500"
          style={{ width: `${((currentSectionIndex + 1) / paper.sections.length) * 100}%` }}
        />
      </div>

      {/* Questions Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 py-12 space-y-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-dark-text tracking-tight uppercase">{currentSection?.title}</h2>
          {currentSection?.description && (
            <p className="text-sm font-bold text-muted-text leading-relaxed">{currentSection.description}</p>
          )}
        </div>

        <div className="space-y-12">
          {sectionQuestions?.map((q, idx) => (
            <div key={q.id} className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-sm font-black text-primary-teal bg-primary-teal/5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="space-y-6 flex-1">
                  <h3 className="text-lg font-bold text-dark-text leading-relaxed">{q.text}</h3>
                  
                  { (q.type === 'MCQ' || q.type === 'Multiple Choice') ? (
                    <div className="grid grid-cols-1 gap-3">
                      {q.options.map((option, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionSelect(q.id, oIdx)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                            answers[q.id] === oIdx 
                            ? 'bg-primary-teal border-primary-teal text-white shadow-lg shadow-primary-teal/20' 
                            : 'bg-white border-gray-100 text-muted-text hover:border-primary-teal/30 hover:bg-light-bg/50'
                          }`}
                        >
                          <span className="text-sm font-bold">{option}</span>
                          {answers[q.id] === oIdx ? <CheckCircle2 size={18} /> : <Circle size={18} className="opacity-20" />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      placeholder="Type your answer here..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleShortAnswerChange(q.id, e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-teal transition-all min-h-[120px] shadow-soft-sm"
                    />
                  )}
                  <div className="text-[10px] font-black text-muted-text uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={12} /> {q.marks} Marks
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="bg-white border-t border-gray-100 p-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentSectionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 text-xs font-black text-muted-text uppercase tracking-widest hover:text-dark-text disabled:opacity-30 transition"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          {currentSectionIndex === paper.sections.length - 1 ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={isSubmitting}
              className="px-10 py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Finish & Submit <CheckCircle2 size={18} /></>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentSectionIndex(prev => prev + 1)}
              className="flex items-center gap-2 px-10 py-4 bg-primary-teal text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20"
            >
              Next Section <ChevronRight size={18} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default TakeTest;
