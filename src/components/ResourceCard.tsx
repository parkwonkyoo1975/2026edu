import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Folder, 
  Globe, 
  Bookmark, 
  ExternalLink, 
  Copy, 
  Check, 
  Maximize2, 
  BookMarked,
  Sparkles,
  LayoutGrid,
  Video,
  Play
} from 'lucide-react';
import { EducationalResource, ResourceType } from '../types/education';

interface ResourceCardProps {
  resource: EducationalResource;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onOpenPreview: (resource: EducationalResource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isBookmarked,
  onToggleBookmark,
  onOpenPreview,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(resource.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeBadge = (type: ResourceType) => {
    if (resource.category === '소개 영상' || resource.id === 'intro-video') {
      return {
        label: '공식 소개 영상',
        bg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
        icon: <Video className="w-3.5 h-3.5 text-rose-400" />,
      };
    }
    switch (type) {
      case 'video':
        return {
          label: '소개 영상 아카이브',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
          icon: <Video className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'google-form':
        return {
          label: 'Google 설문지',
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          icon: <FileText className="w-3.5 h-3.5 text-purple-400" />,
        };
      case 'google-sheet':
        return {
          label: 'Google 스프레드시트',
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          icon: <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'google-doc':
        return {
          label: 'Google 문서',
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          icon: <FileText className="w-3.5 h-3.5 text-blue-400" />,
        };
      case 'google-drive':
        return {
          label: 'Google 드라이브',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          icon: <Folder className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'webapp':
        return {
          label: '인터랙티브 웹앱',
          bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
          icon: <Globe className="w-3.5 h-3.5 text-sky-400" />,
        };
      case 'padlet':
        return {
          label: '패들렛 협업보드',
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          icon: <LayoutGrid className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'notebook':
        return {
          label: 'Gemini NotebookLM',
          bg: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
          icon: <Sparkles className="w-3.5 h-3.5 text-violet-400" />,
        };
      default:
        return {
          label: '자료 링크',
          bg: 'bg-slate-700 text-slate-300 border-slate-600',
          icon: <ExternalLink className="w-3.5 h-3.5" />,
        };
    }
  };

  const typeInfo = getTypeBadge(resource.type);

  const isVideoResource = resource.type === 'video' || resource.category === '소개 영상';

  return (
    <div className={`group rounded-xl border shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden ${
      isVideoResource
        ? 'bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border-rose-500/70 hover:border-rose-400 shadow-rose-950/40 ring-1 ring-rose-500/30'
        : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
    }`}>
      {/* Card Header & Badges */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Type Badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${typeInfo.bg}`}>
            {typeInfo.icon}
            <span>{typeInfo.label}</span>
          </div>

          {/* Action Icons: Bookmark & Copy Link */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              title={copied ? '복사 완료!' : 'URL 복사하기'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(resource.id);
              }}
              title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-700/80 transition-colors cursor-pointer"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {resource.badge && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                isVideoResource 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-slate-700 text-sky-300 border-slate-600'
              }`}>
                {resource.badge}
              </span>
            )}
            {resource.category && (
              <span className="text-[11px] font-semibold text-slate-400">
                {resource.category} {resource.subCategory ? `· ${resource.subCategory}` : ''}
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
            {resource.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>
      </div>

      {/* Card Footer: Launch / Preview */}
      <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-700/60 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 font-medium truncate">
          {resource.grade ? `대상: ${resource.grade}` : resource.target ? `대상: ${resource.target}` : '2026 교육'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenPreview(resource)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="앱 내에서 미리보기 / 정보 보기"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">미리보기</span>
          </button>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer ${
              isVideoResource 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' 
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {isVideoResource ? (
              <>
                <Play className="w-3 h-3 fill-white text-white" />
                <span>영상 재생</span>
              </>
            ) : (
              <>
                <span>열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </>
            )}
          </a>
        </div>
      </div>
    </div>
  );
};
