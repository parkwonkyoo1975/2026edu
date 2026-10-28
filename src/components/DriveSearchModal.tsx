import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  X, 
  Search, 
  FolderSearch, 
  Folder, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Copy,
  Check,
  Calendar,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';
import { searchGoogleDrive, DriveFileItem } from '../services/driveService';
import { getAccessToken, googleSignIn } from '../services/googleAuth';

interface DriveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignInSuccess: (user: User, token: string) => void;
}

const PRESET_TAGS = [
  '2026',
  '선도학교',
  'STEAM',
  '사회정서',
  '독서토론',
  '오늘의 뉴스',
  '글쓰기',
  '분수',
  '골든벨',
  '퀴즈',
];

export const DriveSearchModal: React.FC<DriveSearchModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignInSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('2026');
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (termToSearch?: string) => {
    const q = termToSearch !== undefined ? termToSearch : searchTerm;
    setError(null);
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError('Google 드라이브 접근 권한이 필요합니다. 먼저 Google 계정으로 로그인해 주세요.');
        setIsLoading(false);
        return;
      }

      const result = await searchGoogleDrive(token, q.trim());
      setFiles(result.files);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '드라이브 검색 중 오류가 발생했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Run search when modal opens if signed in
  useEffect(() => {
    if (isOpen && user) {
      handleSearch();
    }
  }, [isOpen, user]);

  const handleLoginAndSearch = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onSignInSuccess(res.user, res.accessToken);
        const result = await searchGoogleDrive(res.accessToken, searchTerm.trim());
        setFiles(result.files);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.';
      setError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCopyLink = (file: DriveFileItem) => {
    const url = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMimeIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) {
      return <Folder className="w-5 h-5 text-amber-400" />;
    }
    if (mimeType.includes('spreadsheet')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-400" />;
    }
    if (mimeType.includes('presentation')) {
      return <FileText className="w-5 h-5 text-amber-500" />;
    }
    if (mimeType.includes('form')) {
      return <FileText className="w-5 h-5 text-purple-400" />;
    }
    return <FileCode className="w-5 h-5 text-slate-400" />;
  };

  const getCleanMimeName = (mimeType: string) => {
    if (mimeType.includes('folder')) return '폴더';
    if (mimeType.includes('spreadsheet')) return '스프레드시트';
    if (mimeType.includes('document')) return '구글 문서';
    if (mimeType.includes('presentation')) return '프레젠테이션';
    if (mimeType.includes('form')) return '구글 폼';
    if (mimeType.includes('pdf')) return 'PDF 문서';
    return '파일';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <FolderSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Google 드라이브 실시간 검색</span>
                {user && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    연동됨
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                선생님의 구글 드라이브 계정에서 2026 교육 관련 자료를 검색합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!user ? (
            /* Auth Required Card */
            <div className="p-8 rounded-2xl bg-slate-850 border border-slate-700/80 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <FolderSearch className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-white">Google 계정 연결 필요</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  내 Google 드라이브에서 2026 교육 자료를 실시간으로 검색하고 열람하려면, 사용자의 허가를 받아 Google Workspace 권한을 연동해야 합니다.
                </p>
              </div>

              <div>
                <button
                  onClick={handleLoginAndSearch}
                  disabled={isSigningIn}
                  className="gsi-material-button inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>Google 계정으로 로그인하여 드라이브 검색</span>
                </button>
              </div>
            </div>
          ) : (
            /* Search Input & Results */
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="드라이브 파일명 또는 내용 검색 (예: 2026, 선도학교, STEAM, 분수...)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>검색</span>
                </button>
              </div>

              {/* Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1 font-medium">추천 키워드:</span>
                {PRESET_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchTerm(tag);
                      handleSearch(tag);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      searchTerm === tag
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    className="text-xs underline hover:text-white cursor-pointer"
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
                  <p className="text-xs">Google 드라이브에서 관련 파일을 검색하고 있습니다...</p>
                </div>
              )}

              {/* Results List */}
              {!isLoading && files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
                    <span>검색 결과: {files.length}개 파일</span>
                    <span>최근 수정일 기준</span>
                  </div>

                  <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-850 overflow-hidden">
                    {files.map((file) => {
                      const fileUrl = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;
                      const isCopied = copiedId === file.id;

                      return (
                        <div
                          key={file.id}
                          className="p-3.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                              {getMimeIcon(file.mimeType)}
                            </div>
                            <div className="min-w-0">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors truncate block"
                              >
                                {file.name}
                              </a>
                              <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300">
                                  {getCleanMimeName(file.mimeType)}
                                </span>
                                {file.modifiedTime && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-500" />
                                    {new Date(file.modifiedTime).toLocaleDateString()}
                                  </span>
                                )}
                                {file.owners?.[0] && (
                                  <span className="flex items-center gap-1 truncate max-w-[120px]">
                                    <UserIcon className="w-3 h-3 text-slate-500" />
                                    {file.owners[0].displayName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleCopyLink(file)}
                              title={isCopied ? '복사 완료!' : '링크 복사'}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            >
                              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 transition-all cursor-pointer"
                              title="Google 드라이브에서 열기"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty Results State */}
              {!isLoading && files.length === 0 && !error && (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <FolderSearch className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">
                    '{searchTerm}' 검색어와 일치하는 파일을 찾을 수 없습니다. 다른 키워드로 검색해보세요.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
