import React, { useState } from 'react';
import { SimulationItem, InteractiveSimulationItem } from '../../types';
import { KeyboardSimulator } from '../Simulations/KeyboardSimulator';
import { MouseSimulator } from '../Simulations/MouseSimulator';
import { FolderTreeSimulator } from '../Simulations/FolderTreeSimulator';
import { ScratchSimulator } from '../Simulations/ScratchSimulator';
import { Play, ExternalLink, Gamepad2, ArrowLeft, Sparkles, RefreshCw, Clock, CheckCircle2, Lock } from 'lucide-react';

interface Props {
  simulations?: SimulationItem[];
  interactiveSimulations?: InteractiveSimulationItem[];
  lessonTitle: string;
  materialsWatchSeconds?: number;
  requiredWatchSeconds?: number;
  hasMetWatchRequirement?: boolean;
  onAttemptCompleteLesson?: () => void;
  isCompleted?: boolean;
}

export const SectionSimulations: React.FC<Props> = ({
  simulations = [],
  interactiveSimulations = [],
  lessonTitle,
  materialsWatchSeconds = 0,
  requiredWatchSeconds = 180,
  hasMetWatchRequirement = false,
  onAttemptCompleteLesson,
  isCompleted = false,
}) => {
  // Combine all available simulations
  const combinedList = [
    ...interactiveSimulations.map((s) => ({
      id: s.id,
      title: s.title,
      type: 'external_iframe' as const,
      url: s.url,
      instructions: s.instructions || 'Nhấn để bắt đầu thực hành tương tác.',
      platform: s.platform || 'gemini_canvas',
    })),
    ...simulations,
  ];

  const [activeSimId, setActiveSimId] = useState<string>(() => {
    return combinedList.length > 0 ? combinedList[0].id : '';
  });

  const activeSim = combinedList.find((s) => s.id === activeSimId) || combinedList[0];

  const renderSimulationContent = (sim: typeof combinedList[0]) => {
    if (sim.type === 'built_in_keyboard') {
      return <KeyboardSimulator />;
    }
    if (sim.type === 'built_in_mouse') {
      return <MouseSimulator />;
    }
    if (sim.type === 'built_in_folders') {
      return <FolderTreeSimulator />;
    }
    if (sim.type === 'built_in_scratch') {
      return <ScratchSimulator />;
    }

    // External or Gemini Canvas Simulator
    if (sim.url) {
      return (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-emerald-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full mb-1 inline-block">
                MÔ PHỎNG BÀI HỌC TƯƠNG TÁC
              </span>
              <h3 className="text-xl font-black text-slate-800">{sim.title}</h3>
              {sim.instructions && (
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{sim.instructions}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a
                href={sim.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md transition hover:scale-103 cursor-pointer ring-2 ring-emerald-300"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở mô phỏng (Tab mới) 🚀</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 aspect-video w-full bg-slate-900 shadow-inner relative">
            <iframe
              src={sim.url}
              title={sim.title}
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between">
            <span>💡 <em>Nếu bài mô phỏng không tải được trong khung hình trên, hãy nhấn nút "Mở mô phỏng (Tab mới)".</em></span>
            <a
              href={sim.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-black hover:underline shrink-0 ml-2"
            >
              Mở ngay →
            </a>
          </div>
        </div>
      );
    }

    // Fallback if no URL
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-emerald-200 text-center">
        <Gamepad2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-xl font-black text-slate-800 mb-2">{sim.title}</h3>
        <p className="text-sm text-slate-600 font-semibold max-w-md mx-auto mb-6">
          {sim.instructions || 'Mô phỏng bài học tương tác dành cho học sinh.'}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md">
            🎮
          </div>
          <div>
            <span className="px-3 py-0.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider text-amber-200">
              PHẦN 4: MÔ PHỎNG BÀI HỌC TƯƠNG TÁC
            </span>
            <h3 className="text-2xl font-black mt-0.5">Thực Hành Trực Quan Sinh Động</h3>
          </div>
        </div>
      </div>

      {/* Simulation Selector Pills */}
      {combinedList.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {combinedList.map((sim, idx) => (
            <button
              key={sim.id}
              onClick={() => setActiveSimId(sim.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeSim?.id === sim.id
                  ? 'bg-emerald-600 text-white shadow-md scale-102 ring-2 ring-emerald-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🎯 Mô phỏng {idx + 1}:</span>
              <span className="truncate max-w-[220px]">{sim.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Render active simulation */}
      {activeSim && renderSimulationContent(activeSim)}
    </div>
  );
};
