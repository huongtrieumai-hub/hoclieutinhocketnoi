import React, { useState } from 'react';
import { SimulationItem, InteractiveSimulationItem, MindMapImageItem } from '../../types';
import { SectionSimulations } from './SectionSimulations';
import { SectionMindMap } from './SectionMindMap';
import { Gamepad2, Brain, Sparkles } from 'lucide-react';

interface Props {
  simulations?: SimulationItem[];
  interactiveSimulations?: InteractiveSimulationItem[];
  lessonTitle: string;
  materialsWatchSeconds?: number;
  requiredWatchSeconds?: number;
  hasMetWatchRequirement?: boolean;
  onAttemptCompleteLesson?: () => void;
  isCompleted?: boolean;
  mindMapData?: {
    rootTitle?: string;
    rootSubtitle?: string;
    externalMindMapUrl?: string;
    externalMindMapTitle?: string;
    allowEmbed?: boolean;
    branches?: any[];
  };
  mindMapImages?: MindMapImageItem[];
}

export const SectionSimulationsAndMindMap: React.FC<Props> = ({
  simulations = [],
  interactiveSimulations = [],
  lessonTitle,
  materialsWatchSeconds = 0,
  requiredWatchSeconds = 180,
  hasMetWatchRequirement = false,
  onAttemptCompleteLesson,
  isCompleted = false,
  mindMapData,
  mindMapImages = [],
}) => {
  const [activeTab, setActiveTab] = useState<'mindmap' | 'simulation'>('mindmap');

  const totalSimCount = simulations.length + interactiveSimulations.length;
  const totalMindMapCount = (mindMapImages?.length || 0) + (mindMapData?.externalMindMapUrl ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header Banner - Merged Feature */}
      <div className="p-6 bg-gradient-to-r from-purple-600 via-teal-600 to-emerald-600 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md">
            {activeTab === 'mindmap' ? '🌳' : '🎮'}
          </div>
          <div>
            <span className="px-3 py-0.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider text-amber-200">
              PHẦN 3: SƠ ĐỒ TƯ DUY &amp; MÔ PHỎNG TƯƠNG TÁC
            </span>
            <h3 className="text-2xl font-black mt-0.5">Hệ Thống Kiến Thức &amp; Thực Hành Sinh Động</h3>
          </div>
        </div>

        {/* Toggle Switcher */}
        <div className="flex items-center bg-black/20 p-1.5 rounded-2xl backdrop-blur-sm border border-white/20">
          <button
            type="button"
            onClick={() => setActiveTab('mindmap')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'mindmap'
                ? 'bg-white text-purple-900 shadow-md scale-102'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Brain className="w-4 h-4 text-purple-600" />
            <span>Sơ Đồ Tư Duy</span>
            {totalMindMapCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'mindmap' ? 'bg-purple-100 text-purple-800' : 'bg-white/20 text-white'
              }`}>
                {totalMindMapCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-white text-emerald-900 shadow-md scale-102'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-600" />
            <span>Mô Phỏng Tương Tác</span>
            {totalSimCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'simulation' ? 'bg-emerald-100 text-emerald-800' : 'bg-white/20 text-white'
              }`}>
                {totalSimCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {activeTab === 'mindmap' ? (
        <SectionMindMap
          data={mindMapData}
          mindMapImages={mindMapImages}
        />
      ) : (
        <SectionSimulations
          simulations={simulations}
          interactiveSimulations={interactiveSimulations}
          lessonTitle={lessonTitle}
          materialsWatchSeconds={materialsWatchSeconds}
          requiredWatchSeconds={requiredWatchSeconds}
          hasMetWatchRequirement={hasMetWatchRequirement}
          onAttemptCompleteLesson={onAttemptCompleteLesson}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
};
