import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Paperclip, Upload, Calendar, Users, ToggleLeft, ToggleRight, FileText, CheckCircle2, User } from 'lucide-react';

const CreateAssignment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId, classId } = location.state || {};

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showPaperSelector, setShowPaperSelector] = useState(false);
  const [availablePapers, setAvailablePapers] = useState([]);
  const [exam, setExam] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [startTime, setStartTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignTo, setAssignTo] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [students, setStudents] = useState([]);
  const [options, setOptions] = useState({
    recordMarks: true,
    allowLate: true,
    allowMultiple: true,
    autoGrade: false,
  });

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch('/api/question-papers');
        if (response.ok) {
          const data = await response.json();
          // Only show published papers for assignments
          setAvailablePapers(data.filter(p => p.status === 'Published'));
        }
      } catch (error) {
        console.error('Failed to fetch papers:', error);
      }
    };
    const fetchStudents = async () => {
      if (!classId) return;
      try {
        const response = await fetch(`/api/students?classId=${classId}&pageSize=100`);
        if (response.ok) {
          const data = await response.json();
          setStudents(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };
    fetchPapers();
    fetchStudents();
  }, [classId]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      const response = await fetch('/api/class-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: instructions,
          dueDate,
          subjectId,
          classId,
          exam,
          assessmentType,
          maxScore,
          startTime,
          assignTo,
          selectedStudents: assignTo === 'specific' ? selectedStudents : [],
          options,
          attachments: selectedPaper ? [{ name: selectedPaper.title, id: selectedPaper.id, type: 'question_paper' }] : [],
        }),
      });

      if (response.ok) {
        navigate(`/dashboard/online-campus/${subjectId}`);
      } else {
        const error = await response.json();
        alert(`Failed to create assignment: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to post assignment:', error);
      alert('An error occurred while creating the assignment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Student Selector Modal */}
      {showStudentSelector && (
        <div className="fixed inset-0 bg-dark-text/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-dark-text leading-tight">Select Students</h3>
                  <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mt-1">Assign to specific learners</p>
                </div>
                <button onClick={() => setShowStudentSelector(false)} className="p-2 hover:bg-light-bg rounded-xl transition">
                  <X size={24} className="text-muted-text" />
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pr-2">
                <button
                  onClick={() => {
                    if (selectedStudents.length === students.length) setSelectedStudents([]);
                    else setSelectedStudents(students.map(s => s.id));
                  }}
                  className="w-full p-4 rounded-2xl border-2 border-primary-teal/20 bg-primary-teal/5 text-primary-teal text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal/10 transition mb-4"
                >
                  {selectedStudents.length === students.length ? 'Deselect All' : 'Select All Class'}
                </button>
                {students.map(student => (
                  <button
                    key={student.id}
                    onClick={() => {
                      if (selectedStudents.includes(student.id)) {
                        setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                      } else {
                        setSelectedStudents([...selectedStudents, student.id]);
                      }
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                      selectedStudents.includes(student.id) ? 'border-primary-teal bg-primary-teal/5' : 'border-gray-50 hover:border-primary-teal/20'
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-soft-sm overflow-hidden flex items-center justify-center">
                        {student.profilePhoto ? <img src={student.profilePhoto} className="w-full h-full object-cover" /> : <User size={20} className="text-muted-text" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-dark-text">{student.firstName} {student.lastName}</h4>
                        <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{student.wristbandId || 'No ID'}</p>
                      </div>
                    </div>
                    {selectedStudents.includes(student.id) && <CheckCircle2 size={20} className="text-primary-teal" />}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowStudentSelector(false)}
                  className="px-8 py-3 bg-primary-teal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20"
                >
                  Done ({selectedStudents.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Paper Selector Modal */}
      {showPaperSelector && (
        <div className="fixed inset-0 bg-dark-text/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-dark-text">Select Question Paper</h3>
                <button onClick={() => setShowPaperSelector(false)} className="p-2 hover:bg-light-bg rounded-xl transition">
                  <X size={24} className="text-muted-text" />
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                {availablePapers.length > 0 ? (
                  availablePapers.map(paper => (
                    <button
                      key={paper.id}
                      onClick={() => { setSelectedPaper(paper); setShowPaperSelector(false); }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                        selectedPaper?.id === paper.id ? 'border-primary-teal bg-primary-teal/5' : 'border-gray-50 hover:border-primary-teal/20'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-white shadow-soft-sm rounded-xl text-primary-teal">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-dark-text">{paper.title}</h4>
                          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Published on {new Date(paper.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {selectedPaper?.id === paper.id && <CheckCircle2 size={20} className="text-primary-teal" />}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm font-bold text-muted-text">No published question papers found.</p>
                    <p className="text-xs font-medium text-gray-400 mt-1">Go to the Question Bank to publish one first.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
              <X size={24} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Assignment</h1>
          </div>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary-teal text-white rounded-full text-sm font-bold hover:bg-secondary-teal transition"
          >
            Assign
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <input 
                type="text" 
                placeholder="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-primary-teal outline-none pb-2 mb-4"
              />
              <textarea 
                placeholder="Instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full h-32 border-none focus:ring-0 outline-none resize-none"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Attach</h3>
              <div className="flex justify-center items-center space-x-8">
                <button 
                  type="button"
                  onClick={() => setShowPaperSelector(true)}
                  className={`flex flex-col items-center space-y-2 transition-colors ${selectedPaper ? 'text-primary-teal' : 'text-gray-600 hover:text-primary-teal'}`}
                >
                  <Paperclip size={24} />
                  <span className="text-sm font-semibold">{selectedPaper ? 'Change Paper' : 'Question Paper'}</span>
                </button>
                <label className="flex flex-col items-center space-y-2 text-gray-600 hover:text-primary-teal cursor-pointer">
                  <Upload size={24} />
                  <span className="text-sm font-semibold">Upload</span>
                  <input type="file" multiple onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {selectedPaper && (
                <div className="mt-6 p-4 bg-primary-teal/5 border border-primary-teal/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white shadow-soft-sm rounded-lg text-primary-teal">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-dark-text uppercase tracking-widest">{selectedPaper.title}</p>
                      <p className="text-[10px] font-bold text-muted-text uppercase tracking-[0.1em]">Attached Question Paper</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPaper(null)}
                    className="p-1.5 hover:bg-rose-50 text-rose-400 rounded-lg transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-soft-sm border border-gray-100 space-y-6">
              <SelectInput 
                label="Exam" 
                options={['Mid-term', 'Final']} 
                value={exam}
                onChange={(e) => setExam(e.target.value)}
              />
              <SelectInput 
                label="Assessment Type" 
                options={['Quiz', 'Test', 'Homework']} 
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
              />
              <TextInput 
                label="Max score" 
                placeholder="Ungraded" 
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
              <DateTimeInput 
                label="Start Time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <DateTimeInput 
                label="Due Date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              
              <div>
                <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest mb-2 ml-1">Assign to</label>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => { setAssignTo('all'); setSelectedStudents([]); }}
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      assignTo === 'all' 
                        ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20' 
                        : 'bg-light-bg text-muted-text border-2 border-transparent hover:border-primary-teal/20'
                    }`}
                  >
                    <Users size={16} className="mr-2" />
                    All students
                  </button>
                  <button 
                    onClick={() => { setAssignTo('specific'); setShowStudentSelector(true); }}
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      assignTo === 'specific' 
                        ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20' 
                        : 'bg-light-bg text-muted-text border-2 border-transparent hover:border-primary-teal/20'
                    }`}
                  >
                    <User size={16} className="mr-2" />
                    {selectedStudents.length > 0 ? `${selectedStudents.length} Selected` : 'Specific students'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-soft-sm border border-gray-100 space-y-6">
              <Toggle label="Record Marks for School-Based Assessment" enabled={options.recordMarks} onChange={() => setOptions({...options, recordMarks: !options.recordMarks})} />
              <Toggle label="Allow Late Submissions" enabled={options.allowLate} onChange={() => setOptions({...options, allowLate: !options.allowLate})} />
              <Toggle label="Allow Multiple Submissions" enabled={options.allowMultiple} onChange={() => setOptions({...options, allowMultiple: !options.allowMultiple})} />
              <Toggle label="Auto grade" enabled={options.autoGrade} onChange={() => setOptions({...options, autoGrade: !options.autoGrade})} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SelectInput = ({ label, options }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">{label}</label>
    <select className="w-full p-4 bg-light-bg border-none rounded-2xl text-xs font-bold text-dark-text outline-none focus:ring-2 focus:ring-primary-teal transition-all">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const TextInput = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="number" 
      placeholder={placeholder} 
      value={value}
      onChange={onChange}
      className="w-full p-4 bg-light-bg border-none rounded-2xl text-xs font-bold text-dark-text outline-none focus:ring-2 focus:ring-primary-teal transition-all" 
    />
  </div>
);

const DateTimeInput = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <input 
        type="datetime-local" 
        value={value}
        onChange={onChange}
        className="w-full p-4 bg-light-bg border-none rounded-2xl text-[10px] font-bold text-dark-text outline-none focus:ring-2 focus:ring-primary-teal transition-all pr-12 cursor-pointer" 
      />
      <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-text group-hover:text-primary-teal transition-colors" />
    </div>
  </div>
);

const Toggle = ({ label, enabled, onChange }) => (
  <div className="flex justify-between items-center gap-4">
    <span className="text-[10px] font-black text-muted-text uppercase tracking-widest flex-1">{label}</span>
    <button 
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-primary-teal shadow-lg shadow-primary-teal/20' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${enabled ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);

export default CreateAssignment;
