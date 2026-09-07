'use client';
import { useStore } from '@/store/useStore';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { loadDemoScenario } from '@/lib/demoData';

export function Header() {
  const { isSimulating, setIsSimulating, resetState } = useStore();

  const handleReset = () => {
    setIsSimulating(false);
    loadDemoScenario();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-white">Real-Time Cloud Spend Anomaly Detection</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center rounded-md border border-slate-800 bg-slate-900 p-1">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center rounded px-3 py-1.5 text-sm font-medium transition-colors ${isSimulating ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            {isSimulating ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isSimulating ? 'Pause Simulation' : 'Start Simulation'}
          </button>
          <div className="mx-1 h-4 w-px bg-slate-700"></div>
          <button
            onClick={handleReset}
            className="flex items-center rounded px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
