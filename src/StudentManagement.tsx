import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Save, X, Users, ChevronDown, ChevronRight,
  Loader2, Search, UserCheck, ArrowLeft, AlertCircle
} from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/api';
import { toast } from 'sonner';

export const DEPARTMENTS = [
  'Artificial Intelligence and Data Science',
  'Computer Science',
  'Information Technology',
  'Cyber Security',
];

const DEPT_COLORS: Record<string, { badge: string; header: string; border: string }> = {
  'Artificial Intelligence and Data Science': { badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30', header: 'bg-violet-500/10 border-violet-500/20', border: 'border-violet-500/30' },
  'Computer Science': { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', header: 'bg-blue-500/10 border-blue-500/20', border: 'border-blue-500/30' },
  'Information Technology': { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', header: 'bg-emerald-500/10 border-emerald-500/20', border: 'border-emerald-500/30' },
  'Cyber Security': { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', header: 'bg-rose-500/10 border-rose-500/20', border: 'border-rose-500/30' },
};

export interface StudentRecord {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  createdAt: string;
}

interface StudentManagementProps {
  onBack: () => void;
}

export default function StudentManagement({ onBack }: StudentManagementProps) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', registerNumber: '', department: '' });
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>(
    Object.fromEntries(DEPARTMENTS.map(d => [d, true]))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getStudents();
      setStudents(data.map(s => ({
        id: String(s.id),
        name: s.name,
        registerNumber: s.registerNumber,
        department: s.department,
        createdAt: s.createdAt || new Date().toISOString()
      })));
    } catch (error: any) {
      toast.error('Failed to load students: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.registerNumber.trim() || !formData.department) {
      toast.warning('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        registerNumber: formData.registerNumber.trim().toUpperCase(),
        department: formData.department
      };

      if (editingId) {
        await updateStudent(editingId, payload);
        toast.success('Student updated successfully');
      } else {
        await createStudent(payload);
        toast.success(`${payload.name} registered successfully`);
      }
      resetForm();
      await loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete ${name}? This will also remove their exam results and question assignment.`)) {
      try {
        await deleteStudent(id);
        toast.success(`${name} deleted`);
        await loadStudents();
      } catch (error: any) {
        toast.error('Failed to delete: ' + error.message);
      }
    }
  };

  const handleEdit = (student: StudentRecord) => {
    setFormData({ name: student.name, registerNumber: student.registerNumber, department: student.department });
    setEditingId(student.id);
    setIsAdding(true);
    setActiveDept(student.department);
  };

  const resetForm = () => {
    setFormData({ name: '', registerNumber: '', department: activeDept || '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const startAddForDept = (dept: string) => {
    setFormData({ name: '', registerNumber: '', department: dept });
    setActiveDept(dept);
    setIsAdding(true);
    setEditingId(null);
  };

  const toggleDept = (dept: string) => {
    setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  const deptStudents = (dept: string) => {
    const deptList = students.filter(s => s.department === dept);
    if (!searchTerm) return deptList;
    const term = searchTerm.toLowerCase();
    return deptList.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.registerNumber.toLowerCase().includes(term)
    );
  };

  const totalFiltered = DEPARTMENTS.reduce((acc, d) => acc + deptStudents(d).length, 0);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </button>
              <h1 className="text-2xl font-bold text-white">Student Registration</h1>
              <p className="text-white/40 text-sm mt-1">All records persist in SQLite database — safe across restarts</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold text-white">{students.length}</p>
                <p className="text-xs text-white/40">Total</p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search students by name or register number..."
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Summary badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {DEPARTMENTS.map(dept => {
              const c = DEPT_COLORS[dept];
              return (
                <div key={dept} className={`rounded-xl border p-3 ${c.header}`}>
                  <p className="text-xs font-medium text-white/50 truncate">{dept.split(' ')[0]}</p>
                  <p className="text-2xl font-bold text-white mt-1">{deptStudents(dept).length}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Add/Edit Form ───────────────────────────────────────────────── */}
        {isAdding && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-5">
              {editingId ? '✏️ Edit Student' : `➕ Add Student — ${formData.department}`}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/60 mb-2">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm appearance-none"
                >
                  <option value="" className="bg-slate-800">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-800">{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/60 mb-2">Student Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/60 mb-2">Register Number *</label>
                <input
                  type="text"
                  value={formData.registerNumber}
                  onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g., 2024CS001"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center gap-2 bg-indigo-600/80 hover:bg-indigo-500/80 disabled:bg-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update Student' : 'Add Student'}
              </button>
              <button
                onClick={resetForm}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search results info */}
        {searchTerm && (
          <div className="mb-3 px-1">
            <p className="text-white/40 text-sm">
              Found <span className="text-white font-semibold">{totalFiltered}</span> student{totalFiltered !== 1 ? 's' : ''} matching "<span className="text-indigo-300">{searchTerm}</span>"
            </p>
          </div>
        )}

        {/* ─── Department Lists ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {DEPARTMENTS.map(dept => {
            const list = deptStudents(dept);
            const expanded = expandedDepts[dept];
            const c = DEPT_COLORS[dept];

            return (
              <div key={dept} className={`border ${c.border} rounded-2xl overflow-hidden backdrop-blur-xl`}>
                <div
                  className={`flex items-center justify-between px-6 py-4 cursor-pointer ${c.header} transition-all hover:brightness-110`}
                  onClick={() => toggleDept(dept)}
                >
                  <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown className="w-5 h-5 text-white/60" /> : <ChevronRight className="w-5 h-5 text-white/60" />}
                    <Users className="w-5 h-5 text-white/60" />
                    <h3 className="font-bold text-white">{dept}</h3>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${c.badge}`}>
                      {list.length} student{list.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); startAddForDept(dept); }}
                    className="flex items-center gap-1.5 bg-indigo-600/80 hover:bg-indigo-500/80 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Student
                  </button>
                </div>

                {expanded && (
                  <div className="bg-black/20">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-10 gap-3 text-white/40 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        Loading from database...
                      </div>
                    ) : list.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <UserCheck className="w-10 h-10 text-white/10" />
                        <p className="text-white/30 text-sm">
                          {searchTerm ? `No results for "${searchTerm}"` : 'No students in this department yet'}
                        </p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="border-b border-white/10 bg-white/5">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">#</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Register Number</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Registered On</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {list.map((student, idx) => (
                            <tr key={student.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-3.5 text-sm text-white/30">{idx + 1}</td>
                              <td className="px-6 py-3.5 text-sm font-semibold text-white">{student.name}</td>
                              <td className="px-6 py-3.5 text-sm text-white/60 font-mono">{student.registerNumber}</td>
                              <td className="px-6 py-3.5 text-sm text-white/40">
                                {new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-3.5 text-center">
                                <div className="flex items-center gap-2 justify-center">
                                  <button
                                    onClick={() => handleEdit(student)}
                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(student.id, student.name)}
                                    className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 text-center text-white/25 text-xs">
          {students.length} student{students.length !== 1 ? 's' : ''} registered — data stored permanently in SQLite database
        </div>

      </div>
    </div>
  );
}
