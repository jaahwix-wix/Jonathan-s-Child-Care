import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Student, SchoolTier, DailyAttendanceRecord } from '../types';

interface MonthlyAttendanceChartProps {
  students: Student[];
  studentId?: string; // If provided, shows single-pupil monthly patterns
  compact?: boolean;  // If true, shows modal-friendly compact view
}

export const MonthlyAttendanceChart: React.FC<MonthlyAttendanceChartProps> = ({
  students,
  studentId,
  compact = false,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedTier, setSelectedTier] = useState<'All' | SchoolTier>('All');
  const [chartMode, setChartMode] = useState<'stacked' | 'grouped' | 'rate'>('stacked');

  // If a single studentId is provided, get that student
  const targetStudent = useMemo(() => {
    if (!studentId) return null;
    return students.find((s) => s.id === studentId) || null;
  }, [students, studentId]);

  // Month names for chart indexing
  const months = useMemo(
    () => [
      { key: '01', name: 'Jan', fullName: 'January' },
      { key: '02', name: 'Feb', fullName: 'February' },
      { key: '03', name: 'Mar', fullName: 'March' },
      { key: '04', name: 'Apr', fullName: 'April' },
      { key: '05', name: 'May', fullName: 'May' },
      { key: '06', name: 'Jun', fullName: 'June' },
      { key: '07', name: 'Jul', fullName: 'July' },
      { key: '08', name: 'Aug', fullName: 'August' },
      { key: '09', name: 'Sep', fullName: 'September' },
      { key: '10', name: 'Oct', fullName: 'October' },
      { key: '11', name: 'Nov', fullName: 'November' },
      { key: '12', name: 'Dec', fullName: 'December' },
    ],
    []
  );

  // Filter students based on tier or single student
  const filteredStudents = useMemo(() => {
    if (targetStudent) return [targetStudent];
    if (selectedTier === 'All') return students;
    return students.filter((s) => s.schoolTier === selectedTier);
  }, [students, selectedTier, targetStudent]);

  // Aggregate monthly attendance numbers from student dailyAttendance records
  const monthlyData = useMemo(() => {
    return months.map((m) => {
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;
      let totalLogs = 0;

      const prefix = `${selectedYear}-${m.key}`;

      filteredStudents.forEach((student) => {
        if (student.dailyAttendance) {
          Object.entries(student.dailyAttendance).forEach(([dateStr, record]) => {
            const r = record as DailyAttendanceRecord;
            if (dateStr.startsWith(prefix)) {
              totalLogs++;
              if (r.status === 'Present') presentCount++;
              else if (r.status === 'Absent') absentCount++;
              else if (r.status === 'Late') lateCount++;
              else if (r.status === 'Excused') excusedCount++;
            }
          });
        }
      });

      // If no recorded daily logs exist for this month yet, project estimation based on attendanceRate
      if (totalLogs === 0 && filteredStudents.length > 0) {
        const avgRate = Math.round(
          filteredStudents.reduce((acc, s) => acc + (s.attendanceRate || 90), 0) /
            filteredStudents.length
        );
        const schoolDays = 20;
        const totalPupilSessions = filteredStudents.length * schoolDays;
        presentCount = Math.round((totalPupilSessions * avgRate) / 100);
        absentCount = Math.max(0, Math.round((totalPupilSessions * (100 - avgRate) * 0.7) / 100));
        lateCount = Math.max(0, Math.round((totalPupilSessions * (100 - avgRate) * 0.2) / 100));
        excusedCount = Math.max(0, totalPupilSessions - presentCount - absentCount - lateCount);
        totalLogs = totalPupilSessions;
      }

      const totalRecorded = presentCount + absentCount + lateCount + excusedCount;
      const attendanceRate =
        totalRecorded > 0
          ? Math.round(((presentCount + lateCount * 0.8 + excusedCount) / totalRecorded) * 100)
          : 0;

      return {
        month: m.name,
        monthFull: m.fullName,
        Present: presentCount,
        Absent: absentCount,
        Late: lateCount,
        Excused: excusedCount,
        total: totalRecorded,
        rate: attendanceRate,
      };
    });
  }, [months, filteredStudents, selectedYear]);

  // Overall Year Aggregate Stats
  const yearlyStats = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;

    monthlyData.forEach((d) => {
      totalPresent += d.Present;
      totalAbsent += d.Absent;
      totalLate += d.Late;
      totalExcused += d.Excused;
    });

    const grandTotal = totalPresent + totalAbsent + totalLate + totalExcused;
    const avgYearRate =
      grandTotal > 0
        ? Math.round(((totalPresent + totalLate * 0.8 + totalExcused) / grandTotal) * 100)
        : 0;

    return { totalPresent, totalAbsent, totalLate, totalExcused, grandTotal, avgYearRate };
  }, [monthlyData]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-2 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold text-white">
            <span>
              {data.monthFull} {selectedYear}
            </span>
            <span className="text-cyan-400 font-mono">{data.rate}% Rate</span>
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present:
              </span>
              <strong className="font-mono">{data.Present.toLocaleString()}</strong>
            </div>

            <div className="flex justify-between items-center text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Absent:
              </span>
              <strong className="font-mono">{data.Absent.toLocaleString()}</strong>
            </div>

            <div className="flex justify-between items-center text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Late:
              </span>
              <strong className="font-mono">{data.Late.toLocaleString()}</strong>
            </div>

            <div className="flex justify-between items-center text-purple-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Excused:
              </span>
              <strong className="font-mono">{data.Excused.toLocaleString()}</strong>
            </div>

            <div className="border-t border-slate-800 pt-1 flex justify-between text-slate-400 font-semibold">
              <span>Total Logs:</span>
              <span className="font-mono text-white">{data.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-5 ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            {targetStudent ? <User className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {targetStudent ? `${targetStudent.name} — Monthly Attendance` : 'Monthly Attendance Patterns & Trends'}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {selectedYear}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {targetStudent
                ? `Grade ${targetStudent.gradeLevel} (${targetStudent.schoolTier}) • Individual Monthly Roll-Call Patterns`
                : 'Longitudinal pupil presence, seasonal absenteeism, and tier-specific participation bar chart.'}
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr} className="bg-slate-900 text-white">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Selector (only in full school mode) */}
          {!targetStudent && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['All', 'Nursery', 'Primary', 'Secondary'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedTier === tier
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          )}

          {/* Chart Mode */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartMode('stacked')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                chartMode === 'stacked'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stacked
            </button>
            <button
              onClick={() => setChartMode('grouped')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                chartMode === 'grouped'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grouped
            </button>
            <button
              onClick={() => setChartMode('rate')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                chartMode === 'rate'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rate %
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Attendance</span>
          <span className="text-lg font-black text-cyan-400 mt-0.5 block">{yearlyStats.avgYearRate}%</span>
          <span className="text-[10px] text-slate-500">
            {targetStudent ? 'Pupil Average' : `Across ${filteredStudents.length} pupils`}
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Present
          </span>
          <span className="text-lg font-black text-emerald-300 mt-0.5 block">
            {yearlyStats.totalPresent.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-500/80">Logged presence</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-rose-500/20">
          <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Absent
          </span>
          <span className="text-lg font-black text-rose-300 mt-0.5 block">
            {yearlyStats.totalAbsent.toLocaleString()}
          </span>
          <span className="text-[10px] text-rose-500/80">Unexcused</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Late
          </span>
          <span className="text-lg font-black text-amber-300 mt-0.5 block">
            {yearlyStats.totalLate.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-500/80">Delayed arrivals</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-purple-500/20">
          <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Excused
          </span>
          <span className="text-lg font-black text-purple-300 mt-0.5 block">
            {yearlyStats.totalExcused.toLocaleString()}
          </span>
          <span className="text-[10px] text-purple-500/80">Medical / clinic</span>
        </div>
      </div>

      {/* Main Recharts Visualizer */}
      <div className={`${compact ? 'h-64' : 'h-72'} w-full pt-1`}>
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'rate' ? (
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="rate"
                name="Monthly Attendance Rate (%)"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 4, fill: '#06b6d4' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <Bar
                dataKey="Present"
                name="Present"
                fill="#10b981"
                stackId={chartMode === 'stacked' ? 'a' : undefined}
                radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [3, 3, 0, 0]}
              />
              <Bar
                dataKey="Late"
                name="Late"
                fill="#f59e0b"
                stackId={chartMode === 'stacked' ? 'a' : undefined}
                radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [3, 3, 0, 0]}
              />
              <Bar
                dataKey="Excused"
                name="Excused"
                fill="#a855f7"
                stackId={chartMode === 'stacked' ? 'a' : undefined}
                radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [3, 3, 0, 0]}
              />
              <Bar
                dataKey="Absent"
                name="Absent"
                fill="#f43f5e"
                stackId={chartMode === 'stacked' ? 'a' : undefined}
                radius={chartMode === 'stacked' ? [3, 3, 0, 0] : [3, 3, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown Table Footer */}
      {!compact && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Monthly Attendance Statistical Matrix
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2 text-emerald-400">Present</th>
                  <th className="px-3 py-2 text-amber-400">Late</th>
                  <th className="px-3 py-2 text-purple-400">Excused</th>
                  <th className="px-3 py-2 text-rose-400">Absent</th>
                  <th className="px-3 py-2">Total Logs</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {monthlyData.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-800/50">
                    <td className="px-3 py-1.5 font-bold text-white">{row.monthFull}</td>
                    <td className="px-3 py-1.5 text-emerald-400 font-mono">{row.Present.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-amber-400 font-mono">{row.Late.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-purple-400 font-mono">{row.Excused.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-rose-400 font-mono">{row.Absent.toLocaleString()}</td>
                    <td className="px-3 py-1.5 font-mono text-slate-400">{row.total.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          row.rate >= 85
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : row.rate >= 70
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-rose-500/10 text-rose-300'
                        }`}
                      >
                        {row.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
