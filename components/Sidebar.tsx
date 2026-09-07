'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Activity, 
  FlaskConical, 
  ShieldAlert, 
  FileText, 
  Network, 
  Server, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Anomalies', href: '/anomalies', icon: AlertTriangle },
  { name: 'Event Stream', href: '/event-stream', icon: Activity },
  { name: 'Experiments', href: '/experiments', icon: FlaskConical },
  { name: 'Failure Tests', href: '/failure-tests', icon: ShieldAlert },
  { name: 'Audit Trail', href: '/audit', icon: FileText },
  { name: 'Workflow', href: '/workflow', icon: Network },
  { name: 'Architecture', href: '/architecture', icon: Server },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <AlertTriangle className="mr-3 h-6 w-6 text-indigo-500" />
        <span className="text-lg font-bold text-white tracking-tight">FinOps Sentinel</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
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
        <div className="rounded-md bg-slate-900 p-3">
          <p className="text-xs text-slate-400">Project Milestone</p>
          <p className="text-sm font-semibold text-white">35% Prototype</p>
        </div>
      </div>
    </div>
  );
}
