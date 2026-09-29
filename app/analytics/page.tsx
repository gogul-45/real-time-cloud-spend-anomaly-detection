'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Filter, 
  Download, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function AnalyticsPage() {
  const { billingEvents, anomalies, resourceEvents } = useStore();
  const [mounted, setMounted] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter billing events
  const filteredBilling = billingEvents.filter(b => {
    if (serviceFilter !== 'ALL' && b.service !== serviceFilter) return false;
    return true;
  });

  const totalSpend = filteredBilling.reduce((acc, curr) => acc + curr.hourlyCost, 0);
  const baselineEstimate = filteredBilling.length * 72; // $72/hr baseline
  const anomalousSpend = Math.max(0, totalSpend - baselineEstimate);
  const avoidedExcess = 732.0;

  const filteredAnomalies = anomalies.filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  // Service breakdown
  const serviceMap: Record<string, number> = {};
  filteredBilling.forEach(b => {
    serviceMap[b.service] = (serviceMap[b.service] || 0) + b.hourlyCost;
  });
  const serviceData = Object.entries(serviceMap).map(([name, val]) => ({
    name,
    spend: Number(val.toFixed(2)),
    percentage: Number(((val / (totalSpend || 1)) * 100).toFixed(1))
  }));

  // Trend data
  const trendData = filteredBilling.slice(-24).map(b => ({
    time: new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actual: Number(b.hourlyCost.toFixed(2)),
    baseline: 72.0
  }));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Historical Spend & Anomaly Analytics</h1>
          <p className="mt-1 text-sm text-slate-400">
            Multi-dimensional spend attribution, detection performance metrics, and cost avoidance analytics.
          </p>
        </div>
        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
              totalSpend,
              anomalousSpend,
              avoidedExcess,
              serviceBreakdown: serviceData,
              anomaliesCount: filteredAnomalies.length
            }, null, 2));
            const dl = document.createElement('a');
            dl.setAttribute("href", dataStr);
            dl.setAttribute("download", "finops-analytics-export.json");
            dl.click();
          }}
          className="flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Service:</span>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white focus:outline-none"
          >
            <option value="ALL">All Cloud Services</option>
            <option value="GPU Compute">GPU Compute</option>
            <option value="Cloud CDN">Cloud CDN</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="WARNING">Warning Only</option>
          </select>
        </div>

        <div className="ml-auto text-slate-400">
          Showing <strong>{filteredBilling.length}</strong> events across 24h rolling window
        </div>
      </div>

      {/* Analytics KPI Row (Section 19) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Cloud Spend</span>
          <p className="text-base font-bold text-white font-mono mt-1">${totalSpend.toFixed(0)}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Anomalous Spend</span>
          <p className="text-base font-bold text-rose-400 font-mono mt-1">${anomalousSpend.toFixed(0)}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold">Avoided Excess</span>
          <p className="text-base font-bold text-emerald-400 font-mono mt-1">${avoidedExcess.toFixed(0)}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Anomalies</span>
          <p className="text-base font-bold text-white font-mono mt-1">{filteredAnomalies.length}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Critical Incidents</span>
          <p className="text-base font-bold text-red-400 font-mono mt-1">
            {filteredAnomalies.filter(a => a.severity === 'CRITICAL').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Detection</span>
          <p className="text-base font-bold text-emerald-400 font-mono mt-1">4.2s</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Notif Latency</span>
          <p className="text-base font-bold text-indigo-400 font-mono mt-1">11.5s</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Scaling Events</span>
          <p className="text-base font-bold text-amber-400 font-mono mt-1">{resourceEvents.length}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Hourly Spend vs Target Baseline</h3>
          <p className="text-xs text-slate-400 mb-4">Historical 24-hour trace showing stability followed by anomalous spike</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  formatter={(val: any) => [`$${val}/hr`]}
                />
                <Area type="monotone" dataKey="actual" stroke="#6366f1" fill="url(#spendGrad)" strokeWidth={2} name="Actual Spend" />
                <Area type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="4 4" fill="none" strokeWidth={2} name="Baseline Rate" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Distribution Pie (1 col) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Spend by Cloud Service</h3>
            <p className="text-xs text-slate-400 mt-0.5">Aggregate spend distribution across portfolio</p>
          </div>
          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  dataKey="spend"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={4}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  formatter={(val: any) => [`$${val}`, 'Spend']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 border-t border-slate-800 pt-3">
            {serviceData.map((item, idx) => (
              <div key={item.name} className="flex justify-between text-xs">
                <span className="flex items-center text-slate-300">
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                  {item.name}
                </span>
                <span className="font-mono text-white">${item.spend} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
