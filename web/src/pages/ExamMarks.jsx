import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  RotateCcw, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  BookOpen,
  History,
  Loader2,
  FileText,
  ClipboardCheck,
  CheckCircle,
  X,
  ChevronDown,
  MessageSquare
} from 'lucide-react';

const ExamMarks = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [showFilters, setShowFilters] = useState(false);
  
  const [exams, setExams] = useState([]);
  const [examConfigs, setExamConfigs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [includes, setIncludes] = useState({
    marks: true,
    comments: false,
    synopsis: false
  });

  // CA Test Modal & Entry state
  const [showCaTestModal, setShowCaTestModal] = useState(false);
  const [isCaEntryMode, setIsCaEntryMode] = useState(false);
  const [caTestData, setCaTestData] = useState({
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    maxScore: '',
    topic: '',
    description: ''
  });

  // Pedagogical lock state
  const [caStatus, setCaStatus] = useState({ 
    totalElements: 0, 
    completedElements: 0, 
    isComplete: false, 
    elements: [] 
  });
  const [caLoading, setCaLoading] = useState(false);
  const [isCaOverviewMode, setIsCaOverviewMode] = useState(false);

  // Real data for students and their marks
  const [students, setStudents] = useState([]);
  const [caMarks, setCaMarks] = useState([]);
  const [allScales, setAllScales] = useState([]);
  
  // Review Summary State
  const [marksSummary, setMarksSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedElement('');
    setIsCaOverviewMode(false);
    
    if (activeTab === 'review') {
      fetchSummary();
    }
  }, [activeTab]);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/admin/marks/summary');
      const data = await res.json();
      setMarksSummary(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching marks summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Initial load: Exams, Exam Configs, Classes and Assessments
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
        
        // Explicitly handle both direct array and nested object structures
        if (Array.isArray(classesData)) {
          setClasses(classesData);
        } else if (classesData && Array.isArray(classesData.classes)) {
          setClasses(classesData.classes);
        } else {
          setClasses([]);
        }

        setExamConfigs(settingsData?.examConfigs || []);
        setAllAssessments(settingsData?.assessments || []);
        setAllScales(settingsData?.scales || []);
        
        // Load all subjects for the dropdown
        if (subjectsData && Array.isArray(subjectsData.subjects)) {
          setSubjects(subjectsData.subjects);
        } else if (Array.isArray(subjectsData)) {
          setSubjects(subjectsData.map(s => typeof s === 'string' ? s : s.name));
        } else if (subjectsData && Array.isArray(subjectsData.data)) {
          setSubjects(subjectsData.data);
        }
        
        // No longer auto-selecting dummy data
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Filter classes based on selected exam config
  const filteredClasses = useMemo(() => {
    if (!selectedExam) return classes;
    const config = examConfigs.find(c => c.id === selectedExam);
    if (!config || !config.classes || config.classes.length === 0) return classes;
    
    // Check both ID and Name with case-insensitive and trimmed matching
    const results = classes.filter(c => {
      const matchId = config.classes.includes(c.id);
      const matchValue = config.classes.some(val => 
        val.toLowerCase().trim() === (c.name || '').toLowerCase().trim() ||
        val.toLowerCase().trim() === (c.grade || '').toLowerCase().trim()
      );
      return matchId || matchValue;
    });
    
    // Fallback: if we filtered but found nothing, show all classes
    return results.length > 0 ? results : classes;
  }, [selectedExam, examConfigs, classes]);

  // Auto-select exam when transitioning to exams tab if none selected
  useEffect(() => {
    if (activeTab === 'exams' && !selectedExam && selectedClass && examConfigs.length > 0) {
      // Find a config that matches the selected class
      const config = examConfigs.find(c => 
        (c.classes || []).includes(selectedClass) || 
        (c.classes || []).some(cls => {
          const targetClass = classes.find(cx => cx.id === selectedClass);
          return targetClass && (
            cls === targetClass.name || 
            cls === targetClass.grade || 
            cls === `${targetClass.grade} - ${targetClass.name}`
          );
        })
      );
      if (config) {
        setSelectedExam(config.id);
      }
    }
  }, [activeTab, selectedExam, selectedClass, examConfigs, classes]);

  // Handle subject fetching (now handled in initial load for all subjects)
  // Removed redundant useEffect that was fetching but not storing subjects

  // Fetch students and marks when context changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      setStudents([]);
      return;
    }
    
    if (activeTab === 'exams' && !selectedExam) {
      setStudents([]);
      return;
    }
    
    if (activeTab === 'ca' && !selectedElement && !isCaOverviewMode) {
      setStudents([]);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = '';
        if (activeTab === 'exams') {
          query = `examId=${encodeURIComponent(selectedExam)}&classId=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}`;
        } else if (isCaOverviewMode) {
          query = `classId=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}&assessmentType=ca`;
        } else {
          // Ensure selectedElement is included, otherwise use a generic CA query
          query = `classId=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}&assessmentType=ca${selectedElement ? `&elementName=${encodeURIComponent(selectedElement)}` : ''}`;
        }

        console.log('Fetching marks with query:', query);
        const promises = [
          fetch(`/api/students?classId=${encodeURIComponent(selectedClass)}&pageSize=100`),
          fetch(`/api/marks?${query}`)
        ];

        // If in exams tab or CA overview mode, also fetch all CA marks
        if (activeTab === 'exams' || (activeTab === 'ca' && isCaOverviewMode)) {
          // If we are in CA overview mode, the second promise already fetched all CA marks
          if (activeTab === 'exams') {
            promises.push(fetch(`/api/marks?classId=${selectedClass}&subject=${selectedSubject}&assessmentType=ca`));
          }
        }

        const responses = await Promise.all(promises);
        const studentsData = await responses[0].json();
        const marksData = await responses[1].json();
        
        let caMarksData = [];
        if (activeTab === 'exams') {
          caMarksData = await responses[2].json();
        } else if (activeTab === 'ca' && isCaOverviewMode) {
          caMarksData = marksData; // In CA overview mode, marksData contains all CA marks
        }

        // Ensure marksData is an array to prevent crashes
        const safeMarksData = Array.isArray(marksData) ? marksData : [];
        const safeCaMarksData = Array.isArray(caMarksData) ? caMarksData : [];
        setCaMarks(safeCaMarksData);
        
        const merged = (studentsData.data || []).map(s => {
          const m = isCaOverviewMode ? null : safeMarksData.find(mark => mark.studentId === s.id);
          return {
            ...s,
            name: `${s.firstName} ${s.lastName}`,
            admissionNo: s.studentId,
            score: m ? m.score : null,
            comment: m ? m.comment : '',
            synopsis: m ? m.synopsis : '',
            status: m ? 'Graded' : 'Pending',
            source: m ? 'Manual Entry' : '-'
          };
        });
        
        setStudents(merged);
      } catch (error) {
        console.error('Error fetching marks data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedExam, selectedClass, selectedSubject, activeTab, selectedElement, isCaOverviewMode]);

  // Fetch CA completion status for pedagogical lock and CA elements
  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      setCaStatus({ totalElements: 0, completedElements: 0, isComplete: false, elements: [] });
      return;
    }

    const fetchCaStatus = async () => {
      setCaLoading(true);
      try {
        const res = await fetch(`/api/ca-status?classId=${selectedClass}&subject=${selectedSubject}`);
        const data = await res.json();
        
        // If the API returns no elements, try to populate from Exam Config assessment type
        if ((!data.elements || data.elements.length === 0) && selectedExam) {
          const config = examConfigs.find(c => c.id === selectedExam);
          if (config && config.assessmentType) {
            const assessment = allAssessments.find(a => a.name === config.assessmentType);
            if (assessment && assessment.items) {
              data.totalElements = assessment.items.length;
              data.elements = assessment.items.map(item => ({
                name: item.name,
                totalMarks: item.total,
                completed: false,
                studentCount: 0
              }));
              data.isComplete = false;
            }
          }
        }
        
        setCaStatus(data);
      } catch (error) {
        console.error('Error fetching CA status:', error);
      } finally {
        setCaLoading(false);
      }
    };

    fetchCaStatus();
  }, [selectedClass, selectedSubject, selectedExam, examConfigs, allAssessments]);

  const handleFieldChange = (id, field, value) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { 
        ...s, 
        [field]: field === 'score' ? (value === '' ? null : parseFloat(value)) : value, 
        status: (field === 'score' && value === '') ? 'Pending' : 'Draft' 
      } : s
    ));
  };

  const handleSave = async (isNext = false) => {
    if (!selectedClass || !selectedSubject) return;
    
    // Determine examId: if in exams tab, use selectedExam; if in CA tab, use 'ca-marks'
    // But for the backend, it needs an examId. If selectedExam is empty, use 'ca-marks' as fallback
    const effectiveExamId = (activeTab === 'exams') ? selectedExam : (selectedExam || 'ca-marks');
    
    if (activeTab === 'exams' && !selectedExam) {
      alert('Please select an exam before saving marks.');
      return;
    }

    if (activeTab === 'ca' && !selectedElement) {
      alert('Please select a CA element before saving marks.');
      return;
    }
    
    // Client side check for pedagogical lock
    if (activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete) {
      const incompleteNames = caStatus.elements.filter(e => !e.completed).map(e => e.name).join(', ');
      alert(`Pedagogical Lock: Cannot enter exam marks until all CA elements are recorded. Please complete: ${incompleteNames}`);
      return;
    }

    setSaving(true);
    try {
      const entries = students
        .filter(s => s.score !== null || s.comment || s.synopsis)
        .map(s => ({ 
          studentId: s.id, 
          score: s.score,
          comment: s.comment,
          synopsis: s.synopsis
        }));
      
      const body = {
        classId: selectedClass,
        subject: selectedSubject,
        entries,
        assessmentType: activeTab === 'exams' ? 'exam' : 'ca',
        examId: effectiveExamId
      };
      
      if (activeTab === 'ca') {
        body.elementName = selectedElement;
        // The backend specifically handles 'ca-marks' for CA
        body.examId = 'ca-marks';
      }
      
      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setStudents(prev => prev.map(s => s.status === 'Draft' ? { ...s, status: 'Graded', source: 'Manual Entry' } : s));
        
        // Refresh CA status and all CA marks after saving
        const [caStatusRes, allCaMarksRes] = await Promise.all([
          fetch(`/api/ca-status?classId=${selectedClass}&subject=${selectedSubject}`),
          fetch(`/api/marks?classId=${selectedClass}&subject=${selectedSubject}&assessmentType=ca`)
        ]);
        
        const caData = await caStatusRes.json();
        const allCaMarks = await allCaMarksRes.json();
        
        setCaStatus(caData);
        setCaMarks(Array.isArray(allCaMarks) ? allCaMarks : []);

        if (isNext) {
          // Transition to next element logic
          // Find the active assessment config for this context
          const config = examConfigs.find(c => c.id === selectedExam);
          const assessment = allAssessments.find(a => a.name === config?.assessmentType) || allAssessments[0];
          
          if (assessment && assessment.items) {
            const items = assessment.items;
            const currentIndex = items.findIndex(item => item.name === selectedElement);
            
            if (currentIndex !== -1 && currentIndex < items.length - 1) {
              const nextItem = items[currentIndex + 1];
              setSelectedElement(nextItem.name);
              setCaTestData(prev => ({ ...prev, maxScore: nextItem.total }));
              alert(`Saved! Now entering marks for: ${nextItem.name}`);
            } else {
              alert('Saved! All CA elements for this assessment type have been processed. Transitioning to Exams for final scaling.');
              setIsCaEntryMode(false);
              setActiveTab('exams');
              // The auto-select exam effect will handle setting the selectedExam if it's empty
            }
          } else {
            // Fallback to the old flattened logic if no specific assessment found
            const flattened = allAssessments.flatMap(a => (a.items || []).map(item => ({
              ...item,
              parentName: a.name
            })));
            const idx = flattened.findIndex(item => item.name === selectedElement);
            if (idx !== -1 && idx < flattened.length - 1) {
              const next = flattened[idx + 1];
              setSelectedElement(next.name);
              setCaTestData(prev => ({ ...prev, maxScore: next.total }));
            } else {
              setIsCaEntryMode(false);
              setActiveTab('exams');
            }
          }
        } else {
          alert('Marks saved successfully!');
        }
      } else {
        const errorData = await res.json();
        alert(errorData.message || errorData.error || 'Failed to save marks');
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const getGrade = (score) => {
    if (score === null) return '-';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Graded': return 'text-emerald-500 bg-emerald-50';
      case 'Draft': return 'text-amber-500 bg-amber-50';
      case 'Pending': return 'text-rose-500 bg-rose-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  // Calculate final scores including CA total and scaled exam marks
  const studentFinalScores = useMemo(() => {
    // We want to calculate final scores even if we're not in the exams tab, 
    // to potentially show them in overview or for validation
    if (!selectedClass || !selectedSubject) return {};
    
    // Find the relevant exam config and its assessment type
    // If multiple configs exist for this class, we try to find the one matching selectedExam
    let config = examConfigs.find(c => c.id === selectedExam);
    
    // Fallback: find any config that matches the selected class
    if (!config && selectedClass) {
      config = examConfigs.find(c => 
        (c.classes || []).includes(selectedClass) || 
        (c.classes || []).some(cls => {
          const targetClass = classes.find(cx => cx.id === selectedClass);
          return targetClass && (cls === targetClass.name || cls === targetClass.grade);
        })
      );
    }
    
    // We still want to compute basic CA sums even if config is missing
    let scale;
    let assessment;
    if (config) {
      scale = allScales.find(s => s.name === config.scale);
      assessment = allAssessments.find(a => a.name === config.assessmentType);
    }
    
    // Calculate Max CA Total
    const maxCaTotal = assessment?.items?.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) || 100;
    
    const scores = {};
    students.forEach(student => {
      // 1. Calculate Student CA Total (sum of all CA elements)
      const studentCaMarks = caMarks.filter(m => m.studentId === student.id);
      const studentCaTotal = studentCaMarks.reduce((sum, m) => sum + (parseFloat(m.score) || 0), 0);
      
      // 2. Scale CA Score
      // If scale.to is 40, and maxCaTotal is 60, then scaledCa = (studentCaTotal / 60) * 40
      const caScaleFactor = scale ? (parseFloat(scale.to) / maxCaTotal) : 0.4; // fallback to 40%
      const scaledCa = studentCaTotal * caScaleFactor;
      
      // 3. Scale Exam Score (out of 100)
      // If scale.from is 60, then scaledExam = (student.score / 100) * 60
      const examScaleFactor = scale ? (parseFloat(scale.from) / 100) : 0.6; // fallback to 60%
      const scaledExam = (parseFloat(student.score) || 0) * examScaleFactor;
      
      // 4. Grand Total
      const grandTotal = scaledCa + scaledExam;
      
      scores[student.id] = {
        caTotal: studentCaTotal.toFixed(1),
        scaledCa: scaledCa.toFixed(1),
        scaledExam: scaledExam.toFixed(1),
        grandTotal: grandTotal.toFixed(1),
        maxCaTotal
      };
    });
    
    return scores;
  }, [selectedExam, selectedClass, selectedSubject, examConfigs, allScales, allAssessments, students, caMarks]);

  const stats = useMemo(() => {
    if (students.length === 0) return [];
    const total = students.length;
    const graded = students.filter(s => s.status === 'Graded').length;
    const pending = students.filter(s => s.status === 'Pending').length;
    
    // Calculate average based on grandTotal if in exams tab, otherwise use raw score
    let avg = '0.0';
    if (activeTab === 'exams') {
      const validScores = Object.values(studentFinalScores).map(s => parseFloat(s.grandTotal || 0));
      if (validScores.length > 0) {
        avg = (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1);
      }
    } else {
      const scores = students.filter(s => s.score !== null).map(s => s.score);
      if (scores.length > 0) {
        avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
      }
    }
    
    return [
      { label: 'Total Students', value: total, icon: User, color: 'text-blue-500' },
      { label: 'Graded', value: graded, icon: CheckCircle2, color: 'text-emerald-500' },
      { label: 'Pending', value: pending, icon: AlertCircle, color: 'text-rose-500' },
      { label: 'Avg. Score', value: `${avg}%`, icon: TrendingUp, color: 'text-primary-teal' },
    ];
  }, [students, studentFinalScores, activeTab]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-xl font-black text-dark-text tracking-tight uppercase">Exams</h1>
        <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest opacity-70">Marks for examinations</p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-4 p-5 rounded-[1.2rem] border-2 transition-all text-left min-w-[220px] ${
            activeTab === 'exams' ? 'bg-white border-primary-teal shadow-soft-xl' : 'bg-white border-transparent hover:border-gray-100 shadow-soft-sm'
          }`}
        >
          <div className="space-y-0.5 flex-1">
            <h3 className={`text-xs font-black uppercase tracking-tight ${activeTab === 'exams' ? 'text-dark-text' : 'text-muted-text'}`}>Exams</h3>
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60">Marks for examinations</p>
              {selectedClass && selectedSubject && caStatus.totalElements > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter ${caStatus.isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {caStatus.isComplete ? 'Unlocked' : 'Locked'}
                </span>
              )}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === 'exams' ? 'bg-primary-teal/10 text-primary-teal' : 'bg-gray-50 text-gray-400'
          }`}>
            {selectedClass && selectedSubject && caStatus.totalElements > 0 && !caStatus.isComplete ? (
              <AlertCircle size={20} className="text-rose-500" />
            ) : (
              <FileText size={20} />
            )}
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('ca')}
          className={`flex items-center gap-4 p-5 rounded-[1.2rem] border-2 transition-all text-left min-w-[220px] ${
            activeTab === 'ca' ? 'bg-white border-primary-teal shadow-soft-xl' : 'bg-white border-transparent hover:border-gray-100 shadow-soft-sm'
          }`}
        >
          <div className="space-y-0.5 flex-1">
            <h3 className={`text-xs font-black uppercase tracking-tight ${activeTab === 'ca' ? 'text-dark-text' : 'text-muted-text'}`}>Continuous Assessment</h3>
            <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60">Marks for assessments</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === 'ca' ? 'bg-primary-teal/10 text-primary-teal' : 'bg-gray-50 text-gray-400'
          }`}>
            <ClipboardCheck size={20} />
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-4 p-5 rounded-[1.2rem] border-2 transition-all text-left min-w-[220px] ${
            activeTab === 'review' ? 'bg-white border-primary-teal shadow-soft-xl' : 'bg-white border-transparent hover:border-gray-100 shadow-soft-sm'
          }`}
        >
          <div className="space-y-0.5 flex-1">
            <h3 className={`text-xs font-black uppercase tracking-tight ${activeTab === 'review' ? 'text-dark-text' : 'text-muted-text'}`}>Review Assessments</h3>
            <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60">Approve/reject assessments</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === 'review' ? 'bg-primary-teal/10 text-primary-teal' : 'bg-gray-50 text-gray-400'
          }`}>
            <CheckCircle size={20} />
          </div>
        </button>
      </div>

      {/* Filter Button */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-gray-200 text-muted-text hover:bg-gray-300`}
          >
            <Filter size={14} />
            Filter
          </button>
          
          <button 
            className="p-2.5 text-muted-text hover:text-primary-teal hover:bg-primary-teal/5 rounded-xl transition"
            title="Download Excel"
          >
            <Download size={20} />
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search student name..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-dark-text focus:border-primary-teal transition outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Drawer */}
      {isDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[9998] animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-[400px] bg-white z-[9999] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-dark-text uppercase tracking-tight">Filter</h2>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition"
              >
                <X size={14} /> Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Filter Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Selection</span>
                  <div className="flex items-center gap-4">
                    {activeTab === 'ca' && (
                      <button 
                        onClick={() => setIsCaOverviewMode(!isCaOverviewMode)}
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded transition ${isCaOverviewMode ? 'bg-primary-teal text-white' : 'text-primary-teal hover:bg-primary-teal/10'}`}
                      >
                        {isCaOverviewMode ? 'Overview: ON' : 'Overview: OFF'}
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedExam('');
                        setSelectedClass('');
                        setSelectedSubject('');
                        setSelectedElement('');
                        setIsCaOverviewMode(false);
                      }}
                      className="text-[10px] font-black text-primary-teal uppercase tracking-widest hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <select 
                      disabled={activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete}
                      className="w-full appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      value={selectedExam}
                      onChange={(e) => {
                        setSelectedExam(e.target.value);
                        setSelectedClass(''); // Reset class when exam changes
                      }}
                    >
                      <option value="">Select Exam</option>
                      {/* Merge both specific exam instances and the configurations */}
                      {examConfigs.length > 0 ? (
                        examConfigs.map(e => <option key={e.id} value={e.id}>{e.name}</option>)
                      ) : (
                        exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)
                      )}
                    </select>
                    <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select 
                      disabled={activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete}
                      className="w-full appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">Select Class ({filteredClasses.length})</option>
                      {filteredClasses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.grade || ''}{c.name ? ` - ${c.name}` : ''}{!c.grade && !c.name ? `Class ${c.id.substring(0,4)}` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select 
                      disabled={activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete}
                      className="w-full appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      value={selectedSubject}
                      onChange={(e) => {
                        const val = e.target.value;
                        console.log('Subject selected:', val);
                        setSelectedSubject(val);
                      }}
                    >
                      <option value="">Select Subject ({subjects.length})</option>
                      {subjects.map((s, idx) => (
                        <option key={`${idx}-${s}`} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {activeTab === 'ca' && (
                    <div className="relative">
                    <select 
                      className="w-full appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                      value={selectedElement}
                      onChange={(e) => {
                        setSelectedElement(e.target.value);
                        if (e.target.value) setIsCaOverviewMode(false);
                      }}
                    >
                      <option value="">Select CA Element</option>
                      {activeTab === 'ca' ? (
                        // Flatten all assessment items from all configurations
                        allAssessments.flatMap(a => (a.items || []).map(item => ({
                          ...item,
                          parentName: a.name
                        }))).map((item, idx) => (
                          <option key={idx} value={item.name}>
                            {item.name} ({item.total}) - {item.parentName}
                          </option>
                        ))
                      ) : (
                        // In Exams tab, show elements of the currently active assessment for the selected class
                        caStatus.elements.map((e, idx) => (
                          <option key={idx} value={e.name}>
                            {e.name} ({e.totalMarks}) {e.completed ? '✓' : ''}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  )}
                </div>
              </div>

              {/* Include Section */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-muted-text uppercase tracking-widest block mb-2">Include</span>
                <div className="space-y-3">
                  <button 
                    onClick={() => setIncludes(prev => ({ ...prev, marks: !prev.marks }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      includes.marks ? 'bg-primary-teal/5 border-primary-teal shadow-soft-sm' : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${includes.marks ? 'bg-primary-teal text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <TrendingUp size={20} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-tight ${includes.marks ? 'text-dark-text' : 'text-muted-text'}`}>Marks</span>
                  </button>

                  <button 
                    onClick={() => setIncludes(prev => ({ ...prev, comments: !prev.comments }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      includes.comments ? 'bg-primary-teal/5 border-primary-teal shadow-soft-sm' : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${includes.comments ? 'bg-primary-teal text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <MessageSquare size={20} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-tight ${includes.comments ? 'text-dark-text' : 'text-muted-text'}`}>Subject Comments</span>
                  </button>

                  <button 
                    onClick={() => setIncludes(prev => ({ ...prev, synopsis: !prev.synopsis }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      includes.synopsis ? 'bg-primary-teal/5 border-primary-teal shadow-soft-sm' : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${includes.synopsis ? 'bg-primary-teal text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <FileText size={20} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-tight ${includes.synopsis ? 'text-dark-text' : 'text-muted-text'}`}>Synopsis</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-50 bg-gray-50/30">
              <button 
                onClick={() => {
                  if (activeTab === 'ca' && includes.marks && selectedElement && selectedClass && selectedSubject) {
                    // Pre-fill max score if possible
                    const selectedItem = allAssessments.flatMap(a => a.items || []).find(item => item.name === selectedElement);
                    setCaTestData(prev => ({ ...prev, maxScore: selectedItem?.total || '' }));
                    setShowCaTestModal(true);
                    setIsDrawerOpen(false);
                  } else {
                    setIsDrawerOpen(false);
                  }
                }}
                className="w-full py-4 bg-primary-teal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal/90 transition shadow-lg shadow-primary-teal/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      {/* CA Test Modal */}
      {showCaTestModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-12 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-dark-text tracking-tight uppercase">Continuous Assessment</h2>
                <p className="text-xs font-bold text-muted-text uppercase tracking-widest opacity-60">Create a test and allocate scores to the individual students afterwards</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl">
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Date</span>
                  <input 
                    type="text" 
                    value={caTestData.date}
                    readOnly
                    className="flex-1 bg-transparent text-sm font-black text-dark-text outline-none"
                  />
                </div>

                <input 
                  type="number" 
                  placeholder="Maximum Score"
                  value={caTestData.maxScore}
                  onChange={(e) => setCaTestData(prev => ({ ...prev, maxScore: e.target.value }))}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black text-dark-text focus:border-primary-teal outline-none transition placeholder:text-gray-300"
                />

                <input 
                  type="text" 
                  placeholder="Topic"
                  value={caTestData.topic}
                  onChange={(e) => setCaTestData(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black text-dark-text focus:border-primary-teal outline-none transition placeholder:text-gray-300"
                />

                <textarea 
                  placeholder="Description"
                  rows="4"
                  value={caTestData.description}
                  onChange={(e) => setCaTestData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black text-dark-text focus:border-primary-teal outline-none transition placeholder:text-gray-300 resize-none"
                />
              </div>

              <button 
                onClick={() => {
                  if (!caTestData.maxScore || !caTestData.topic) {
                    alert('Please fill in at least the Maximum Score and Topic');
                    return;
                  }
                  setShowCaTestModal(false);
                  setIsCaEntryMode(true);
                }}
                className="w-full py-5 bg-primary-teal/40 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal/50 transition flex items-center justify-center gap-2"
              >
                Submit
                <CheckCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-soft-xl overflow-hidden min-h-[500px] flex flex-col">
        {activeTab === 'review' ? (
          /* Review Assessments View */
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-dark-text uppercase tracking-tight">Review Submissions</h2>
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest opacity-60">Overview of all marks entries across classes and subjects</p>
              </div>
              <button 
                onClick={fetchSummary}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 transition flex items-center gap-2"
              >
                <RotateCcw size={14} className={summaryLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Assessment Details</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Class</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Completion</th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Last Updated</th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-muted-text uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summaryLoading ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <Loader2 size={40} className="text-primary-teal animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-muted-text uppercase tracking-widest">Fetching submissions...</p>
                      </td>
                    </tr>
                  ) : marksSummary.length > 0 ? marksSummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase ${
                            item.assessmentType === 'ca' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                          }`}>
                            {item.assessmentType === 'ca' ? 'CA' : 'EX'}
                          </div>
                          <div>
                            <div className="text-sm font-black text-dark-text tracking-tight uppercase">{item.examTitle}</div>
                            <div className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60">
                              {item.elementName ? item.elementName : (item.assessmentType === 'ca' ? 'CA Overview' : 'Final Exam')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-dark-text uppercase">{item.className}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-muted-text uppercase tracking-tight">{item.subject}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-dark-text">{item.recordedCount} / {item.totalStudents}</span>
                            <span className="text-[9px] font-bold text-muted-text uppercase tracking-tighter opacity-60">Recorded</span>
                          </div>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${item.isComplete ? 'bg-emerald-500' : 'bg-primary-teal'}`}
                              style={{ width: `${Math.min(100, (item.recordedCount / Math.max(1, item.totalStudents)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">
                          {new Date(item.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          item.isComplete ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => {
                            setSelectedExam(item.examId);
                            // Need to handle classId properly since it might be canonical or name
                            setSelectedClass(item.classId);
                            setSelectedSubject(item.subject);
                            if (item.assessmentType === 'ca') {
                              setActiveTab('ca');
                              setSelectedElement(item.elementName || '');
                            } else {
                              setActiveTab('exams');
                            }
                          }}
                          className="px-4 py-2 bg-gray-50 text-muted-text hover:bg-primary-teal hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <p className="text-sm font-bold text-muted-text italic">No submissions found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : isCaEntryMode ? (
          /* CA Marks Entry Sheet */
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Entry Sheet Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsCaEntryMode(false)}
                  className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <RotateCcw size={14} className="rotate-180" />
                  Back to tests
                </button>
                <div className="h-8 w-[1px] bg-gray-200" />
                <div>
                  <h3 className="text-sm font-black text-dark-text tracking-tight uppercase">
                    {selectedExam ? exams.find(e => e.id === selectedExam)?.title : ''} / {classes.find(c => c.id === selectedClass)?.name} / {selectedSubject}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 transition flex items-center gap-2">
                  <MessageSquare size={14} />
                  Edit Test Details
                </button>
                <button 
                  onClick={() => handleSave(false)}
                  className="px-6 py-2 bg-white border border-gray-200 text-dark-text rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Save size={14} />
                  Save
                </button>
                <button 
                  onClick={() => handleSave(true)}
                  className="px-6 py-2 bg-primary-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal/90 transition shadow-lg shadow-primary-teal/20 flex items-center gap-2"
                >
                  <TrendingUp size={14} />
                  Save & Next
                </button>
              </div>
            </div>

            {/* Entry Sheet Toolbar */}
            <div className="p-6 border-b border-gray-50">
              <div className="relative max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-xl text-xs font-bold text-dark-text focus:bg-white focus:border-primary-teal transition outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Entry Sheet Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/20 border-b border-gray-50">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest w-16">#</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Name</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Student ID</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Marks ({caTestData.maxScore})</th>
                    <th className="px-8 py-5 text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5 text-[10px] font-bold text-muted-text">{idx + 1}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-[10px]">
                            {(student.firstName?.[0] || '')}{(student.lastName?.[0] || '')}
                          </div>
                          <div>
                            <div className="text-sm font-black text-dark-text tracking-tight uppercase">{student.name}</div>
                            <div className="text-[9px] font-bold text-muted-text uppercase">{classes.find(c => c.id === selectedClass)?.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-black text-muted-text">{student.admissionNo}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            max={caTestData.maxScore}
                            className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-black text-dark-text focus:border-primary-teal outline-none transition"
                            value={student.score === null ? '' : student.score}
                            onChange={(e) => handleFieldChange(student.id, 'score', e.target.value)}
                          />
                          <ChevronDown size={14} className="text-gray-300" />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty State or Regular Table */
          (!selectedClass || !selectedSubject || (activeTab === 'ca' && !selectedElement && !isCaOverviewMode)) ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-48 h-48 mb-8 relative">
              <div className="absolute inset-0 bg-primary-teal/5 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                   {/* Hand and boxes illustration concept */}
                  <div className="flex gap-2 mb-4">
                    <div className="w-8 h-10 bg-amber-100/50 rounded-md border border-amber-200"></div>
                    <div className="w-8 h-10 bg-amber-100/50 rounded-md border border-amber-200 ring-4 ring-primary-teal/20"></div>
                    <div className="w-8 h-10 bg-amber-100/50 rounded-md border border-amber-200"></div>
                  </div>
                  <div className="absolute -bottom-2 -right-4">
                    <div className="w-12 h-12 text-primary-teal opacity-40">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-dark-text tracking-tight mb-2">
              {(!selectedClass || !selectedSubject) 
                ? "Please select a class and a subject in toolbar above to proceed."
                : "Please select a CA element or enable Overview to view marks."}
            </h3>
          </div>
        ) : (
          /* Marks Table & Content */
          <>
            {/* Stats Summary when active */}
            {stats.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-8 border-b border-gray-50">
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest mb-1">{stat.label}</p>
                      <h4 className="text-lg font-black text-dark-text tracking-tight">{stat.value}</h4>
                    </div>
                    <div className={`w-8 h-8 rounded-xl bg-white shadow-soft-sm flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pedagogical Lock Warning */}
            {caStatus.totalElements > 0 && !caStatus.isComplete && (
              <div className="mx-8 mt-6 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-rose-600 uppercase tracking-tight">Pedagogical Lock Active</h4>
                  <p className="text-xs font-bold text-rose-500/80 leading-relaxed mt-1">
                    You cannot enter or save exam marks for this class until all continuous assessment (CA) elements are completed. 
                    <span className="block mt-1">Missing elements: <strong className="font-black">{caStatus.elements.filter(e => !e.completed).map(e => e.name).join(', ')}</strong></span>
                  </p>
                </div>
                <button 
                   onClick={() => setActiveTab('ca')}
                   className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition shadow-lg shadow-rose-200"
                >
                  Go to CA
                </button>
              </div>
            )}

            <div className="flex-1 overflow-x-auto relative">
              {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={40} className="text-primary-teal animate-spin" />
                    <p className="text-[10px] font-black text-muted-text uppercase tracking-widest">Loading students...</p>
                  </div>
                </div>
              )}
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Student Information</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Admission No</th>
                    {includes.marks && !isCaOverviewMode && (
                      <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">
                        {activeTab === 'exams' ? 'CA Total' : `Score / ${caStatus.elements.find(e => e.name === selectedElement)?.totalMarks || '--'}`}
                      </th>
                    )}
                    {includes.marks && isCaOverviewMode && (
                      caStatus.elements.map((el, idx) => (
                        <th key={idx} className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">
                          {el.name} / {el.totalMarks}
                        </th>
                      ))
                    )}
                    {includes.marks && isCaOverviewMode && (
                      <th className="px-6 py-5 text-center text-[10px] font-black text-primary-teal uppercase tracking-widest bg-primary-teal/5">
                        CA Total
                      </th>
                    )}
                    {includes.marks && activeTab === 'exams' && (
                      <>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Exam Score / 100</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Total Score</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Grade</th>
                      </>
                    )}
                    {includes.comments && <th className="px-6 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Subject Comments</th>}
                    {includes.synopsis && <th className="px-6 py-5 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Synopsis</th>}
                    <th className="px-6 py-5 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-muted-text uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-teal/5 flex items-center justify-center text-primary-teal font-black text-xs uppercase">
                            {(student.firstName?.[0] || '')}{(student.lastName?.[0] || '') || student.name?.[0] || '?'}
                          </div>
                          <span className="text-sm font-black text-dark-text tracking-tight uppercase">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">{student.admissionNo}</span>
                      </td>
                      {includes.marks && !isCaOverviewMode && (
                        <td className="px-6 py-5 text-center">
                          {activeTab === 'exams' ? (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-black text-dark-text">{studentFinalScores[student.id]?.caTotal || '0.0'}</span>
                              <span className="text-[9px] font-bold text-muted-text uppercase tracking-tighter opacity-60">Scaled: {studentFinalScores[student.id]?.scaledCa || '0.0'}</span>
                            </div>
                          ) : (
                            <input 
                              type="number" 
                              disabled={activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete}
                              className={`w-20 px-3 py-2 bg-white border-2 border-gray-100 rounded-xl text-center text-sm font-black text-dark-text focus:border-primary-teal outline-none transition group-hover:border-gray-200 ${activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                              value={student.score === null ? '' : student.score}
                              onChange={(e) => handleFieldChange(student.id, 'score', e.target.value)}
                              placeholder="--"
                              max="100"
                              min="0"
                            />
                          )}
                        </td>
                      )}
                      {includes.marks && isCaOverviewMode && (
                        caStatus.elements.map((el, idx) => {
                          const mark = caMarks.find(m => m.studentId === student.id && m.elementName === el.name);
                          return (
                            <td key={idx} className="px-6 py-5 text-center">
                              <span className="text-sm font-black text-dark-text">{mark ? mark.score : '-'}</span>
                            </td>
                          );
                        })
                      )}
                      {includes.marks && isCaOverviewMode && (
                        <td className="px-6 py-5 text-center bg-primary-teal/5">
                          <span className="text-sm font-black text-primary-teal">
                            {caMarks.filter(m => m.studentId === student.id).reduce((sum, m) => sum + (parseFloat(m.score) || 0), 0).toFixed(1)}
                          </span>
                        </td>
                      )}
                      {includes.marks && activeTab === 'exams' && (
                        <>
                          <td className="px-6 py-5 text-center">
                            <input 
                              type="number" 
                              className="w-20 px-3 py-2 bg-white border-2 border-gray-100 rounded-xl text-center text-sm font-black text-dark-text focus:border-primary-teal outline-none transition group-hover:border-gray-200"
                              value={student.score === null ? '' : student.score}
                              onChange={(e) => handleFieldChange(student.id, 'score', e.target.value)}
                              placeholder="--"
                              max="100"
                              min="0"
                            />
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-black text-primary-teal">{studentFinalScores[student.id]?.grandTotal || '0.0'}</span>
                              <span className="text-[9px] font-bold text-muted-text uppercase tracking-tighter opacity-60">/ 100</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm ${
                              getGrade(studentFinalScores[student.id]?.grandTotal) === 'A' ? 'bg-emerald-50 text-emerald-500' :
                              getGrade(studentFinalScores[student.id]?.grandTotal) === 'F' ? 'bg-rose-50 text-rose-500' :
                              'bg-gray-50 text-dark-text'
                            }`}>
                              {getGrade(studentFinalScores[student.id]?.grandTotal)}
                            </div>
                          </td>
                        </>
                      )}
                      {includes.comments && (
                        <td className="px-6 py-5">
                          <textarea 
                            disabled={activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete}
                            className={`w-full min-w-[200px] px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-xs font-medium text-dark-text focus:border-primary-teal outline-none transition resize-none ${activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                            rows="2"
                            value={student.comment || ''}
                            onChange={(e) => handleFieldChange(student.id, 'comment', e.target.value)}
                            placeholder="Add comment..."
                          />
                        </td>
                      )}
                      {includes.synopsis && (
                        <td className="px-6 py-5">
                          <textarea 
                            disabled={activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete}
                            className={`w-full min-w-[200px] px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-xs font-medium text-dark-text focus:border-primary-teal outline-none transition resize-none ${activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                            rows="2"
                            value={student.synopsis || ''}
                            onChange={(e) => handleFieldChange(student.id, 'synopsis', e.target.value)}
                            placeholder="Add synopsis..."
                          />
                        </td>
                      )}
                      <td className="px-6 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-gray-400 hover:text-dark-text hover:bg-gray-100 rounded-lg transition">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={10} className="px-8 py-12 text-center">
                        <p className="text-sm font-bold text-muted-text italic">No students found for this selection.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Actions Footer */}
            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 transition shadow-soft-sm">
                  <RotateCcw size={14} className="text-primary-teal" />
                  Sync Online Campus
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleSave(false)}
                  disabled={saving || filteredStudents.length === 0 || (activeTab === 'exams' && caStatus.totalElements > 0 && !caStatus.isComplete) || isCaOverviewMode}
                  className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-dark-text rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition shadow-soft-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                {activeTab === 'ca' && (
                  <button 
                    onClick={() => handleSave(true)}
                    disabled={saving || filteredStudents.length === 0 || isCaOverviewMode}
                    className="flex items-center gap-2 px-10 py-4 bg-primary-teal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal/90 transition shadow-lg shadow-primary-teal/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                    {saving ? 'Saving...' : 'Save & Next'}
                  </button>
                )}
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

export default ExamMarks;