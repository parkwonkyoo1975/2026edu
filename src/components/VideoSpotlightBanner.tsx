import React from 'react';
import { Play, Video, ExternalLink, Sparkles, Film, Clapperboard } from 'lucide-react';
import { INTRO_VIDEO_RESOURCE } from '../data/educationData';

interface VideoSpotlightBannerProps {
  onOpenVideoModal: () => void;
}

export const VideoSpotlightBanner: React.FC<VideoSpotlightBannerProps> = ({
  onOpenVideoModal,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/60 to-indigo-950/80 border border-rose-500/30 p-5 sm:p-6 shadow-2xl">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -top-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Left: Video Info & Badges */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              <span>공식 하이라이트</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              <Clapperboard className="w-3 h-3 text-rose-400" />
              <span>Google Drive 고화질 영상</span>
            </span>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>2026 교육 사업 종합 소개 영상</span>
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            AI·디지털 선도학교, 융합 STEAM 클럽, 사회정서학습, 독서·토론 및 교원학습공동체의 생생한 수업 실천 모습과 학생들의 성장 기록이 담긴 공식 영상 아카이브입니다.
          </p>

          <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-rose-200 border border-slate-700">
              #수업현장스케치
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-rose-200 border border-slate-700">
              #학생인터뷰
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-rose-200 border border-slate-700">
              #5대사업총결산
            </span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={onOpenVideoModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
            </div>
            <span>소개 영상 안내 보기</span>
          </button>

          <a
            href={INTRO_VIDEO_RESOURCE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            title="Google Drive 영상 폴더 바로가기"
          >
            <span>드라이브 바로 열기</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
