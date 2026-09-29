'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Sliders, 
  BarChart3, 
  Activity, 
  FlaskConical, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  FileText, 
  Gauge, 
  TestTube2, 
  Network, 
  Server, 
  Lock, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Anomalies', href: '/anomalies', icon: AlertTriangle },
  { name: 'What-If Analysis', href: '/what-if', icon: Sliders },
  { name: 'Historical Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Event Stream & Replay', href: '/event-stream', icon: Activity },
  { name: 'Model Experiments', href: '/experiments', icon: FlaskConical },
  { name: 'Failure Test Center', href: '/failure-tests', icon: ShieldAlert },
  { name: 'Data Quality', href: '/data-quality', icon: CheckCircle2 },
  { name: 'Stakeholder Validation', href: '/validation', icon: Users },
  { name: 'Audit Trail', href: '/audit', icon: FileText },
  { name: 'Performance Benchmark', href: '/performance', icon: Gauge },
  { name: 'Automated Tests', href: '/tests', icon: TestTube2 },
  { name: 'Workflow', href: '/workflow', icon: Network },
  { name: 'Architecture', href: '/architecture', icon: Server },
  { name: 'Security & Governance', href: '/security', icon: Lock },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <AlertTriangle className="mr-3 h-6 w-6 text-indigo-500" />
        <div>
          <span className="text-base font-bold text-white tracking-tight">FinOps Sentinel</span>
          <span className="block text-[10px] uppercase font-mono text-indigo-400">Real-Time Anomaly Engine</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-4 w-4 flex-shrink-0",
                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-800 p-4">
        <div className="rounded-md bg-slate-900 p-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Project Milestone</span>
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300">v0.7.0</span>
          </div>
          <p className="text-sm font-semibold text-emerald-400 mt-1 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            70% Complete
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[70%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
