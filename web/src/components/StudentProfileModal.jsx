import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Flag, User, Mail, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentProfileModal = ({ studentId, onClose }) => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/students/${studentId}`, { headers: { 'x-school-id': localStorage.getItem('schoolId') || 'local' } });
                const data = await res.json();
                setStudent(data);
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchProfile();
        }
    }, [studentId]);

    if (!studentId) return null;

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-black text-muted-text italic">Fetching profile details...</p>
                    </div>
                ) : student ? (
                    <div className="flex flex-col">
                        {/* Modal Header/Banner */}
                        <div className="h-32 bg-gradient-to-r from-primary-teal to-secondary-teal relative">
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Profile Content */}
                        <div className="px-8 pb-8 -mt-16 relative">
                            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                                <div className="w-32 h-32 rounded-[2rem] bg-white p-2 shadow-xl relative">
                                    <div className="w-full h-full rounded-[1.5rem] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-primary-teal text-4xl font-black border border-gray-100 overflow-hidden">
                                        {student.profilePicture ? (
                                            <img src={student.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <>{student.firstName?.[0]}{student.lastName?.[0]}</>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                                        <ShieldCheck size={20} />
                                    </div>
                                </div>
                                <div className="flex-1 pb-2">
                                    <h2 className="text-3xl font-black text-dark-text tracking-tight">
                                        {student.firstName} {student.lastName}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <span className="px-3 py-1 rounded-full bg-primary-teal/10 text-primary-teal text-[10px] font-black uppercase tracking-widest">
                                            {student.className || `Grade ${student.grade}`}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                        <span className="text-xs font-bold text-muted-text flex items-center gap-1.5">
                                            <Flag size={14} className="text-gray-400" /> {student.nationality || 'Nationality Not Set'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-light-bg/50 p-6 rounded-[2rem] border border-gray-100/50">
                                        <h4 className="text-[10px] font-black text-muted-text uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <User size={14} /> Personal Details
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-text">Student ID</span>
                                                <span className="text-xs font-black text-dark-text font-mono bg-white px-2 py-1 rounded-lg border border-gray-100">{student.studentId}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-text">Gender</span>
                                                <span className="text-xs font-black text-dark-text">{student.gender || 'Not specified'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-text">Birthday</span>
                                                <span className="text-xs font-black text-dark-text">{student.birthday ? new Date(student.birthday).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-text">Behavior Points</span>
                                                <span className={`text-xs font-black px-3 py-1 rounded-full ${student.behaviorPoints >= 100 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
                                                    {student.behaviorPoints || 100} PTS
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-light-bg/50 p-6 rounded-[2rem] border border-gray-100/50">
                                        <h4 className="text-[10px] font-black text-muted-text uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Mail size={14} /> Contact Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-xs font-bold text-dark-text">
                                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary-teal border border-gray-100"><Mail size={14} /></div>
                                                {student.email}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-bold text-dark-text">
                                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary-teal border border-gray-100"><MapPin size={14} /></div>
                                                {student.address || 'No address provided'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft-sm">
                                        <h4 className="text-[10px] font-black text-muted-text uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Users size={14} /> Guardian Info
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1">Name</div>
                                                <div className="text-sm font-black text-dark-text">{student.guardianName || 'Not Set'}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1">Relation</div>
                                                    <div className="text-sm font-black text-dark-text">{student.guardianRelationship || '—'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1">Contact</div>
                                                    <div className="text-sm font-black text-dark-text">{student.guardianContact || '—'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-dark-text p-6 rounded-[2rem] text-white shadow-xl shadow-gray-200">
                                        <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Quick Stats</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <div className="text-xl font-black">98%</div>
                                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Attendance</div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <div className="text-xl font-black">A-</div>
                                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Avg Grade</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/dashboard/students?id=${student.id}`)}
                                            className="w-full mt-6 py-3 bg-white text-dark-text rounded-2xl text-xs font-black hover:bg-gray-100 transition shadow-lg"
                                        >
                                            Full Student Analytics
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-20 text-center text-muted-text font-bold italic">Failed to load student profile.</div>
                )}
            </div>
        </div>
    );
};

export default StudentProfileModal;
