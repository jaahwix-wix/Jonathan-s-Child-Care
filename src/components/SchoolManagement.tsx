import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Sparkles,
  UserCheck,
  Heart,
  Phone,
  BookOpen,
  Award,
  Filter,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import { Student, SubjectGrade } from '../types';
import { exportStudentsPdf } from '../utils/pdfExporter';

interface SchoolManagementProps {
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  searchQuery: string;
}

export const SchoolManagement: React.FC<SchoolManagementProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  searchQuery,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [aiReportOutput, setAiReportOutput] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Form State for Adding Student
  const [newStudentName, setNewStudentName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('JSS 1');
  const [newAge, setNewAge] = useState(12);
  const [newGender, setNewGender] = useState<'Female' | 'Male'>('Female');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('+232 ');
  const [newEmotionalNotes, setNewEmotionalNotes] = useState('');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'All' || s.gradeLevel.includes(gradeFilter);
    return matchesSearch && matchesGrade;
  });

  const handleGenerateAiReport = async (student: Student) => {
    setIsGeneratingAi(true);
    setAiReportOutput('');
    try {
      const response = await fetch('/api/gemini/student-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          gradeLevel: student.gradeLevel,
          grades: student.grades,
          emotionalNotes: student.emotionalSupportNotes,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setAiReportOutput(data.result);
      } else {
        setAiReportOutput('Failed to generate report card comments.');
      }
    } catch (err) {
      console.error(err);
      setAiReportOutput('Error connecting to AI service.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: `STU-${100 + students.length + 1}`,
      name: newStudentName,
      gradeLevel: newGradeLevel,
      age: Number(newAge),
      gender: newGender,
      guardianName: newGuardianName || 'Family Guardian',
      guardianPhone: newGuardianPhone || '+232 76 000 000',
      attendanceRate: 98,
      emotionalSupportNotes: newEmotionalNotes || 'Adapting well to academic schedule at JCC School.',
      nutritionStatus: 'Optimal',
      scholarshipStatus: 'Full Sponsor',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      grades: [
        { subject: 'Integrated Science', score: 85, letterGrade: 'B', teacherComment: 'Engaged in lab practicals.' },
        { subject: 'Mathematics', score: 82, letterGrade: 'B', teacherComment: 'Good grasp of fundamentals.' },
        { subject: 'English Language', score: 86, letterGrade: 'A', teacherComment: 'Solid reading comprehension.' },
        { subject: 'Social Studies', score: 84, letterGrade: 'B', teacherComment: 'Active class participant.' },
      ],
    };

    onAddStudent(newStudent);
    setShowAddModal(false);
    // Reset
    setNewStudentName('');
    setNewEmotionalNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            Jonathan's Child Care Academic Institution
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Student Roster & Child Welfare System</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Academic records, STEM track performance, and emotional nurture logs for Bo District pupils.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportStudentsPdf(students)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Export Roster PDF</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase">Grade Filter:</span>
          {['All', 'Primary', 'JSS 1', 'JSS 2', 'JSS 3'].map((grade) => (
            <button
              key={grade}
              onClick={() => setGradeFilter(grade)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                gradeFilter === grade
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-emerald-400">{filteredStudents.length}</strong> of {students.length} Students
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const avgScore = Math.round(
            student.grades.reduce((acc, curr) => acc + curr.score, 0) / (student.grades.length || 1)
          );

          return (
            <div
              key={student.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/50 p-5 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                        {student.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {student.id}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-medium">{student.gradeLevel}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Age {student.age} • Guardian: {student.guardianName}
                    </p>
                  </div>
                </div>

                {/* Academic Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Average Score</span>
                    <span className="font-bold text-emerald-400 text-sm">{avgScore}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Attendance</span>
                    <span className="font-bold text-blue-400 text-sm">{student.attendanceRate}%</span>
                  </div>
                </div>

                {/* Emotional / Nurture Note */}
                {student.emotionalSupportNotes && (
                  <div className="text-xs text-slate-300 bg-emerald-950/20 border border-emerald-900/40 p-2.5 rounded-lg flex items-start gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{student.emotionalSupportNotes}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  {student.scholarshipStatus}
                </span>
                <button
                  onClick={() => {
                    setSelectedStudent(student);
                    setAiReportOutput('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Report & Profile</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Details & AI Report Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                  <p className="text-sm text-emerald-400 font-medium">
                    {selectedStudent.gradeLevel} • Age {selectedStudent.age}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3 text-slate-400" /> Guardian: {selectedStudent.guardianName} ({selectedStudent.guardianPhone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Academic Grades Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> Academic Subjects & Comments
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="text-[11px] uppercase bg-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Subject</th>
                      <th className="px-4 py-2.5">Score</th>
                      <th className="px-4 py-2.5">Grade</th>
                      <th className="px-4 py-2.5">Teacher Observation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedStudent.grades.map((g, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-semibold text-white">{g.subject}</td>
                        <td className="px-4 py-2.5 font-medium text-emerald-400">{g.score}%</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                            {g.letterGrade}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300 italic">{g.teacherComment || 'Satisfactory progress.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Welfare & Emotional Support */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Child Care & Emotional Support Notes
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedStudent.emotionalSupportNotes || 'Nurturing environment maintained. Healthy peer interactions.'}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-700/50">
                <span>Nutrition Status: <strong className="text-emerald-400">{selectedStudent.nutritionStatus}</strong></span>
                <span>Scholarship: <strong className="text-amber-400">{selectedStudent.scholarshipStatus}</strong></span>
              </div>
            </div>

            {/* AI Generator Action Button */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> AI Student Report Comment Generator
                </h4>
                <button
                  onClick={() => handleGenerateAiReport(selectedStudent)}
                  disabled={isGeneratingAi}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate AI Report Card Analysis</span>
                    </>
                  )}
                </button>
              </div>

              {aiReportOutput && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/60 text-xs text-slate-200 space-y-2 max-h-60 overflow-y-auto font-mono leading-relaxed whitespace-pre-wrap">
                  <div className="flex items-center justify-between text-emerald-400 font-semibold font-sans border-b border-slate-800 pb-1 mb-2">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> JCC Official Report Comment Analysis
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiReportOutput)}
                      className="text-[10px] text-slate-400 hover:text-white underline"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                  {aiReportOutput}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Enroll Pupil in JCC Bo School
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Student Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Mariama Sow"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Grade Level</label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Primary 5">Primary 5</option>
                    <option value="Primary 6">Primary 6</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2 (STEM Track)">JSS 2 (STEM Track)</option>
                    <option value="JSS 3">JSS 3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    min={5}
                    max={18}
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={newGuardianName}
                    onChange={(e) => setNewGuardianName(e.target.value)}
                    placeholder="Parent / Guardian"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    value={newGuardianPhone}
                    onChange={(e) => setNewGuardianPhone(e.target.value)}
                    placeholder="+232 76 ..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Emotional Support & Welfare Notes</label>
                <textarea
                  rows={2}
                  value={newEmotionalNotes}
                  onChange={(e) => setNewEmotionalNotes(e.target.value)}
                  placeholder="Special guidance or academic interests..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
