import React from 'react';
import { User } from 'firebase/auth';
import { 
  FolderSearch, 
  Video, 
  LogOut, 
  Sparkles, 
  Bookmark, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
  onOpenDriveSearch: () => void;
  onOpenIntroVideo: () => void;
  bookmarkedCount: number;
  onShowBookmarkedOnly: () => void;
  isBookmarkedOnly: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignIn,
  onSignOut,
  isSigningIn,
  onOpenDriveSearch,
  onOpenIntroVideo,
  bookmarkedCount,
  onShowBookmarkedOnly,
  isBookmarkedOnly,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & School Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white truncate">
                2026 미래교육 아카이브
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                발산초등학교
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              5대 주요 교육 사업 및 구글 워크스페이스 통합 허브
            </p>
          </div>
        </div>

        {/* Action Center: Intro Video, Drive Search, Bookmarks, Google Sign-in */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Intro Video Button (Prominent) */}
          <button
            onClick={onOpenIntroVideo}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/60 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shrink-0"
            title="2026 교육 사업 종합 소개 영상 시청"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Video className="w-3.5 h-3.5 text-white" />
            <span className="font-extrabold">소개 영상</span>
          </button>

          {/* Bookmarks Filter Toggle */}
          <button
            onClick={onShowBookmarkedOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isBookmarkedOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="즐겨찾기한 자료만 모아보기"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarkedOnly ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">즐겨찾기</span>
            {bookmarkedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300">
                {bookmarkedCount}
              </span>
            )}
          </button>

          {/* Google Drive Live Search Button */}
          <button
            onClick={onOpenDriveSearch}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm shadow-blue-500/25 transition-all cursor-pointer shrink-0"
            title="Google 드라이브 검색"
          >
            <FolderSearch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">내 드라이브 검색</span>
            <span className="sm:hidden">드라이브</span>
          </button>

          {/* Google Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || '사용자'}
                    className="w-7 h-7 rounded-full ring-2 ring-emerald-500/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.displayName ? user.displayName.slice(0, 1) : 'U'}
                  </div>
                )}
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
                    {user.displayName || '선생님'}
                  </span>
                  <span className="text-[10px] text-emerald-400">구글 드라이브 연동됨</span>
                </div>
              </div>

              <button
                onClick={onSignOut}
                title="로그아웃"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="pl-1">
              <button
                onClick={onSignIn}
                disabled={isSigningIn}
                className="gsi-material-button inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span className="hidden sm:inline">Google 로그인</span>
                <span className="sm:hidden">로그인</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
