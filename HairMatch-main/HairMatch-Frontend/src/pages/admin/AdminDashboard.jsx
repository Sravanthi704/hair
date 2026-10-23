import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Mini bar chart (pure CSS/SVG) ──────────────────────────────────────────
function BarChart({ data, color = '#7c3aed' }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-16 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div
            className="w-full rounded-sm transition-all duration-300"
            style={{
              height: `${Math.max((d.count / max) * 100, 4)}%`,
              background: color,
              opacity: d.count === 0 ? 0.2 : 0.85,
            }}
          />
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-dark-600 border border-dark-400 rounded-lg px-2 py-1 text-xs text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
            {d.date?.slice(5)}: {d.count}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart (SVG) ──────────────────────────────────────────────────────
function DonutChart({ data, colors }) {
  if (!data?.length) return null;
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <p className="text-slate-500 text-sm text-center py-4">No data yet</p>;

  const r = 40, cx = 50, cy = 50;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 flex-shrink-0 -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a3a" strokeWidth="18" />
        {data.map((d, i) => {
          const pct = d.count / total;
          const dash = pct * circumference;
          const gap  = circumference - dash;
          const el = (
            <circle
              key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="space-y-1.5 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
              <span className="text-slate-300 capitalize">{d._id || d.label}</span>
            </div>
            <span className="text-slate-400 font-semibold">
              {d.count} <span className="text-slate-600">({Math.round((d.count / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'brand' }) {
  const colors = {
    brand:   'from-brand-600/20 to-brand-600/5 border-brand-500/20 text-brand-400',
    purple:  'from-purple-600/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    yellow:  'from-yellow-600/20 to-yellow-600/5 border-yellow-500/20 text-yellow-400',
    sky:     'from-sky-600/20 to-sky-600/5 border-sky-500/20 text-sky-400',
    rose:    'from-rose-600/20 to-rose-600/5 border-rose-500/20 text-rose-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <p className="text-slate-400 text-xs font-medium mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[color].split(' ').pop()}`}>{value ?? '—'}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

const SHAPE_COLORS = ['#7c3aed','#8b5cf6','#a78bfa','#c4b5fd','#6d28d9','#5b21b6'];
const GENDER_COLORS = ['#7c3aed','#ec4899'];

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [daily, setDaily]       = useState([]);
  const [shapes, setShapes]     = useState([]);
  const [gender, setGender]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [chartDays, setChartDays] = useState(30);

  const load = async (days = 30) => {
    setLoading(true);
    try {
      const [s, d, sh, g] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/analytics/daily?days=${days}`),
        api.get('/admin/analytics/face-shapes'),
        api.get('/admin/analytics/gender'),
      ]);
      setStats(s.data.data);
      setDaily(d.data.data);
      setShapes(sh.data.data);
      setGender([
        { _id: 'Men',   label: 'Men',   count: g.data.data.men },
        { _id: 'Women', label: 'Women', count: g.data.data.women },
      ]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(chartDays); }, [chartDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of HairMatch platform activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"       value={stats?.totalUsers}      sub={`+${stats?.newUsersLast7} this week`}    color="brand"   />
        <StatCard label="Total Analyses"    value={stats?.totalAnalyses}   sub={`${stats?.analysesToday} today`}         color="purple"  />
        <StatCard label="Last 7 Days"       value={stats?.analysesLast7}   sub="analyses"                                color="emerald" />
        <StatCard label="Hairstyles"        value={stats?.totalHairstyles} sub="in database"                             color="yellow"  />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Daily analyses chart */}
        <div className="lg:col-span-2 bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-100">Analyses Over Time</h3>
              <p className="text-slate-500 text-xs mt-0.5">Daily analysis count</p>
            </div>
            <div className="flex gap-1 bg-dark-700 border border-dark-500 rounded-lg p-1">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    chartDays === d ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <BarChart data={daily} color="#7c3aed" />
          <div className="flex justify-between text-xs text-slate-600 mt-2">
            <span>{daily[0]?.date?.slice(5)}</span>
            <span>{daily[daily.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>

        {/* Face shape distribution */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-100 mb-1">Face Shapes</h3>
          <p className="text-slate-500 text-xs mb-5">Distribution across all analyses</p>
          <DonutChart data={shapes} colors={SHAPE_COLORS} />
        </div>
      </div>

      {/* Gender + recent row */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Gender split */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-100 mb-1">Gender Split</h3>
          <p className="text-slate-500 text-xs mb-5">Recommendations requested</p>
          <DonutChart data={gender} colors={GENDER_COLORS} />
        </div>

        {/* Quick stats */}
        <div className="lg:col-span-2 bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-100 mb-5">Platform Summary</h3>
          <div className="space-y-4">
            {[
              { label: 'Avg analyses per user', value: stats?.totalUsers ? (stats.totalAnalyses / stats.totalUsers).toFixed(1) : '0' },
              { label: 'Analyses last 30 days',  value: stats?.analysesLast30 },
              { label: 'New users this week',    value: stats?.newUsersLast7 },
              { label: 'Analyses today',         value: stats?.analysesToday },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
                <span className="text-slate-400 text-sm">{item.label}</span>
                <span className="text-slate-100 font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
