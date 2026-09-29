'use client';
import { useStore } from '@/store/useStore';
import { Play, Pause, RotateCcw, Shield, User, ChevronDown } from 'lucide-react';
import { loadDemoScenario } from '@/lib/demoData';
import { UserRole } from '@/types';
import { useState, useRef, useEffect } from 'react';

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: 'OPERATOR', label: 'Operator', desc: 'Can acknowledge, investigate, and perform manual override' },
  { id: 'FINOPS_ANALYST', label: 'FinOps Analyst', desc: 'Can tune thresholds, view analytics, and investigate unit costs' },
  { id: 'SERVICE_OWNER', label: 'Service Owner', desc: 'Can view owned anomalies, acknowledge, and approve rollbacks' },
  { id: 'ADMIN', label: 'Admin', desc: 'Full administrative access and settings configuration' }
];

export function Header() {
  const { isSimulating, setIsSimulating, currentRole, setCurrentRole } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    setIsSimulating(false);
    loadDemoScenario();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold text-white tracking-tight">
          Real-Time Cloud Spend Anomaly Detection & Response
        </h1>
        <span className="hidden lg:inline-flex items-center rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
          Live Ingestion Active
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Role Selector dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            <span>Role:</span>
            <span className="font-semibold text-white">
              {ROLES.find(r => r.id === currentRole)?.label || currentRole}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-slate-800 bg-slate-900 shadow-xl z-50 p-1 divide-y divide-slate-800">
              <div className="px-3 py-2 text-[10px] uppercase font-mono text-slate-400">
                Simulated Persona (RBAC)
              </div>
              <div className="py-1">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setCurrentRole(role.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded transition-colors ${
                      currentRole === role.id ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{role.label}</span>
                      {currentRole === role.id && <span className="text-[10px] text-indigo-400">Active</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{role.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center rounded-md border border-slate-800 bg-slate-900 p-1">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center rounded px-3 py-1 text-xs font-medium transition-colors ${
              isSimulating ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isSimulating ? <Pause className="mr-1.5 h-3.5 w-3.5" /> : <Play className="mr-1.5 h-3.5 w-3.5" />}
            {isSimulating ? 'Pause Stream' : 'Live Stream'}
          </button>
          <div className="mx-1 h-3.5 w-px bg-slate-700"></div>
          <button
            onClick={handleReset}
            className="flex items-center rounded px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            title="Reload Demo Scenario (Section 32)"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Demo
          </button>
        </div>
      </div>
    </header>
  );
}
