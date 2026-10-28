import React from 'react';
import { 
  Cpu, 
  Sparkles, 
  HeartHandshake, 
  BookOpen, 
  Users, 
  FolderKanban, 
  FileText, 
  Table, 
  Globe,
  Video,
  Play
} from 'lucide-react';
import { EducationProject } from '../types/education';

interface StatsBannerProps {
  projects: EducationProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  totalResources: number;
  onOpenIntroVideo?: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  totalResources,
  onOpenIntroVideo,
}) => {
  const getProjectIcon = (name: string) => {
    switch (name) {
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      default:
        return <FolderKanban className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top Header & Tagline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-2">
              <span>2026학년도 미래역량 함양 프로젝트</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              5대 주요 교육 사업 아카이브
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              AI·디지털 선도학교, 융합 STEAM 클럽, 사회정서학습(SEL), 독서·토론 기반 프로젝트, 학교 간 교원학습공동체의 모든 연구와 수업 자료를 체계적으로 탐색하세요.
            </p>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <FolderKanban className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-medium">총 교육자료</div>
                <div className="text-sm font-bold text-white">{totalResources}건</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <Table className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-medium">구글 시트/폼</div>
                <div className="text-sm font-bold text-white">60+건</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <Globe className="w-4 h-4 text-purple-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-medium">웹앱 및 플랫폼</div>
                <div className="text-sm font-bold text-white">24개</div>
              </div>
            </div>

            {/* Video Spotlight Metric Button */}
            {onOpenIntroVideo && (
              <button
                onClick={onOpenIntroVideo}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-950/80 to-pink-950/50 border border-rose-500/60 hover:border-rose-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-sm shadow-rose-950/40"
                title="2026 교육 사업 공식 소개 영상 시청"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all shadow-inner">
                  <Video className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-rose-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    <span>공식 소개 영상</span>
                  </div>
                  <div className="text-xs font-black text-white group-hover:text-rose-200 flex items-center gap-1">
                    <span>HD 영상 보기</span>
                    <Play className="w-3 h-3 fill-rose-400 text-rose-400 group-hover:fill-white group-hover:text-white" />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* 5 Project Navigation Tabs / Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          {/* All tab */}
          <button
            onClick={() => onSelectProject('all')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeProjectId === 'all'
                ? 'bg-gradient-to-br from-blue-900/60 to-indigo-950/80 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">ALL</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 font-medium">
                {totalResources}
              </span>
            </div>
            <div className="font-bold text-sm text-white truncate">전체 모아보기</div>
            <div className="text-[11px] text-slate-400 mt-0.5">5대 사업 통합</div>
          </button>

          {/* Individual Projects */}
          {projects.map((proj) => {
            const isSelected = activeProjectId === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-850 border-sky-400 shadow-lg ring-1 ring-sky-400/40'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600'
                }`}
                style={{
                  borderLeftColor: proj.color,
                  borderLeftWidth: isSelected ? '4px' : '3px',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: proj.color }}
                  >
                    {getProjectIcon(proj.iconName)}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 font-medium">
                    {proj.stats.resourceCount}건
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm text-white truncate">
                  {proj.shortTitle}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {proj.highlightTags[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
