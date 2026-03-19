import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, ChevronRight } from 'lucide-react';

const StudentOnlineCampus = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/student/subjects');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data.subjects || []);
        }
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      }
      setLoading(false);
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-black text-dark-text mb-6">My Subjects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <Link 
            key={subject.id} 
            to={`/portal/subject/${subject.id}`}
            className="bg-white rounded-2xl p-6 shadow-soft-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-teal/10 rounded-xl flex items-center justify-center text-primary-teal">
                  <BookOpen size={24} />
                </div>
                <div className="text-xs font-bold text-muted-text">View Subject</div>
              </div>
              <h3 className="text-xl font-black text-dark-text mb-1">{subject.subjectName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-text font-bold">
                <User size={16} />
                <span>{subject.teacherName}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end text-primary-teal">
              <ChevronRight size={20} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentOnlineCampus;
