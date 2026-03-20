import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Paperclip, Upload, Calendar, Users, ToggleLeft, ToggleRight, FileText, CheckCircle2 } from 'lucide-react';

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
    fetchPapers();
  }, []);

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
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <SelectInput label="Exam" options={['Mid-term', 'Final']} />
              <SelectInput label="Assessment Type" options={['Quiz', 'Test', 'Homework']} />
              <TextInput label="Max score" placeholder="Ungraded" />
              <DateTimeInput label="Start Time" />
              <DateTimeInput label="Due Date" />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
                <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Users size={16} className="mr-2" />
                  All students
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
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
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-teal focus:ring-primary-teal sm:text-sm">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const TextInput = ({ label, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type="text" placeholder={placeholder} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-teal focus:ring-primary-teal sm:text-sm" />
  </div>
);

const DateTimeInput = ({ label }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input type="datetime-local" className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-teal focus:ring-primary-teal sm:text-sm pr-10" />
      <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  </div>
);

const Toggle = ({ label, enabled, onChange }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button onClick={onChange}>
      {enabled ? <ToggleRight size={36} className="text-primary-teal" /> : <ToggleLeft size={36} className="text-gray-300" />}
    </button>
  </div>
);

export default CreateAssignment;
