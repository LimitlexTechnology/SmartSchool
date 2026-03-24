import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Clock, X, Save, ChevronDown, Edit3, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Calendar = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // View state for jumping between months
    const [viewDate, setViewDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); 

    const [formData, setFormData] = useState({
        title: '',
        type: '',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: '',
        location: '',
        notes: '',
        appliesTo: '',
        academicYear: '2025/2026',
        term: 'Second Term'
    });

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Navigation helpers
    const nextMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const resetToToday = () => setViewDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    // Dropdown options in state to allow adding custom ones
    const [eventTypes, setEventTypes] = useState(['Holiday', 'Examination', 'Activity']);
    const [appliesToOptions, setAppliesToOptions] = useState(['Everyone', 'Staff Only', 'Students Only']);
    const [academicYears, setAcademicYears] = useState(['2025/2026', '2026/2027']);
    const [terms, setTerms] = useState(['First Term', 'Second Term', 'Third Term']);

    // State to track if we are currently adding a custom value for a field
    const [addingNewField, setAddingNewField] = useState(null); // 'type' | 'appliesTo' | 'academicYear' | 'term'
    const [newVal, setNewVal] = useState('');

    const handleAddNew = (field, setter) => {
        if (!newVal.trim()) {
            setAddingNewField(null);
            return;
        }
        setter(prev => [...prev, newVal.trim()]);
        setFormData(prev => ({ ...prev, [field]: newVal.trim() }));
        setNewVal('');
        setAddingNewField(null);
    };

    const [allEvents, setAllEvents] = useState([]);

    // Fetch events on mount
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/events');
            if (res.ok) {
                const data = await res.json();
                setAllEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtered and grouped data
    const calendarData = React.useMemo(() => {
        const month = monthNames[viewDate.getMonth()];
        const year = viewDate.getFullYear();
        
        console.log('Regenerating calendarData for:', month, year);
        console.log('Total events in state:', allEvents.length);

        const monthEvents = (allEvents || []).filter(event => {
            const dateObj = new Date(event.date);
            const match = dateObj.getMonth() === viewDate.getMonth() && dateObj.getFullYear() === viewDate.getFullYear();
            return match;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log('Events found for this month:', monthEvents.length);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedEvents = monthEvents.map(event => {
            const dateObj = new Date(event.date);
            return {
                ...event,
                day: dayNames[dateObj.getDay()],
                dateNum: dateObj.getDate(),
                time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            };
        });

        return monthEvents.length > 0 ? [{ month, year, events: formattedEvents }] : [];
    }, [allEvents, viewDate]);

    const handleOpenAddDrawer = () => {
        setEditingEventId(null);
        setFormData({
            title: '',
            type: '',
            startDate: new Date().toISOString().slice(0, 16),
            endDate: '',
            location: '',
            notes: '',
            appliesTo: '',
            academicYear: '2025/2026',
            term: 'Second Term'
        });
        setIsDrawerOpen(true);
    };

    const handleOpenEditDrawer = (event) => {
        setEditingEventId(event.id);
        setFormData({
            title: event.title,
            type: event.type || '',
            startDate: event.date,
            endDate: event.endDate || '',
            location: event.location,
            notes: event.notes || '',
            appliesTo: event.tag,
            academicYear: event.academicYear || '2025/2026',
            term: event.term || 'Second Term'
        });
        setIsDrawerOpen(true);
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
                if (res.ok) {
                    setAllEvents(prev => prev.filter(e => e.id !== eventId));
                }
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    const handleSubmit = async () => {
        const eventDate = new Date(formData.startDate);
        const eventData = {
            id: editingEventId || Math.random().toString(36).substr(2, 9),
            title: formData.title,
            date: formData.startDate,
            endDate: formData.endDate,
            location: formData.location,
            tag: formData.appliesTo,
            notes: formData.notes,
            type: formData.type,
            academicYear: formData.academicYear,
            term: formData.term
        };

        setSaving(true);
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (res.ok) {
                const savedEvent = await res.json();
                if (editingEventId) {
                    setAllEvents(prev => prev.map(e => e.id === editingEventId ? savedEvent : e));
                } else {
                    setAllEvents(prev => [...prev, savedEvent].sort((a, b) => new Date(a.date) - new Date(b.date)));
                }
                setViewDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
                setIsDrawerOpen(false);
            }
        } catch (error) {
            console.error('Error saving event:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const schoolName = localStorage.getItem('schoolName') || 'SmartSchool';
        const academicYear = localStorage.getItem('academicYearLabel') || '2025/2026';
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(15, 23, 42); // #0F172A
        doc.text(schoolName, 14, 20);
        
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139); // muted-text
        doc.text(`School Calendar - Academic Year ${academicYear}`, 14, 30);
        
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

        // Prepare table data
        const tableData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Sort all events chronologically
        const sortedEvents = [...allEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        sortedEvents.forEach(event => {
            const dateObj = new Date(event.date);
            tableData.push([
                `${dayNames[dateObj.getDay()]}, ${dateObj.toLocaleDateString()}`,
                dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                event.title,
                event.location,
                event.type,
                event.tag
            ]);
        });

        autoTable(doc, {
            startY: 45,
            head: [['Date', 'Time', 'Event Title', 'Location', 'Type', 'Applies To']],
            body: tableData,
            headStyles: { fillColor: [20, 184, 166], textColor: 255, fontStyle: 'bold' }, // primary-teal
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 45 },
            styles: { fontSize: 9, cellPadding: 4 }
        });

        doc.save(`${schoolName}_Calendar_${academicYear}.pdf`);
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">School Calendar</h1>
                    <div className="flex items-center gap-2 text-muted-text font-medium">
                        <CalendarIcon size={16} className="text-primary-teal" />
                        <span>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                        <button 
                            onClick={prevMonth}
                            className="p-2 hover:bg-white hover:text-primary-teal rounded-lg transition-all"
                            title="Previous Month"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={resetToToday}
                            className="px-4 py-1.5 text-xs font-black uppercase tracking-widest hover:bg-white rounded-lg transition-all"
                        >
                            Today
                        </button>
                        <button 
                            onClick={nextMonth}
                            className="p-2 hover:bg-white hover:text-primary-teal rounded-lg transition-all"
                            title="Next Month"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button 
                        onClick={handleExportPDF}
                        disabled={allEvents.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-dark-text rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} className="text-primary-teal" /> Export PDF
                    </button>

                    <button 
                        onClick={handleOpenAddDrawer}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-teal text-white rounded-xl text-sm font-bold hover:bg-primary-teal/90 transition-all shadow-lg shadow-primary-teal/20"
                    >
                        <Plus size={18} /> Add Event
                    </button>
                </div>
            </div>

            {/* Side Drawer Overlay */}
            {isDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Side Drawer Content */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-[1001] transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
                    <h2 className="text-2xl font-black text-[#0F172A]">{editingEventId ? 'Edit Event' : 'Add Event'}</h2>
                    <button 
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors text-xs font-black uppercase tracking-widest"
                    >
                        <X size={16} /> Close
                    </button>
                </div>

                {/* Drawer Form */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="flex flex-col gap-6">
                        {/* Title */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Title:</label>
                            <input 
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Enter event title"
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                            />
                        </div>

                        {/* Type */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Type:</label>
                            {addingNewField === 'type' ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" autoFocus
                                        value={newVal}
                                        onChange={(e) => setNewVal(e.target.value)}
                                        placeholder="Add custom type..."
                                        className="flex-1 px-5 py-3.5 bg-gray-50 border-2 border-primary-teal rounded-2xl text-sm font-bold text-dark-text outline-none"
                                    />
                                    <button 
                                        onClick={() => handleAddNew('type', setEventTypes)}
                                        className="px-4 bg-primary-teal text-white rounded-xl text-xs font-bold"
                                    >Save</button>
                                    <button 
                                        onClick={() => setAddingNewField(null)}
                                        className="px-4 bg-gray-100 text-muted-text rounded-xl text-xs font-bold"
                                    >Cancel</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <select 
                                        value={formData.type}
                                        onChange={(e) => {
                                            if (e.target.value === '__add_new__') {
                                                setAddingNewField('type');
                                                setNewVal('');
                                            } else {
                                                setFormData({...formData, type: e.target.value});
                                            }
                                        }}
                                        className="w-full appearance-none px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                                    >
                                        <option value="">Select event type</option>
                                        {eventTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        <option value="__add_new__" className="text-primary-teal font-bold">+ Add New Type...</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
                                </div>
                            )}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Start Date:</label>
                                <input 
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">End Date:</label>
                                <input 
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Location:</label>
                            <input 
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                            />
                        </div>

                        {/* Notes */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Notes:</label>
                            <textarea 
                                rows="4"
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Add any additional notes (optional)"
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition resize-none"
                            />
                        </div>

                        {/* Applies To */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Applies To:</label>
                            {addingNewField === 'appliesTo' ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" autoFocus
                                        value={newVal}
                                        onChange={(e) => setNewVal(e.target.value)}
                                        placeholder="Add custom category..."
                                        className="flex-1 px-5 py-3.5 bg-gray-50 border-2 border-primary-teal rounded-2xl text-sm font-bold text-dark-text outline-none"
                                    />
                                    <button 
                                        onClick={() => handleAddNew('appliesTo', setAppliesToOptions)}
                                        className="px-4 bg-primary-teal text-white rounded-xl text-xs font-bold"
                                    >Save</button>
                                    <button 
                                        onClick={() => setAddingNewField(null)}
                                        className="px-4 bg-gray-100 text-muted-text rounded-xl text-xs font-bold"
                                    >Cancel</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <select 
                                        value={formData.appliesTo}
                                        onChange={(e) => {
                                            if (e.target.value === '__add_new__') {
                                                setAddingNewField('appliesTo');
                                                setNewVal('');
                                            } else {
                                                setFormData({...formData, appliesTo: e.target.value});
                                            }
                                        }}
                                        className="w-full appearance-none px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                                    >
                                        <option value="">Choose category this event applies to</option>
                                        {appliesToOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        <option value="__add_new__" className="text-primary-teal font-bold">+ Add New Category...</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
                                </div>
                            )}
                        </div>

                        {/* Academic Year */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Academic Year:</label>
                            {addingNewField === 'academicYear' ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" autoFocus
                                        value={newVal}
                                        onChange={(e) => setNewVal(e.target.value)}
                                        placeholder="Add custom year..."
                                        className="flex-1 px-5 py-3.5 bg-gray-50 border-2 border-primary-teal rounded-2xl text-sm font-bold text-dark-text outline-none"
                                    />
                                    <button 
                                        onClick={() => handleAddNew('academicYear', setAcademicYears)}
                                        className="px-4 bg-primary-teal text-white rounded-xl text-xs font-bold"
                                    >Save</button>
                                    <button 
                                        onClick={() => setAddingNewField(null)}
                                        className="px-4 bg-gray-100 text-muted-text rounded-xl text-xs font-bold"
                                    >Cancel</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <select 
                                        value={formData.academicYear}
                                        onChange={(e) => {
                                            if (e.target.value === '__add_new__') {
                                                setAddingNewField('academicYear');
                                                setNewVal('');
                                            } else {
                                                setFormData({...formData, academicYear: e.target.value});
                                            }
                                        }}
                                        className="w-full appearance-none px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                                    >
                                        <option value="">Select academic year</option>
                                        {academicYears.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        <option value="__add_new__" className="text-primary-teal font-bold">+ Add New Year...</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
                                </div>
                            )}
                        </div>

                        {/* Term */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Term:</label>
                            {addingNewField === 'term' ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" autoFocus
                                        value={newVal}
                                        onChange={(e) => setNewVal(e.target.value)}
                                        placeholder="Add custom term..."
                                        className="flex-1 px-5 py-3.5 bg-gray-50 border-2 border-primary-teal rounded-2xl text-sm font-bold text-dark-text outline-none"
                                    />
                                    <button 
                                        onClick={() => handleAddNew('term', setTerms)}
                                        className="px-4 bg-primary-teal text-white rounded-xl text-xs font-bold"
                                    >Save</button>
                                    <button 
                                        onClick={() => setAddingNewField(null)}
                                        className="px-4 bg-gray-100 text-muted-text rounded-xl text-xs font-bold"
                                    >Cancel</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <select 
                                        value={formData.term}
                                        onChange={(e) => {
                                            if (e.target.value === '__add_new__') {
                                                setAddingNewField('term');
                                                setNewVal('');
                                            } else {
                                                setFormData({...formData, term: e.target.value});
                                            }
                                        }}
                                        className="w-full appearance-none px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-dark-text focus:bg-white focus:border-primary-teal outline-none transition"
                                    >
                                        <option value="">Select term</option>
                                        {terms.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        <option value="__add_new__" className="text-primary-teal font-bold">+ Add New Term...</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="px-8 py-6 border-t border-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3.5 bg-primary-teal text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary-teal/90 transition-all shadow-lg shadow-primary-teal/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {editingEventId ? 'Update' : 'Submit'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={40} className="text-primary-teal animate-spin mb-4" />
                        <p className="text-muted-text font-bold">Loading events...</p>
                    </div>
                ) : calendarData.length > 0 ? (
                    calendarData.map((section, sIdx) => (
                        <div key={sIdx} className="flex flex-col gap-6">
                            <h3 className="text-xl font-bold text-muted-text tracking-tight px-2">{section.month} {section.year}</h3>
                            <div className="flex flex-col gap-4">
                                {section.events.map((event, eIdx) => (
                                    <div key={event.id} className="bg-white rounded-[24px] border border-gray-100 shadow-soft-sm p-1.5 flex items-stretch group hover:border-primary-teal transition-all relative">
                                        {/* Action Buttons */}
                                        <div className="absolute top-4 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleOpenEditDrawer(event)}
                                                className="p-2 bg-gray-50 hover:bg-primary-teal/10 text-muted-text hover:text-primary-teal rounded-lg transition-colors"
                                                title="Edit Event"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="p-2 bg-gray-50 hover:bg-rose-50 text-muted-text hover:text-rose-500 rounded-lg transition-colors"
                                                title="Delete Event"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Date Column */}
                                        <div className="w-24 flex flex-col items-center justify-center border-r border-gray-50 py-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">{event.day}</span>
                                            <span className="text-3xl font-black text-dark-text leading-none">{event.dateNum}</span>
                                        </div>
                                        
                                        {/* Info Column */}
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-12 px-8 py-4">
                                            <div className="flex flex-col gap-2 min-w-[120px]">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-text">
                                                    <Clock size={14} className="text-primary-teal" /> {event.time}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-text">
                                                    <MapPin size={14} className="text-primary-teal" /> {event.location}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="text-sm font-black text-dark-text uppercase tracking-wider mb-2">{event.title}</h4>
                                                <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    {event.tag}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-soft-sm flex items-center justify-center text-muted-text mb-4">
                            <CalendarIcon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-dark-text">No events for this month</h3>
                        <p className="text-sm text-muted-text">Try switching months or add a new event.</p>
                        <button 
                            onClick={handleOpenAddDrawer}
                            className="mt-6 text-primary-teal text-sm font-black uppercase tracking-widest hover:underline"
                        >
                            + Add Event
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;
