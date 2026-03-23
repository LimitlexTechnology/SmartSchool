import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Save, 
  Trash2, 
  ChevronDown, 
  X, 
  Type, 
  Scale, 
  ClipboardList, 
  Target, 
  FileText, 
  RotateCcw,
  ChevronRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const ExamConfiguration = () => {
  const [activeTab, setActiveTab] = useState('grading');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedScale, setSelectedScale] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [selectedExamConfig, setSelectedExamConfig] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  
  const [newSystemName, setNewSystemName] = useState('');
  const [newSystemScale, setNewSystemScale] = useState([]);
  const [newSystemClasses, setNewSystemClasses] = useState([]);
  
  const [newScaleName, setNewScaleName] = useState('');
  const [newScaleFrom, setNewScaleFrom] = useState(60);
  const [newScaleTo, setNewScaleTo] = useState(40);
  const [newScaleOverall, setNewScaleOverall] = useState(100);
  const [newScaleClasses, setNewScaleClasses] = useState([]);

  const [newAssessmentName, setNewAssessmentName] = useState('');
  const [newAssessmentItems, setNewAssessmentItems] = useState([]);
  const [newAssessmentClasses, setNewAssessmentClasses] = useState([]);

  const [newExamName, setNewExamName] = useState('');
  const [newExamGrading, setNewExamGrading] = useState('');
  const [newExamScale, setNewExamScale] = useState('');
  const [newExamAssessment, setNewExamAssessment] = useState('');
  const [newExamClasses, setNewExamClasses] = useState([]);
  const [newExamTerms, setNewExamTerms] = useState(['Term 1', 'Term 2', 'Term 3']);
  
  const [classes, setClasses] = useState([]);
  const [allSystems, setAllSystems] = useState([]);
  const [allScales, setAllScales] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [allExamConfigs, setAllExamConfigs] = useState([]);
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentAcademicPeriod, setCurrentAcademicPeriod] = useState({
    year: localStorage.getItem('academicYearLabel') || '2025/2026',
    term: localStorage.getItem('academicTermLabel') || 'First Term'
  });

  // Listen for academic period changes
  useEffect(() => {
    const handlePeriodChange = (e) => {
      setCurrentAcademicPeriod(e.detail);
    };
    window.addEventListener('academicPeriod:change', handlePeriodChange);
    return () => window.removeEventListener('academicPeriod:change', handlePeriodChange);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classesRes, settingsRes] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/exam-settings')
        ]);
        
        const classesData = await classesRes.json();
        setClasses(classesData);
        
        const settingsData = await settingsRes.json();
        const systems = settingsData.systems || [];
        const scales = settingsData.scales || [];
        const assessments = settingsData.assessments || [];
        const examConfigs = settingsData.examConfigs || [];
        
        setAllSystems(systems);
        setAllScales(scales);
        setAllAssessments(assessments);
        setAllExamConfigs(examConfigs);
        setRules(settingsData.rules || {});
        
        if (systems.length > 0) setSelectedSystem(systems[0].name);
        if (scales.length > 0) {
          const activeScales = scales.filter(s => s.status !== 'archived');
          if (activeScales.length > 0) setSelectedScale(activeScales[0].name);
        }
        if (assessments.length > 0) {
          const activeAssessments = assessments.filter(a => a.status !== 'archived');
          if (activeAssessments.length > 0) setSelectedAssessment(activeAssessments[0].name);
        }
        if (examConfigs.length > 0) {
          const activeExams = examConfigs.filter(e => e.status !== 'archived');
          if (activeExams.length > 0) setSelectedExamConfig(activeExams[0].name);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Current selections
  const currentSystem = allSystems.find(s => s.name === selectedSystem) || {
    name: '', grades: [], assignedClasses: []
  };
  const currentScale = allScales.find(s => s.name === selectedScale) || {
    name: '', overallScore: 100, from: 60, to: 40, assignedClasses: [], status: 'active'
  };
  const currentAssessment = allAssessments.find(a => a.name === selectedAssessment) || {
    name: '', items: [], assignedClasses: [], status: 'active'
  };
  const currentExamConfig = allExamConfigs.find(e => e.name === selectedExamConfig) || {
    name: '', gradingSystem: '', scale: '', assessmentType: '', classes: [], terms: [], status: 'active'
  };

  // Helper: Persist to backend
  const handleSaveAll = async (
    updatedSystems = allSystems, 
    updatedScales = allScales, 
    updatedAssessments = allAssessments,
    updatedExamConfigs = allExamConfigs
  ) => {
    try {
      setLoading(true);
      await fetch('/api/exam-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          systems: updatedSystems, 
          scales: updatedScales, 
          assessments: updatedAssessments, 
          examConfigs: updatedExamConfigs,
          rules 
        })
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Grading System Handlers
  const handleAddRow = () => {
    const newId = newSystemScale.length > 0 ? Math.max(...newSystemScale.map(r => r.id)) + 1 : 1;
    setNewSystemScale([...newSystemScale, { id: newId, lower: '', upper: '', grade: '', remarks: '', descriptor: '' }]);
  };

  const handleDeleteRow = (id) => {
    setNewSystemScale(newSystemScale.filter(r => r.id !== id));
  };

  const handleModalInputChange = (id, field, value) => {
    setNewSystemScale(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSaveSystem = async () => {
    if (!newSystemName) return;
    const newSystem = {
      id: crypto.randomUUID(),
      name: newSystemName.toUpperCase(),
      grades: newSystemScale.length > 0 ? newSystemScale : [
        { id: 1, lower: 90, upper: 100, grade: '1', remarks: 'HIGHEST', descriptor: 'EXCELLENT PERFORMANCE' },
        { id: 2, lower: 80, upper: 89, grade: '2', remarks: 'HIGHER', descriptor: 'VERY GOOD' },
        { id: 3, lower: 70, upper: 79, grade: '3', remarks: 'HIGH', descriptor: 'GOOD' },
        { id: 4, lower: 60, upper: 69, grade: '4', remarks: 'HIGH AVERAGE', descriptor: 'ABOVE AVERAGE' },
        { id: 5, lower: 55, upper: 59, grade: '5', remarks: 'AVERAGE', descriptor: 'SATISFACTORY' },
        { id: 6, lower: 52, upper: 54, grade: '6', remarks: 'LOW AVERAGE', descriptor: 'FAIR' },
        { id: 7, lower: 49, upper: 51, grade: '7', remarks: 'LOW', descriptor: 'BELOW' },
        { id: 8, lower: 30, upper: 48, grade: '8', remarks: 'LOWER', descriptor: 'POOR' },
        { id: 9, lower: 0, upper: 29, grade: '9', remarks: 'LOWEST', descriptor: 'NEEDS IMPROVEMENT' },
      ],
      assignedClasses: newSystemClasses
    };
    const updated = [...allSystems.filter(s => s.name !== newSystem.name), newSystem];
    setAllSystems(updated);
    setSelectedSystem(newSystem.name);
    await handleSaveAll(updated, allScales, allAssessments, allExamConfigs);
    setShowModal(false);
    setModalStep(1);
    setNewSystemName('');
    setNewSystemScale([]);
    setNewSystemClasses([]);
  };

  const handleEditSystem = () => {
    if (!currentSystem.name) return;
    setNewSystemName(currentSystem.name);
    setNewSystemScale(currentSystem.grades || []);
    setNewSystemClasses(currentSystem.assignedClasses || []);
    setShowModal(true);
    setModalStep(1);
  };

  // Exam Scale Handlers
  const handleSaveScale = async () => {
    if (!newScaleName) return;
    const newScale = {
      id: crypto.randomUUID(),
      name: newScaleName.toUpperCase(),
      overallScore: newScaleOverall,
      from: newScaleFrom,
      to: newScaleTo,
      assignedClasses: newScaleClasses,
      status: 'active'
    };
    const updated = [...allScales.filter(s => s.name !== newScale.name), newScale];
    setAllScales(updated);
    setSelectedScale(newScale.name);
    await handleSaveAll(allSystems, updated, allAssessments, allExamConfigs);
    setShowScaleModal(false);
    setNewScaleName('');
    setNewScaleFrom(60);
    setNewScaleTo(40);
    setNewScaleOverall(100);
    setNewScaleClasses([]);
  };

  const handleEditScale = () => {
    if (!currentScale.name) return;
    setNewScaleName(currentScale.name);
    setNewScaleOverall(currentScale.overallScore);
    setNewScaleFrom(currentScale.from);
    setNewScaleTo(currentScale.to);
    setNewScaleClasses(currentScale.assignedClasses || []);
    setShowScaleModal(true);
  };

  const handleArchiveScale = async () => {
    if (!currentScale.name) return;
    const updated = allScales.map(s => 
      s.name === selectedScale ? { ...s, status: 'archived' } : s
    );
    setAllScales(updated);
    await handleSaveAll(allSystems, updated, allAssessments, allExamConfigs);
    const active = updated.filter(s => s.status !== 'archived');
    if (active.length > 0) setSelectedScale(active[0].name);
    else setSelectedScale('');
  };

  // Assessment Handlers
  const handleAddAssessmentItem = () => {
    const newId = newAssessmentItems.length > 0 ? Math.max(...newAssessmentItems.map(i => i.id)) + 1 : 1;
    setNewAssessmentItems([...newAssessmentItems, { id: newId, name: '', total: '' }]);
  };

  const handleDeleteAssessmentItem = (id) => {
    setNewAssessmentItems(newAssessmentItems.filter(i => i.id !== id));
  };

  const handleAssessmentItemChange = (id, field, value) => {
    setNewAssessmentItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveAssessment = async () => {
    if (!newAssessmentName) return;
    const newAssessment = {
      id: crypto.randomUUID(),
      name: newAssessmentName,
      items: newAssessmentItems.length > 0 ? newAssessmentItems : [
        { id: 1, name: 'MID TERM', total: 20 },
        { id: 2, name: 'CLASS TEST', total: 10 },
        { id: 3, name: 'GROUP WORK', total: 10 },
        { id: 4, name: 'PROJECT WORK', total: 10 },
        { id: 5, name: 'CLASS WORK', total: 5 },
        { id: 6, name: 'HOMEWORK', total: 5 }
      ],
      assignedClasses: newAssessmentClasses,
      status: 'active'
    };
    const updated = [...allAssessments.filter(a => a.name !== newAssessment.name), newAssessment];
    setAllAssessments(updated);
    setSelectedAssessment(newAssessment.name);
    await handleSaveAll(allSystems, allScales, updated, allExamConfigs);
    setShowAssessmentModal(false);
    setNewAssessmentName('');
    setNewAssessmentItems([]);
    setNewAssessmentClasses([]);
  };

  const handleEditAssessment = () => {
    if (!currentAssessment.name) return;
    setNewAssessmentName(currentAssessment.name);
    setNewAssessmentItems(currentAssessment.items || []);
    setNewAssessmentClasses(currentAssessment.assignedClasses || []);
    setShowAssessmentModal(true);
  };

  const handleArchiveAssessment = async () => {
    if (!currentAssessment.name) return;
    const updated = allAssessments.map(a => 
      a.name === selectedAssessment ? { ...a, status: 'archived' } : a
    );
    setAllAssessments(updated);
    await handleSaveAll(allSystems, allScales, updated, allExamConfigs);
    const active = updated.filter(a => a.status !== 'archived');
    if (active.length > 0) setSelectedAssessment(active[0].name);
    else setSelectedAssessment('');
  };

  // Exam Config Handlers
  const handleSaveExamConfig = async () => {
    if (!newExamName) return;
    const newConfig = {
      id: crypto.randomUUID(),
      name: newExamName,
      gradingSystem: newExamGrading,
      scale: newExamScale,
      assessmentType: newExamAssessment,
      classes: newExamClasses,
      terms: [currentAcademicPeriod.term],
      session: currentAcademicPeriod.year,
      status: 'active'
    };
    const updated = [...allExamConfigs.filter(e => e.name !== newConfig.name), newConfig];
    setAllExamConfigs(updated);
    setSelectedExamConfig(newConfig.name);
    await handleSaveAll(allSystems, allScales, allAssessments, updated);
    setShowExamModal(false);
    setNewExamName('');
    setNewExamGrading('');
    setNewExamScale('');
    setNewExamAssessment('');
    setNewExamClasses([]);
  };

  const handleEditExamConfig = () => {
    if (!currentExamConfig.name) return;
    setNewExamName(currentExamConfig.name);
    setNewExamGrading(currentExamConfig.gradingSystem);
    setNewExamScale(currentExamConfig.scale);
    setNewExamAssessment(currentExamConfig.assessmentType);
    setNewExamClasses(currentExamConfig.classes || []);
    setShowExamModal(true);
  };

  const handleArchiveExamConfig = async () => {
    if (!currentExamConfig.name) return;
    const updated = allExamConfigs.map(e => 
      e.name === selectedExamConfig ? { ...e, status: 'archived' } : e
    );
    setAllExamConfigs(updated);
    await handleSaveAll(allSystems, allScales, allAssessments, updated);
    const active = updated.filter(e => e.status !== 'archived');
    if (active.length > 0) setSelectedExamConfig(active[0].name);
    else setSelectedExamConfig('');
  };

  const navTabs = [
    { id: 'grading', label: 'Grading System', sub: 'Exam grading systems', icon: Type },
    { id: 'scale', label: 'Exam Scale', sub: 'Exam scaling criteria', icon: Scale },
    { id: 'assessments', label: 'Assessment Types', sub: 'Manage assessment types', icon: ClipboardList },
    { id: 'objectives', label: 'Qualitative Objectives', sub: 'Qualitative grading objectives', icon: Target },
    { id: 'exams', label: 'Exams', sub: 'Manage exam types', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Modal: Grading System */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl my-auto overflow-hidden relative min-h-[500px] flex flex-col pointer-events-auto p-12">
            <button onClick={() => { setShowModal(false); setModalStep(1); }} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-dark-text z-[10000]">
              <X size={24} />
            </button>
            {modalStep === 1 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-black text-dark-text uppercase tracking-tight mb-2">Grading System Name</h3>
                <p className="text-[11px] font-bold text-muted-text uppercase tracking-widest mb-8">A reference given to this grading system. eg. "Mid-Term Grading System"</p>
                <input type="text" value={newSystemName} onChange={(e) => setNewSystemName(e.target.value)} placeholder="Enter name..." className="w-full max-w-md px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition text-center mb-8" />
                <button onClick={() => setModalStep(2)} disabled={!newSystemName.trim()} className="px-12 py-4 bg-primary-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/10 disabled:opacity-50 disabled:cursor-not-allowed">Continue <ChevronRight size={14} className="inline ml-1" /></button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-black text-dark-text uppercase tracking-tight mb-12 text-center">Add Quantitative Grading System (optional)</h3>
                <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="w-12 p-4"><button onClick={handleAddRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-300 transition"><Plus size={12} /> Add</button></th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Lower limit</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Upper limit</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Grade</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Remarks</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Descriptor</th>
                        <th className="w-12 p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {newSystemScale.length === 0 ? (
                        <tr><td colSpan="7" className="px-6 py-12 text-center text-xs font-bold text-muted-text italic">No rows added. Click "+ Add" to begin.</td></tr>
                      ) : (
                        newSystemScale.map((row) => (
                          <tr key={row.id} className="group">
                            <td className="p-4"></td>
                            <td className="px-4 py-2"><input type="number" className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary-teal transition" value={row.lower} onChange={(e) => handleModalInputChange(row.id, 'lower', e.target.value)} /></td>
                            <td className="px-4 py-2"><input type="number" className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary-teal transition" value={row.upper} onChange={(e) => handleModalInputChange(row.id, 'upper', e.target.value)} /></td>
                            <td className="px-4 py-2"><input type="text" className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary-teal transition" value={row.grade} onChange={(e) => handleModalInputChange(row.id, 'grade', e.target.value)} /></td>
                            <td className="px-4 py-2"><input type="text" className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary-teal transition uppercase" value={row.remarks} onChange={(e) => handleModalInputChange(row.id, 'remarks', e.target.value)} /></td>
                            <td className="px-4 py-2"><input type="text" className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary-teal transition uppercase" value={row.descriptor} onChange={(e) => handleModalInputChange(row.id, 'descriptor', e.target.value)} /></td>
                            <td className="p-4"><button onClick={() => handleDeleteRow(row.id)} className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"><Trash2 size={16} /></button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="border-t border-gray-100 p-6 bg-gray-50/30">
                    <h4 className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-4">Classes</h4>
                    <div className="relative">
                      <select onChange={(e) => { const val = e.target.value; if (val && !newSystemClasses.includes(val)) setNewSystemClasses([...newSystemClasses, val]); }} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-6 py-3 text-xs font-bold text-muted-text outline-none focus:border-primary-teal transition cursor-pointer pr-12">
                        <option value="">Select Classes...</option>
                        {classes.filter(cls => !newSystemClasses.includes(String(cls.id))).map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name?.trim() || (cls.grade ? `Grade ${cls.grade}` : `Class ${String(cls.id).slice(0, 8)}`)}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {newSystemClasses.map(classId => {
                        const c = classes.find(cl => String(cl.id) === String(classId));
                        return (
                          <span key={classId} className="px-3 py-1 bg-primary-teal/10 text-primary-teal rounded-full text-[9px] font-black uppercase flex items-center gap-2">
                            {c?.name?.trim() || (c?.grade ? `Grade ${c.grade}` : `ID: ${String(classId).slice(0, 8)}`)}
                            <X size={10} className="cursor-pointer" onClick={() => setNewSystemClasses(newSystemClasses.filter(id => id !== classId))} />
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <button onClick={handleAddRow} className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-300 transition shadow-soft-sm"><Plus size={14} /> Add</button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setModalStep(1)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 transition"><ArrowLeft size={14} /> Back</button>
                    <button onClick={handleSaveSystem} className="flex items-center gap-2 px-8 py-2.5 bg-primary-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20"><Save size={14} /> Save</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Exam Scale */}
      {showScaleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl my-auto overflow-hidden relative p-12 flex flex-col pointer-events-auto">
            <button onClick={() => setShowScaleModal(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-dark-text"><X size={24} /></button>
            <h3 className="text-xl font-black text-dark-text uppercase tracking-tight mb-2 text-center">Exam Scale Configuration</h3>
            <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-10 text-center">Define how scores are scaled for this set</p>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest mb-2 ml-1">Scale Name</label>
                <input type="text" value={newScaleName} onChange={(e) => setNewScaleName(e.target.value)} placeholder="e.g. PRIMARY END OF TERM EXAMS SCALE" className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest mb-2 ml-1">Overall Score</label>
                  <input type="number" value={newScaleOverall} onChange={(e) => setNewScaleOverall(parseInt(e.target.value))} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition text-center" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest mb-2 ml-1">Scale From</label>
                  <input type="number" value={newScaleFrom} onChange={(e) => setNewScaleFrom(parseInt(e.target.value))} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition text-center" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest mb-2 ml-1">Scale To</label>
                  <input type="number" value={newScaleTo} onChange={(e) => setNewScaleTo(parseInt(e.target.value))} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition text-center" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest mb-2 ml-1">Assign Classes</label>
                <div className="relative">
                  <select onChange={(e) => { const val = e.target.value; if (val && !newScaleClasses.includes(val)) setNewScaleClasses([...newScaleClasses, val]); }} className="w-full appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-xs font-black text-muted-text outline-none focus:bg-white focus:border-primary-teal transition cursor-pointer pr-12">
                    <option value="">Select Classes...</option>
                    {classes.filter(cls => !newScaleClasses.includes(String(cls.id))).map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name?.trim() || (cls.grade ? `Grade ${cls.grade}` : `Class ${String(cls.id).slice(0, 8)}`)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {newScaleClasses.map(classId => {
                    const c = classes.find(cl => String(cl.id) === String(classId));
                    return (
                      <span key={classId} className="px-3 py-1 bg-primary-teal/10 text-primary-teal rounded-full text-[9px] font-black uppercase flex items-center gap-2">
                        {c?.name?.trim() || (c?.grade ? `Grade ${c.grade}` : `ID: ${String(classId).slice(0, 8)}`)}
                        <X size={10} className="cursor-pointer" onClick={() => setNewScaleClasses(newScaleClasses.filter(id => id !== classId))} />
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-12 flex justify-center">
              <button onClick={handleSaveScale} disabled={!newScaleName.trim()} className="px-12 py-4 bg-primary-teal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50"><Save size={14} className="inline mr-2" /> Save Scale Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assessment Type */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl my-auto overflow-hidden relative p-12 flex flex-col pointer-events-auto">
            <button onClick={() => setShowAssessmentModal(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-dark-text"><X size={24} /></button>
            <h3 className="text-xl font-black text-dark-text uppercase tracking-tight mb-2 text-center">Continuous Assessment</h3>
            
            <div className="mt-8 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest mb-2 ml-1">Reference</label>
                <input type="text" value={newAssessmentName} onChange={(e) => setNewAssessmentName(e.target.value)} placeholder="e.g. First Term CA Plan" className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-dark-text focus:bg-white focus:border-primary-teal outline-none transition" />
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Assessment name</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Total mark</th>
                      <th className="w-12 p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {newAssessmentItems.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">
                          <input type="text" value={item.name} onChange={(e) => handleAssessmentItemChange(item.id, 'name', e.target.value)} placeholder="e.g. Mid Term" className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary-teal transition uppercase" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" value={item.total} onChange={(e) => handleAssessmentItemChange(item.id, 'total', e.target.value)} placeholder="20" className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary-teal transition" />
                        </td>
                        <td className="p-4">
                          <button onClick={() => handleDeleteAssessmentItem(item.id)} className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={handleAddAssessmentItem} className="w-full py-4 bg-gray-50 text-[10px] font-black text-muted-text uppercase tracking-widest hover:bg-gray-100 transition flex items-center justify-center gap-2 border-t border-gray-100">
                  <Plus size={14} /> Add Assessment Item
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-text uppercase tracking-widest mb-2 ml-1">Classes</label>
                <div className="relative">
                  <select onChange={(e) => { const val = e.target.value; if (val && !newAssessmentClasses.includes(val)) setNewAssessmentClasses([...newAssessmentClasses, val]); }} className="w-full appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-xs font-black text-muted-text outline-none focus:bg-white focus:border-primary-teal transition cursor-pointer pr-12">
                    <option value="">Select Classes...</option>
                    {classes.filter(cls => !newAssessmentClasses.includes(String(cls.id))).map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name?.trim() || (cls.grade ? `Grade ${cls.grade}` : `Class ${String(cls.id).slice(0, 8)}`)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {newAssessmentClasses.map(classId => {
                    const c = classes.find(cl => String(cl.id) === String(classId));
                    return (
                      <span key={classId} className="px-3 py-1 bg-primary-teal/10 text-primary-teal rounded-full text-[9px] font-black uppercase flex items-center gap-2">
                        {c?.name?.trim() || (c?.grade ? `Grade ${c.grade}` : `ID: ${String(classId).slice(0, 8)}`)}
                        <X size={10} className="cursor-pointer" onClick={() => setNewAssessmentClasses(newAssessmentClasses.filter(id => id !== classId))} />
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <button onClick={handleSaveAssessment} disabled={!newAssessmentName.trim()} className="px-12 py-4 bg-primary-teal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50"><Save size={14} className="inline mr-2" /> Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Exam */}
      {showExamModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl my-auto overflow-hidden relative p-12 flex flex-col pointer-events-auto items-center">
            <button onClick={() => setShowExamModal(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-dark-text"><X size={24} /></button>
            
            <h3 className="text-xl font-black text-dark-text uppercase tracking-tight mb-2">Create Exam</h3>
            <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-10">Create a new exam for your school</p>

            <div className="w-full space-y-4">
              <div className="relative">
                <input 
                  type="text"
                  list="exam-names"
                  value={newExamName} 
                  onChange={(e) => setNewExamName(e.target.value)} 
                  placeholder="Enter or Select Exam Name"
                  className="w-full bg-white border border-gray-100 rounded-xl px-6 py-4 text-xs font-bold text-dark-text outline-none focus:border-primary-teal transition"
                />
                <datalist id="exam-names">
                  <option value="End of Year Science Exam" />
                  <option value="Mid Term Math Exam" />
                  <option value="Mock Exam" />
                  {allExamConfigs.map(config => (
                    <option key={config.id} value={config.name} />
                  ))}
                </datalist>
              </div>

              <div className="relative">
                <select value={newExamGrading} onChange={(e) => setNewExamGrading(e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-6 py-4 text-xs font-bold text-muted-text outline-none focus:border-primary-teal transition cursor-pointer pr-12">
                  <option value="">Grading System</option>
                  {allSystems.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={newExamScale} onChange={(e) => setNewExamScale(e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-6 py-4 text-xs font-bold text-muted-text outline-none focus:border-primary-teal transition cursor-pointer pr-12">
                  <option value="">Scale to use</option>
                  {allScales.filter(s => s.status !== 'archived').map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={newExamAssessment} onChange={(e) => setNewExamAssessment(e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-6 py-4 text-xs font-bold text-muted-text outline-none focus:border-primary-teal transition cursor-pointer pr-12">
                  <option value="">Assessment type (optional)</option>
                  {allAssessments.filter(a => a.status !== 'archived').map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>

              <div className="relative">
                <select onChange={(e) => { const val = e.target.value; if (val && !newExamClasses.includes(val)) setNewExamClasses([...newExamClasses, val]); }} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-6 py-4 text-xs font-bold text-muted-text outline-none focus:border-primary-teal transition cursor-pointer pr-12">
                  <option value="">Classes Involved</option>
                  {classes.filter(cls => !newExamClasses.includes(String(cls.id))).map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name?.trim() || (cls.grade ? `Grade ${cls.grade}` : `Class ${String(cls.id).slice(0, 8)}`)}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {newExamClasses.map(classId => {
                  const c = classes.find(cl => String(cl.id) === String(classId));
                  return (
                    <span key={classId} className="px-3 py-1.5 bg-primary-teal/5 text-primary-teal rounded-full text-[9px] font-black uppercase flex items-center gap-2 border border-primary-teal/10">
                      {c?.name?.trim() || (c?.grade ? `Grade ${c.grade}` : `ID: ${String(classId).slice(0, 8)}`)}
                      <X size={10} className="cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setNewExamClasses(newExamClasses.filter(id => id !== classId))} />
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 flex gap-4 w-full">
              <button onClick={() => setShowExamModal(false)} className="flex-1 py-4 bg-gray-200 text-dark-text rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-300 transition">Cancel</button>
              <button onClick={handleSaveExamConfig} disabled={!newExamName} className="flex-1 py-4 bg-primary-teal/40 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal transition">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Main UI Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Grading System</h1>
            <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest italic opacity-70">Exam grading systems</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-soft-sm text-[10px] font-black uppercase tracking-widest text-muted-text">
              <span>{currentAcademicPeriod.year}</span>
              <div className="w-px h-3 bg-gray-200" />
              <span>{currentAcademicPeriod.term}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all text-left group ${isActive ? 'bg-white border-primary-teal shadow-soft-xl' : 'bg-white border-transparent hover:border-gray-100 shadow-soft-sm'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}><Icon size={24} /></div>
                <div className="space-y-0.5 overflow-hidden">
                  <h3 className={`text-xs font-black uppercase tracking-tight truncate ${isActive ? 'text-dark-text' : 'text-muted-text'}`}>{tab.label}</h3>
                  <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60 truncate">{tab.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => {
          if (activeTab === 'grading') { setNewSystemName(''); setNewSystemScale([]); setNewSystemClasses([]); setShowModal(true); setModalStep(1); }
          else if (activeTab === 'scale') { setNewScaleName(''); setNewScaleFrom(60); setNewScaleTo(40); setNewScaleOverall(100); setNewScaleClasses([]); setShowScaleModal(true); }
          else if (activeTab === 'assessments') { setNewAssessmentName(''); setNewAssessmentItems([]); setNewAssessmentClasses([]); setShowAssessmentModal(true); }
          else if (activeTab === 'exams') { setNewExamName(''); setNewExamGrading(''); setNewExamScale(''); setNewExamAssessment(''); setNewExamClasses([]); setShowExamModal(true); }
        }} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:text-primary-teal transition shadow-soft-sm"><Plus size={14} className="text-primary-teal" /> {activeTab === 'grading' ? 'Create Grading System' : activeTab === 'scale' ? 'Create Exam Scale' : activeTab === 'assessments' ? 'Create Assessment Type' : 'Create Exam'}</button>
        <button onClick={activeTab === 'grading' ? handleEditSystem : activeTab === 'scale' ? handleEditScale : activeTab === 'assessments' ? handleEditAssessment : handleEditExamConfig} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:text-primary-teal transition shadow-soft-sm"><Edit3 size={14} className="text-primary-teal" /> Edit</button>
      </div>

      {/* Main Configuration Card */}
      {activeTab === 'grading' ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl overflow-hidden p-10">
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <select value={selectedSystem} onChange={(e) => setSelectedSystem(e.target.value)} className="w-full appearance-none bg-gray-50/50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-dark-text outline-none focus:bg-white focus:border-primary-teal transition cursor-pointer pr-12">
                {allSystems.length > 0 ? allSystems.map(s => <option key={s.name} value={s.name}>{s.name}</option>) : <option value="">No Grading Systems Found</option>}
              </select>
              <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-12 border-b border-gray-50 mb-10 ml-4">
            <button className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary-teal border-b-4 border-primary-teal transition-all">Quantitative</button>
            <button className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text hover:text-dark-text transition-all">Qualitative</button>
          </div>
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest">Lower limit</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest">Upper limit</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest">Grade</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest">Remarks</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest">Descriptor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(currentSystem.grades || []).map((row) => (
                  <tr key={row.id} className="group hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 py-2 w-32"><div className="w-full bg-white border-2 border-gray-50 rounded-xl px-4 py-3 text-xs font-bold text-muted-text text-center">{row.lower}</div></td>
                    <td className="px-4 py-2 w-32"><div className="w-full bg-white border-2 border-gray-50 rounded-xl px-4 py-3 text-xs font-bold text-muted-text text-center">{row.upper}</div></td>
                    <td className="px-4 py-2 w-32"><div className="w-full bg-white border-2 border-gray-50 rounded-xl px-4 py-3 text-xs font-bold text-muted-text text-center">{row.grade}</div></td>
                    <td className="px-4 py-2 flex-1"><div className="w-full bg-white border-2 border-gray-50 rounded-xl px-6 py-3 text-xs font-bold text-muted-text uppercase tracking-widest">{row.remarks}</div></td>
                    <td className="px-4 py-2 flex-1"><div className="w-full bg-white border-2 border-gray-50 rounded-xl px-6 py-3 text-xs font-bold text-muted-text uppercase tracking-widest">{row.descriptor}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <h3 className="text-[10px] font-black text-dark-text uppercase tracking-widest mb-4 ml-2">Classes</h3>
            <div className="flex flex-wrap gap-2 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50 min-h-[80px] items-center">
              {(currentSystem.assignedClasses || []).map(classId => {
                const c = classes.find(cl => String(cl.id) === String(classId));
                return (
                  <span key={classId} className="flex items-center gap-2 px-4 py-2 bg-white border border-primary-teal/20 text-primary-teal rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal hover:text-white transition group cursor-pointer shadow-soft-sm">
                    {c?.name?.trim() || (c?.grade ? `Grade ${c.grade}` : `Class ${String(classId).slice(0, 8)}`)}
                    <X size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); const updated = currentSystem.assignedClasses.filter(id => id !== classId); setAllSystems(allSystems.map(s => s.name === selectedSystem ? { ...s, assignedClasses: updated } : s)); }} />
                  </span>
                );
              })}
              <div className="relative">
                <select onChange={(e) => { const val = e.target.value; if (val && !currentSystem.assignedClasses.includes(val)) { const updated = [...currentSystem.assignedClasses, val]; setAllSystems(allSystems.map(s => s.name === selectedSystem ? { ...s, assignedClasses: updated } : s)); } }} className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-primary-teal/50 hover:text-primary-teal transition ml-2 appearance-none bg-transparent cursor-pointer outline-none" value=""><option value="" disabled>+</option>{classes.filter(cls => !currentSystem.assignedClasses.includes(String(cls.id))).map(cls => <option key={cls.id} value={cls.id}>{cls.name?.trim() || (cls.grade ? `Grade ${cls.grade}` : `Class ${String(cls.id).slice(0, 8)}`)}</option>)}</select>
                <Plus size={16} className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none text-gray-300" />
              </div>
            </div>
          </div>
          <div className="mt-12 flex justify-end gap-3">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-gray-50 transition shadow-soft-sm"><RotateCcw size={16} /> Discard Changes</button>
            <button onClick={() => handleSaveAll()} disabled={loading} className="flex items-center gap-2 px-10 py-4 bg-primary-teal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Configuration</button>
          </div>
        </div>
      ) : activeTab === 'scale' ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl overflow-hidden p-10 flex flex-col items-center">
          <div className="max-w-md w-full mb-10">
            <div className="relative">
              <select value={selectedScale} onChange={(e) => setSelectedScale(e.target.value)} className="w-full appearance-none bg-gray-50/50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-dark-text outline-none focus:bg-white focus:border-primary-teal transition cursor-pointer pr-12">
                {allScales.filter(s => s.status !== 'archived').length > 0 ? allScales.filter(s => s.status !== 'archived').map(s => <option key={s.name} value={s.name}>{s.name}</option>) : <option value="">No Active Exam Scales Found</option>}
              </select>
              <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            </div>
          </div>
          <div className="w-full max-w-2xl border border-gray-100 rounded-[2rem] p-10 space-y-8 mb-10">
            <div className="flex items-center justify-between"><span className="text-[11px] font-black text-dark-text uppercase tracking-widest">Overall Score</span><div className="w-32 px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-muted-text text-center">{currentScale.overallScore}</div></div>
            <div className="flex items-center justify-between"><span className="text-[11px] font-black text-dark-text uppercase tracking-widest">Exam Scale</span><div className="flex items-center gap-6"><div className="flex items-center gap-3"><span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">From</span><div className="w-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-dark-text text-center">{currentScale.from}</div></div><div className="flex items-center gap-3"><span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">To</span><div className="w-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-dark-text text-center">{currentScale.to}</div></div></div></div>
            <div className="pt-8 border-t border-gray-50">
              <h3 className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-4">Classes</h3>
              <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
                {(currentScale.assignedClasses || []).map(classId => {
                  const c = classes.find(cl => String(cl.id) === String(classId));
                  return (
                    <span key={classId} className="flex items-center gap-2 px-3 py-1.5 bg-primary-teal/5 text-primary-teal rounded-full text-[9px] font-black uppercase hover:bg-primary-teal/10 transition group cursor-pointer">
                      {c?.name?.trim() || (c?.grade ? `Grade ${c.grade}` : `Class ${String(classId).slice(0, 8)}`)}
                      <X size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); const updated = currentScale.assignedClasses.filter(id => id !== classId); setAllScales(allScales.map(s => s.name === selectedScale ? { ...s, assignedClasses: updated } : s)); }} />
                    </span>
                  );
                })}
                <div className="relative">
                  <select onChange={(e) => { const val = e.target.value; if (val && !currentScale.assignedClasses.includes(val)) { const updated = [...currentScale.assignedClasses, val]; setAllScales(allScales.map(s => s.name === selectedScale ? { ...s, assignedClasses: updated } : s)); } }} className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-primary-teal/50 hover:text-primary-teal transition ml-2 appearance-none bg-transparent cursor-pointer outline-none" value=""><option value="" disabled>+</option>{classes.filter(cls => !currentScale.assignedClasses.includes(String(cls.id))).map(cls => <option key={cls.id} value={cls.id}>{cls.name?.trim() || (cls.grade ? `Grade ${cls.grade}` : `Class ${String(cls.id).slice(0, 8)}`)}</option>)}</select>
                  <Plus size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-300" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-end"><button onClick={handleArchiveScale} className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition shadow-lg shadow-rose-500/20"><Trash2 size={14} /> Archive set</button></div>
        </div>
      ) : activeTab === 'assessments' ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl overflow-hidden p-10 flex flex-col items-center">
          <div className="max-w-md w-full mb-10">
            <div className="relative">
              <select value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)} className="w-full appearance-none bg-gray-50/50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-dark-text outline-none focus:bg-white focus:border-primary-teal transition cursor-pointer pr-12">
                {allAssessments.filter(a => a.status !== 'archived').length > 0 ? allAssessments.filter(a => a.status !== 'archived').map(a => <option key={a.name} value={a.name}>{a.name}</option>) : <option value="">No Active Assessment Types Found</option>}
              </select>
              <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            </div>
          </div>
          <div className="w-full max-w-2xl border border-gray-100 rounded-[2rem] overflow-hidden mb-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest">Assessment name</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Total mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(currentAssessment.items || []).map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-xs font-black text-dark-text uppercase tracking-widest">{item.name}</td>
                    <td className="px-6 py-4 text-center text-xs font-black text-muted-text">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-8 border-t border-gray-50">
              <h3 className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-4">Classes</h3>
              <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
                {(currentAssessment.assignedClasses || []).map(classId => {
                  const c = classes.find(cl => String(cl.id) === String(classId));
                  return (
                    <span key={classId} className="flex items-center gap-2 px-3 py-1.5 bg-primary-teal/5 text-primary-teal rounded-full text-[9px] font-black uppercase hover:bg-primary-teal/10 transition group cursor-pointer">
                      {c?.name?.trim() || (c?.grade ? `Grade ${c.grade}` : `Class ${String(classId).slice(0, 8)}`)}
                      <X size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); const updated = currentAssessment.assignedClasses.filter(id => id !== classId); setAllAssessments(allAssessments.map(a => a.name === selectedAssessment ? { ...a, assignedClasses: updated } : a)); }} />
                    </span>
                  );
                })}
                <div className="relative">
                  <select onChange={(e) => { const val = e.target.value; if (val && !currentAssessment.assignedClasses.includes(val)) { const updated = [...currentAssessment.assignedClasses, val]; setAllAssessments(allAssessments.map(a => a.name === selectedAssessment ? { ...a, assignedClasses: updated } : a)); } }} className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-primary-teal/50 hover:text-primary-teal transition ml-2 appearance-none bg-transparent cursor-pointer outline-none" value=""><option value="" disabled>+</option>{classes.filter(cls => !currentAssessment.assignedClasses.includes(String(cls.id))).map(cls => <option key={cls.id} value={cls.id}>{cls.name?.trim() || (cls.grade ? `Grade ${cls.grade}` : `Class ${String(cls.id).slice(0, 8)}`)}</option>)}</select>
                  <Plus size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-300" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-end"><button onClick={handleArchiveAssessment} className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition shadow-lg shadow-rose-500/20"><Trash2 size={14} /> Archive set</button></div>
        </div>
      ) : activeTab === 'exams' ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl overflow-hidden p-10 flex flex-col items-center">
          <div className="max-w-md w-full mb-10">
            <div className="relative">
              <select value={selectedExamConfig} onChange={(e) => setSelectedExamConfig(e.target.value)} className="w-full appearance-none bg-gray-50/50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-dark-text outline-none focus:bg-white focus:border-primary-teal transition cursor-pointer pr-12">
                {allExamConfigs.filter(e => e.status !== 'archived').length > 0 ? allExamConfigs.filter(e => e.status !== 'archived').map(e => <option key={e.name} value={e.name}>{e.name}</option>) : <option value="">No Active Exams Found</option>}
              </select>
              <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            </div>
          </div>
          <div className="w-full max-w-2xl border border-gray-100 rounded-[2rem] p-10 space-y-8 mb-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-muted-text uppercase tracking-widest">Grading System</span>
                <span className="text-xs font-black text-dark-text uppercase">{currentExamConfig.gradingSystem || 'None'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-muted-text uppercase tracking-widest">Exam Scale</span>
                <span className="text-xs font-black text-dark-text uppercase">{currentExamConfig.scale || 'None'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-muted-text uppercase tracking-widest">Assessment Type</span>
                <span className="text-xs font-black text-dark-text uppercase">{currentExamConfig.assessmentType || 'None'}</span>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
              <h3 className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-4">Terms</h3>
              <div className="flex flex-wrap gap-2">
                {(currentExamConfig.terms || []).map(term => (
                  <span key={term} className="px-3 py-1.5 bg-gray-50 text-muted-text rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100">{term}</span>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
              <h3 className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-4">Classes</h3>
              <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
                {(currentExamConfig.classes || []).map(classId => {
                  const c = classes.find(cl => String(cl.id) === String(classId));
                  return (
                    <span key={classId} className="flex items-center gap-2 px-3 py-1.5 bg-primary-teal/5 text-primary-teal rounded-full text-[9px] font-black uppercase hover:bg-primary-teal/10 transition group cursor-pointer">
                      {c?.name?.trim() || (c?.grade ? `Grade ${c.grade}` : `Class ${String(classId).slice(0, 8)}`)}
                      <X size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); const updated = currentExamConfig.classes.filter(id => id !== classId); setAllExamConfigs(allExamConfigs.map(ex => ex.name === selectedExamConfig ? { ...ex, classes: updated } : ex)); }} />
                    </span>
                  );
                })}
                <div className="relative">
                  <select onChange={(e) => { const val = e.target.value; if (val && !currentExamConfig.classes.includes(val)) { const updated = [...currentExamConfig.classes, val]; setAllExamConfigs(allExamConfigs.map(ex => ex.name === selectedExamConfig ? { ...ex, classes: updated } : ex)); } }} className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-primary-teal/50 hover:text-primary-teal transition ml-2 appearance-none bg-transparent cursor-pointer outline-none" value=""><option value="" disabled>+</option>{classes.filter(cls => !currentExamConfig.classes.includes(String(cls.id))).map(cls => <option key={cls.id} value={cls.id}>{cls.name?.trim() || (cls.grade ? `Grade ${cls.grade}` : `Class ${String(cls.id).slice(0, 8)}`)}</option>)}</select>
                  <Plus size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-300" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-end"><button onClick={handleArchiveExamConfig} className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition shadow-lg shadow-rose-500/20"><Trash2 size={14} /> Archive set</button></div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6"><Loader2 size={32} className="text-gray-300 animate-spin" /></div>
          <h3 className="text-lg font-black text-dark-text uppercase tracking-tight mb-2">Module Under Development</h3>
          <p className="text-xs font-bold text-muted-text uppercase tracking-widest">We're working on the {activeTab} section</p>
        </div>
      )}
    </div>
  );
};

export default ExamConfiguration;
