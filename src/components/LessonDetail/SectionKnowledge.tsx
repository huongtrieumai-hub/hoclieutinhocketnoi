import React from 'react';
import { KnowledgeCard } from '../../types';
import { FileText, Video, Laptop } from 'lucide-react';
import { splitSentencesToLines } from '../../utils/textFormatter';

interface Props {
  cards: KnowledgeCard[];
  objectives?: string[];
}

export const SectionKnowledge: React.FC<Props> = ({ cards, objectives }) => {
  return (
    <div className="space-y-6">
      {/* Header - Synced with Laptop Icon & Vibrant Blue-Cyan Palette */}
      <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-3xl text-white shadow-xl flex items-center justify-between border border-cyan-400/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md border border-white/30 text-white">
            <Laptop className="w-9 h-9 text-white filter drop-shadow-md" />
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider border border-white/30">
              MỤC TIÊU &amp; KIẾN THỨC TRỌNG TÂM
            </span>
            <h3 className="text-2xl font-black mt-1">Kiến Thức Trọng Tâm Bài Học</h3>
          </div>
        </div>
      </div>

      {/* Objectives Banner if present */}
      {objectives && objectives.length > 0 && (
        <div className="bg-amber-50/80 border-2 border-amber-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center text-sm font-black shadow-xs">
              🎯
            </span>
            <h4 className="text-base font-black text-amber-950">Mục Tiêu Bài Học</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/90 p-3 rounded-2xl border border-amber-100 shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-xs font-bold text-slate-800 leading-relaxed">{obj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards List */}
      <div className="grid grid-cols-1 gap-6">
        {cards.map((card, idx) => (
          <div
            key={card.id || idx}
            className="bg-white rounded-3xl border-3 border-blue-100 hover:border-blue-300 shadow-md hover:shadow-xl transition-all overflow-hidden"
          >
            <div className="p-6 md:p-8">
              {/* Card Title */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <span className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center shadow-xs">
                  {idx + 1}
                </span>
                <h4 className="text-xl font-black text-slate-800">{card.title}</h4>
              </div>

              {/* Knowledge Details & Image grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
                <div className={card.imageUrl ? 'md:col-span-7' : 'md:col-span-12'}>
                  <div className="space-y-3 text-base text-slate-800 font-bold leading-relaxed">
                    {splitSentencesToLines(card.details || card.summary).map((line, lineIdx) => {
                      const isBullet = line.startsWith('-') || line.startsWith('•');
                      return (
                        <p
                          key={lineIdx}
                          className={`leading-relaxed ${
                            isBullet
                              ? 'text-slate-800 font-bold pl-1.5'
                              : 'text-slate-700 font-bold'
                          }`}
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {card.imageUrl && (
                  <div className="md:col-span-5">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-48 md:h-56 object-cover rounded-2xl border-2 border-slate-100 shadow-md hover:scale-103 transition-transform"
                    />
                  </div>
                )}
              </div>


              {/* Attachments if any (PDF, Video link) */}
              {(card.pdfUrl || card.videoUrl) && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                  {card.pdfUrl && (
                    <a
                      href={card.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition"
                    >
                      <FileText className="w-4 h-4" /> Xem tài liệu PDF đính kèm
                    </a>
                  )}
                  {card.videoUrl && (
                    <a
                      href={card.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition"
                    >
                      <Video className="w-4 h-4" /> Xem video học liệu
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
