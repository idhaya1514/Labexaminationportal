import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Calendar, ChevronLeft, ChevronRight, Check, X,
  Search, Loader2, Users, CheckCircle, Clock, Filter, Eye
} from 'lucide-react';
import { DEPARTMENTS } from './StudentManagement';
import { getStudents, getExamResults } from '../services/api';
import { toast } from 'sonner';

interface DailyTrackerProps {
  onBack: () => void;
}

interface StudentInfo {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
}

interface ExamResult {
  id?: number;
  student: { name: string; registerNumber: string; department?: string };
  question: string;
  programmingMarks: number;
  mcqMarks: number;
  totalMarks: number;
  maxMarks: number;
  malpractice?: boolean;
  submittedAt?: string;
  timeSpent?: number;
}

const DEPT_COLORS: Record<string, string> = {
  'Artificial Intelligence and Data Science': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'Computer Science': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Information Technology': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Cyber Security': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DailyTracker({ onBack }: DailyTrackerProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDateKey(today));
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [allResults, setAllResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'calendar' | 'matrix'>('calendar');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [studentsList, results] = await Promise.all([
        getStudents(),
        getExamResults()
      ]);
      setStudents(studentsList.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        registerNumber: s.registerNumber,
        department: s.department
      })));
      setAllResults(results);
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Build a map of dateKey -> Set of registerNumbers who submitted
  const submissionMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const r of allResults) {
      const raw = r.submittedAt;
      if (!raw) continue;
      const d = new Date(raw);
      const key = formatDateKey(d);
      if (!map[key]) map[key] = new Set();
      map[key].add(r.student.registerNumber);
    }
    return map;
  }, [allResults]);

  // Build a map of dateKey -> ExamResult[] for detail panel
  const resultsByDate = useMemo(() => {
    const map: Record<string, ExamResult[]> = {};
    for (const r of allResults) {
      const raw = r.submittedAt;
      if (!raw) continue;
      const key = formatDateKey(new Date(raw));
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return map;
  }, [allResults]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const deptOk = filterDept === 'all' || s.department === filterDept;
      const searchOk = !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return deptOk && searchOk;
    });
  }, [students, filterDept, searchTerm]);

  // Calendar helpers
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayKey = formatDateKey(today);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  // Stats for selected date
  const selectedDayResults = selectedDate ? (resultsByDate[selectedDate] || []) : [];
  const selectedDaySubmitters = selectedDate ? (submissionMap[selectedDate] || new Set()) : new Set();
  const completedStudents = filteredStudents.filter(s => selectedDaySubmitters.has(s.registerNumber));
  const pendingStudents = filteredStudents.filter(s => !selectedDaySubmitters.has(s.registerNumber));

  // Monthly stats
  const monthlyStats = useMemo(() => {
    let totalSubmissions = 0;
    let activeDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const subs = submissionMap[key];
      if (subs && subs.size > 0) {
        activeDays++;
        totalSubmissions += subs.size;
      }
    }
    return { totalSubmissions, activeDays };
  }, [submissionMap, currentYear, currentMonth, daysInMonth]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          <p className="text-white/50 text-sm">Loading daily tracker data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-teal-600/30 to-emerald-600/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('calendar')}
                className={`flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-xl transition-all border ${
                  activeView === 'calendar'
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar View
              </button>
              <button
                onClick={() => setActiveView('matrix')}
                className={`flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-xl transition-all border ${
                  activeView === 'matrix'
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Attendance Matrix
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Daily Test Tracker</h1>
              <p className="text-white/50 text-sm">Monitor which students complete tests each day</p>
            </div>
          </div>

          {/* Monthly summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <div className="bg-white/10 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-xs text-white/40">Total Students</p>
              <p className="text-2xl font-bold text-white">{filteredStudents.length}</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-xs text-white/40">Monthly Submissions</p>
              <p className="text-2xl font-bold text-emerald-300">{monthlyStats.totalSubmissions}</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-xs text-white/40">Active Days</p>
              <p className="text-2xl font-bold text-teal-300">{monthlyStats.activeDays}</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-xs text-white/40">Today's Completed</p>
              <p className="text-2xl font-bold text-green-300">
                {(submissionMap[todayKey]?.size || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Filters ──────────────────────────────────────────── */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm"
              />
            </div>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm appearance-none"
            >
              <option value="all" className="bg-slate-800">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-800">{d}</option>)}
            </select>
          </div>
        </div>

        {/* ─── Calendar View ──────────────────────────────────── */}
        {activeView === 'calendar' && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Calendar grid */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold text-white">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-white/30 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const subs = submissionMap[dateKey];
                  const count = subs ? subs.size : 0;
                  const isToday = dateKey === todayKey;
                  const isSelected = dateKey === selectedDate;
                  const isFuture = new Date(currentYear, currentMonth, day) > today;

                  // Determine cell status
                  let cellBg = 'bg-white/5 hover:bg-white/10';
                  let indicator = null;

                  if (!isFuture && count > 0) {
                    const pct = filteredStudents.length > 0 ? count / filteredStudents.length : 0;
                    if (pct >= 0.8) {
                      cellBg = 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30';
                      indicator = (
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      );
                    } else if (pct >= 0.4) {
                      cellBg = 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/20';
                      indicator = (
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50">
                          <span className="text-[7px] font-bold text-white">{count}</span>
                        </div>
                      );
                    } else {
                      cellBg = 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20';
                      indicator = (
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                          <span className="text-[7px] font-bold text-white">{count}</span>
                        </div>
                      );
                    }
                  }

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateKey)}
                      disabled={isFuture}
                      className={`relative aspect-square rounded-xl border transition-all flex flex-col items-center justify-center text-sm font-medium
                        ${isSelected ? 'ring-2 ring-teal-400 border-teal-400/50 bg-teal-500/20' : `border-transparent ${cellBg}`}
                        ${isToday && !isSelected ? 'ring-1 ring-white/30' : ''}
                        ${isFuture ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span className={`${isToday ? 'text-teal-300 font-bold' : 'text-white/70'} ${isSelected ? 'text-teal-200' : ''}`}>
                        {day}
                      </span>
                      {!isFuture && count > 0 && (
                        <span className="text-[9px] text-emerald-400 font-semibold mt-0.5">{count}</span>
                      )}
                      {indicator}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-3 text-[10px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                  <span>≥80% done</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/50" />
                  <span>40–79%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500/50" />
                  <span>&lt;40%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
                  <span>No tests</span>
                </div>
              </div>
            </div>

            {/* Day detail panel */}
            <div className="lg:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              {selectedDate ? (
                <>
                  {/* Day header */}
                  <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </h3>
                        <p className="text-white/40 text-sm mt-0.5">
                          {completedStudents.length} completed · {pendingStudents.length} pending
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-2">
                          <p className="text-xs text-emerald-400">Done</p>
                          <p className="text-xl font-bold text-emerald-300">{completedStudents.length}</p>
                        </div>
                        <div className="text-center bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                          <p className="text-xs text-white/40">Pending</p>
                          <p className="text-xl font-bold text-white/60">{pendingStudents.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {filteredStudents.length > 0 && (
                      <div className="mt-3">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${(completedStudents.length / filteredStudents.length) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-white/30 mt-1 text-right">
                          {((completedStudents.length / filteredStudents.length) * 100).toFixed(0)}% completion
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Completed students */}
                  <div className="max-h-[520px] overflow-y-auto">
                    {completedStudents.length > 0 && (
                      <div className="px-6 py-4">
                        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed ({completedStudents.length})
                        </h4>
                        <div className="space-y-2">
                          {completedStudents.map(student => {
                            const result = selectedDayResults.find(r => r.student.registerNumber === student.registerNumber);
                            const dept = student.department;
                            return (
                              <div
                                key={student.registerNumber}
                                className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                                    <Check className="w-4 h-4 text-emerald-300" strokeWidth={3} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-white">{student.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-white/40 font-mono">{student.registerNumber}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${DEPT_COLORS[dept] || 'bg-white/10 text-white/40 border-white/20'}`}>
                                        {dept.split(' ').slice(-1)[0]}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {result && (
                                  <div className="flex items-center gap-3 text-right">
                                    <div>
                                      <p className="text-sm font-bold text-emerald-300">
                                        {(result.programmingMarks || 0) + (result.mcqMarks || 0)}/{result.maxMarks || 50}
                                      </p>
                                      <p className="text-[10px] text-white/30">
                                        {result.question ? result.question.slice(0, 20) + (result.question.length > 20 ? '...' : '') : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Pending students */}
                    {pendingStudents.length > 0 && (
                      <div className="px-6 py-4 border-t border-white/5">
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          Pending ({pendingStudents.length})
                        </h4>
                        <div className="space-y-1.5">
                          {pendingStudents.map(student => {
                            const dept = student.department;
                            return (
                              <div
                                key={student.registerNumber}
                                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-white/20" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-white/60">{student.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-white/30 font-mono">{student.registerNumber}</span>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-medium ${DEPT_COLORS[dept] || 'bg-white/10 text-white/30 border-white/20'}`}>
                                        {dept.split(' ').slice(-1)[0]}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs text-white/20 italic">Not submitted</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {completedStudents.length === 0 && pendingStudents.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Users className="w-12 h-12 text-white/15" />
                        <p className="text-white/30 text-sm">No students match your filters</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Eye className="w-14 h-14 text-white/10" />
                  <p className="text-white/30 font-medium">Select a date to view details</p>
                  <p className="text-white/20 text-sm">Click on any day in the calendar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Attendance Matrix View ──────────────────────────── */}
        {activeView === 'matrix' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Matrix header */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-base font-bold text-white min-w-[180px] text-center">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-300" strokeWidth={3} />
                  </div>
                  <span>Test completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10" />
                  <span>No test</span>
                </div>
              </div>
            </div>

            {/* Matrix table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="sticky left-0 z-10 bg-slate-900/95 backdrop-blur-sm px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider min-w-[200px] border-r border-white/10">
                      Student
                    </th>
                    <th className="sticky left-[200px] z-10 bg-slate-900/95 backdrop-blur-sm px-2 py-3 text-center text-xs font-semibold text-white/50 uppercase tracking-wider min-w-[55px] border-r border-white/10">
                      Total
                    </th>
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isToday = dateKey === todayKey;
                      const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
                      const isSunday = dayOfWeek === 0;
                      return (
                        <th
                          key={day}
                          className={`px-0 py-3 text-center text-[10px] font-semibold min-w-[34px]
                            ${isToday ? 'text-teal-300 bg-teal-500/10' : isSunday ? 'text-rose-400/50' : 'text-white/40'}
                          `}
                        >
                          <div>{day}</div>
                          <div className="text-[8px] font-normal">{WEEKDAYS[dayOfWeek]}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth + 2} className="px-6 py-16 text-center text-white/30 text-sm">
                        No students match your filters
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      // Pre-compute total days this student completed tests this month
                      let totalDays = 0;
                      const completionFlags: boolean[] = [];
                      for (let i = 0; i < daysInMonth; i++) {
                        const day = i + 1;
                        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const subs = submissionMap[dateKey];
                        const completed = subs ? subs.has(student.registerNumber) : false;
                        completionFlags.push(completed);
                        if (completed) totalDays++;
                      }

                      return (
                        <tr key={student.registerNumber} className="hover:bg-white/[0.03] transition-colors">
                          <td className="sticky left-0 z-10 bg-slate-900/95 backdrop-blur-sm px-4 py-2.5 border-r border-white/10">
                            <div>
                              <p className="text-xs font-semibold text-white truncate max-w-[130px]">{student.name}</p>
                              <p className="text-[10px] text-white/30 font-mono">{student.registerNumber}</p>
                            </div>
                          </td>
                          <td className="sticky left-[200px] z-10 bg-slate-900/95 backdrop-blur-sm px-2 py-2.5 text-center border-r border-white/10">
                            <span className={`text-xs font-bold ${totalDays > 0 ? 'text-emerald-400' : 'text-white/20'}`}>
                              {totalDays}
                            </span>
                          </td>
                          {completionFlags.map((completed, i) => {
                            const day = i + 1;
                            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isFuture = new Date(currentYear, currentMonth, day) > today;
                            const isToday = dateKey === todayKey;

                            return (
                              <td
                                key={day}
                                className={`px-0 py-2.5 text-center ${isToday ? 'bg-teal-500/5' : ''}`}
                              >
                                {isFuture ? (
                                  <div className="w-6 h-6 mx-auto rounded-md bg-white/[0.02]" />
                                ) : completed ? (
                                  <div className="w-6 h-6 mx-auto rounded-md bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center transition-all hover:bg-emerald-500/40 hover:scale-110">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 mx-auto rounded-md bg-white/[0.04] border border-white/[0.06]" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-white/10 text-xs text-white/30 text-center">
              Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} × {daysInMonth} days — {MONTH_NAMES[currentMonth]} {currentYear}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
