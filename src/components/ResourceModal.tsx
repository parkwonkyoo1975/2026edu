import React, { useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  Globe, 
  Info, 
  FolderKanban,
  AlertCircle
} from 'lucide-react';
import { EducationalResource } from '../types/education';

interface ResourceModalProps {
  resource: EducationalResource | null;
  onClose: () => void;
}

export const ResourceModal: React.FC<ResourceModalProps> = ({ resource, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!resource) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(resource.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Many webapps (e.g. GitHub Pages or Google Forms in embed mode) can be framed;
  // Google Drive folders or docs frequently send X-Frame-Options: SAMEORIGIN.
  const isEmbeddable = resource.type === 'webapp' || resource.url.includes('github.io');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {resource.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span>{resource.category}</span>
                {resource.subCategory && <span>· {resource.subCategory}</span>}
                {resource.grade && <span>· {resource.grade}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="링크 복사"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
            >
              <span>새 탭에서 열기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-sm leading-relaxed">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              자료 설명 및 활용 안내
            </h4>
            <p>{resource.description}</p>
          </div>

          {/* Embedded WebApp / Preview Frame */}
          {isEmbeddable ? (
            <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-700 bg-white">
              <iframe
                src={resource.url}
                title={resource.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-850 border border-slate-700/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-white">Google 보안 정책 안내</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Google Drive, Sheets, Docs 및 Forms는 보안 정책(X-Frame-Options)에 따라 외부 아이프레임 직접 삽입이 제한될 수 있습니다. 아래 버튼을 통해 공식 Google Workspace 환경에서 바로 안전하게 열람하실 수 있습니다.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <span>Google 서비스에서 직접 열기</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
