import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  Users,
  GraduationCap,
  Sparkles,
  Calendar,
  Layers,
  UserCheck,
  Award,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { EnrollmentDataPoint } from '../types';
import { ENROLLMENT_TRENDS_12_MONTHS } from '../data/mockData';

type ViewMode = 'overall' | 'division' | 'gender' | 'intake';
type TimeRange = 'all' | '6m' | 'term1';

interface EnrollmentTrendChartProps {
  data?: EnrollmentDataPoint[];
  onNavigateToSchool?: () => void;
}

export const EnrollmentTrendChart: React.FC<EnrollmentTrendChartProps> = ({
  data = ENROLLMENT_TRENDS_12_MONTHS,
  onNavigateToSchool,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overall');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [hoveredPoint, setHoveredPoint] = useState<EnrollmentDataPoint | null>(null);

  // Default empty 12-month baseline if dataset is empty
  const effectiveData: EnrollmentDataPoint[] = useMemo(() => {
    if (data && data.length > 0) return data;
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    return months.map((m) => ({
      month: m,
      total: 0,
      nursery: 0,
      primarySchool: 0,
      jssStem: 0,
      girls: 0,
      boys: 0,
      newAdmissions: 0,
      attendanceRate: 0,
    }));
  }, [data]);

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (timeRange === '6m') {
      return effectiveData.slice(-6);
    }
    if (timeRange === 'term1') {
      return effectiveData.slice(0, 6);
    }
    return effectiveData;
  }, [effectiveData, timeRange]);

  // Derived calculations safely
  const latestMonth = effectiveData[effectiveData.length - 1] || { total: 0, girls: 0 };
  const startMonth = effectiveData[0] || { total: 0, girls: 0 };
  const totalGrowthPercent = startMonth.total > 0
    ? (((latestMonth.total - startMonth.total) / startMonth.total) * 100).toFixed(1)
    : '0.0';
  const totalIntake = effectiveData.reduce((acc, curr) => acc + curr.newAdmissions, 0);
  const averageAttendance = effectiveData.length > 0
    ? (effectiveData.reduce((acc, curr) => acc + curr.attendanceRate, 0) / effectiveData.length).toFixed(1)
    : '0.0';
  const girlsPercentage = latestMonth.total > 0
    ? ((latestMonth.girls / latestMonth.total) * 100).toFixed(1)
    : '0.0';

  // Custom Tooltip component for dark aesthetic
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pointData = payload[0].payload as EnrollmentDataPoint;
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white text-sm">{pointData.month}</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
              {pointData.attendanceRate}% Attendance
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Total Enrolled:
              </span>
              <span className="font-bold text-white text-sm">{pointData.total}</span>
            </div>

            {viewMode === 'division' && (
              <>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Primary School:
                  </span>
                  <span className="font-semibold text-white">{pointData.primarySchool}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    JSS STEM Track:
                  </span>
                  <span className="font-semibold text-white">{pointData.jssStem}</span>
                </div>
              </>
            )}

            {viewMode === 'gender' && (
              <>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-pink-400">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    Girls (STEM & Sports):
                  </span>
                  <span className="font-semibold text-white">{pointData.girls}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Boys:
                  </span>
                  <span className="font-semibold text-white">{pointData.boys}</span>
                </div>
              </>
            )}

            {viewMode === 'intake' && (
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  New Admissions:
                </span>
                <span className="font-semibold text-amber-300">+{pointData.newAdmissions} students</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                12-Month Student Enrollment & Retention Trends
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                  +{totalGrowthPercent}% YoY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Continuous child enrollment, STEM laboratory participation, and gender equity across Bo District
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Range Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeRange === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              12 Months
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeRange === '6m'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 6M
            </button>
            <button
              onClick={() => setTimeRange('term1')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeRange === 'term1'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Term 1
            </button>
          </div>

          {/* View Mode selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <button
              onClick={() => setViewMode('overall')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'overall'
                  ? 'bg-slate-700 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overall Growth
            </button>
            <button
              onClick={() => setViewMode('division')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'division'
                  ? 'bg-slate-700 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Primary vs JSS STEM
            </button>
            <button
              onClick={() => setViewMode('gender')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'gender'
                  ? 'bg-slate-700 text-pink-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gender Equity
            </button>
            <button
              onClick={() => setViewMode('intake')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'intake'
                  ? 'bg-slate-700 text-amber-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admissions
            </button>
          </div>
        </div>
      </div>

      {/* Metric Mini-Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            Current Enrolled
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white">{latestMonth.total}</span>
            <span className="text-[11px] text-emerald-400 font-semibold">+{latestMonth.total - startMonth.total} in 12m</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Avg. Attendance
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white">{averageAttendance}%</span>
            <span className="text-[11px] text-cyan-400 font-semibold">Consistently High</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-pink-400" />
            Female Scholars
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white">{girlsPercentage}%</span>
            <span className="text-[11px] text-pink-400 font-semibold">{latestMonth.girls} Girls</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            12M New Intakes
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white">+{totalIntake}</span>
            <span className="text-[11px] text-amber-400 font-semibold">Children Enrolled</span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'overall' ? (
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalEnrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis
                dataKey="shortMonth"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                domain={['dataMin - 15', 'dataMax + 10']}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={400} stroke="#059669" strokeDasharray="3 3" opacity={0.6} label={{ value: 'Target: 400+', fill: '#34d399', fontSize: 10, position: 'insideTopLeft' }} />
              <Area
                type="monotone"
                dataKey="total"
                name="Total Enrolled Students"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#totalEnrollmentGrad)"
                activeDot={{ r: 6, fill: '#34d399', stroke: '#064e3b', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : viewMode === 'division' ? (
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="jssGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis
                dataKey="shortMonth"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
              <Area
                type="monotone"
                dataKey="primarySchool"
                name="Primary School (Classes 1-6)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#primaryGrad)"
              />
              <Area
                type="monotone"
                dataKey="jssStem"
                name="Junior Secondary (STEM Track)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#jssGrad)"
              />
            </AreaChart>
          ) : viewMode === 'gender' ? (
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="girlsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="boysGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis
                dataKey="shortMonth"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
              <Area
                type="monotone"
                dataKey="girls"
                name="Female Scholars (STEM & Sports)"
                stroke="#f472b6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#girlsGrad)"
              />
              <Area
                type="monotone"
                dataKey="boys"
                name="Male Scholars"
                stroke="#60a5fa"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#boysGrad)"
              />
            </AreaChart>
          ) : (
            <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis
                dataKey="shortMonth"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[90, 100]}
                stroke="#34d399"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
              <Bar
                yAxisId="left"
                dataKey="newAdmissions"
                name="New Monthly Admissions"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="attendanceRate"
                name="Attendance Rate (%)"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Qualitative Insight Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Key Milestone:</strong> September 2025 intake expanded with the new Science & Math Teaching Laboratory, boosting secondary STEM retention by 16.2%.
          </span>
        </div>

        {onNavigateToSchool && (
          <button
            onClick={onNavigateToSchool}
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
          >
            Manage Student Records <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
