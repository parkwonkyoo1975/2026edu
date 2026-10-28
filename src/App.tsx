import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  Search, 
  Filter, 
  X, 
  ExternalLink, 
  FolderSearch, 
  Bookmark, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ArrowUpDown,
  BookOpen,
  GraduationCap,
  PlayCircle,
  Video
} from 'lucide-react';
import { initAuth, googleSignIn, googleSignOut } from './services/googleAuth';
import { EDUCATION_PROJECTS, ALL_RESOURCES, INTRO_VIDEO_RESOURCE } from './data/educationData';
import { EducationalResource, SubjectCategory, ResourceType } from './types/education';
import { Navbar } from './components/Navbar';
import { ThreeHeroCampus } from './components/ThreeHeroCampus';
import { StatsBanner } from './components/StatsBanner';
import { ResourceCard } from './components/ResourceCard';
import { ResourceModal } from './components/ResourceModal';
import { DriveSearchModal } from './components/DriveSearchModal';
import { VideoSpotlightBanner } from './components/VideoSpotlightBanner';

const CATEGORY_FILTERS: SubjectCategory[] = [
  '전체',
  '소개 영상',
  '국어',
  '수학',
  '과학',
  '미술',
  '도덕·사회',
  '인성·상담',
  '융합·메이커',
  '독서·토론',
  '문해력·한자',
  '안전',
  '설문·평가',
  '학교간 교원학습공동체 & 퀴즈',
];

const TYPE_FILTERS: { label: string; value: 'all' | ResourceType }[] = [
  { label: '전체 유형', value: 'all' },
  { label: '🎬 공식 소개 영상 (1)', value: 'video' },
  { label: 'Google 설문지 (27)', value: 'google-form' },
  { label: 'Google 스프레드시트 (30+)', value: 'google-sheet' },
  { label: '인터랙티브 웹앱 (24)', value: 'webapp' },
  { label: 'Google 드라이브 폴더 (10)', value: 'google-drive' },
  { label: 'Google 문서 (5)', value: 'google-doc' },
  { label: '패들렛 협업판 (2)', value: 'padlet' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Filter State
  const [activeProjectId, setActiveProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('전체');
  const [selectedType, setSelectedType] = useState<'all' | ResourceType>('all');
  const [isBookmarkedOnly, setIsBookmarkedOnly] = useState(false);

  // Bookmarks saved in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('balsan_2026_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal State
  const [previewResource, setPreviewResource] = useState<EducationalResource | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [showIntroVideoModal, setShowIntroVideoModal] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('balsan_2026_bookmarks', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  }, [bookmarkedIds]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered resources calculation
  const filteredResources = useMemo(() => {
    return ALL_RESOURCES.filter((res) => {
      // 1. Project filter
      if (activeProjectId !== 'all' && res.projectId !== activeProjectId) {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== '전체') {
        if (selectedCategory === '학교간 교원학습공동체 & 퀴즈') {
          if (
            res.category !== '학교간 교원학습공동체 & 퀴즈' &&
            res.category !== '공동체·퀴즈' &&
            res.projectId !== 'teacher-community'
          ) {
            return false;
          }
        } else if (res.category !== selectedCategory) {
          return false;
        }
      }

      // 3. Type filter
      if (selectedType !== 'all' && res.type !== selectedType) {
        return false;
      }

      // 4. Bookmark filter
      if (isBookmarkedOnly && !bookmarkedIds.includes(res.id)) {
        return false;
      }

      // 5. Text search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = res.title.toLowerCase().includes(q);
        const matchDesc = res.description.toLowerCase().includes(q);
        const matchCategory = res.category.toLowerCase().includes(q);
        const matchSub = res.subCategory?.toLowerCase().includes(q);
        const matchBadge = res.badge?.toLowerCase().includes(q);
        const matchVideo = (q.includes('영상') || q.includes('비디오') || q.includes('video')) && res.type === 'video';
        if (!matchTitle && !matchDesc && !matchCategory && !matchSub && !matchBadge && !matchVideo) {
          return false;
        }
      }

      return true;
    });
  }, [activeProjectId, selectedCategory, selectedType, isBookmarkedOnly, bookmarkedIds, searchQuery]);

  // Current active project details
  const currentProject = useMemo(() => {
    if (activeProjectId === 'all') return null;
    return EDUCATION_PROJECTS.find((p) => p.id === activeProjectId);
  }, [activeProjectId]);

  const clearAllFilters = () => {
    setActiveProjectId('all');
    setSelectedCategory('전체');
    setSelectedType('all');
    setSearchQuery('');
    setIsBookmarkedOnly(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. Top Navigation Bar */}
      <Navbar
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSigningIn={isSigningIn}
        onOpenDriveSearch={() => setIsDriveModalOpen(true)}
        onOpenIntroVideo={() => setShowIntroVideoModal(true)}
        bookmarkedCount={bookmarkedIds.length}
        onShowBookmarkedOnly={() => setIsBookmarkedOnly(!isBookmarkedOnly)}
        isBookmarkedOnly={isBookmarkedOnly}
      />

      {/* 2. Interactive Three.js 3D Campus Scene */}
      <ThreeHeroCampus
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          setActiveProjectId(id);
        }}
        onOpenIntroVideo={() => setShowIntroVideoModal(true)}
      />

      {/* 3. Stats & 5 Major Projects Banner */}
      <StatsBanner
        projects={EDUCATION_PROJECTS}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        totalResources={ALL_RESOURCES.length}
        onOpenIntroVideo={() => setShowIntroVideoModal(true)}
      />

      {/* 4. Filter & Search Control Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Prominent Featured Video Spotlight Banner */}
        <VideoSpotlightBanner onOpenVideoModal={() => setShowIntroVideoModal(true)} />

        {/* Active Project Banner (if filtered to one project) */}
        {currentProject && (
          <div
            className="p-5 sm:p-6 rounded-2xl border shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{
              borderColor: currentProject.color,
              background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))`,
            }}
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded text-xs font-bold text-white shadow"
                  style={{ backgroundColor: currentProject.color }}
                >
                  사업 {currentProject.number}
                </span>
                <span className="text-xs font-semibold text-sky-400">
                  {currentProject.subtitle}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {currentProject.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentProject.description}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {currentProject.highlightTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveProjectId('all')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors self-start md:self-center shrink-0 cursor-pointer"
            >
              전체 사업 보기
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="자료 제목, 과목, 키워드 검색 (예: 글쓰기, 분수, 골든벨, 메이커, 월드컵...)"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type Filter Select */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[180px]">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'all' | ResourceType)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none pr-8"
                >
                  {TYPE_FILTERS.map((t) => (
                    <option key={t.value} value={t.value} className="bg-slate-900 text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>

              {(searchQuery || selectedCategory !== '전체' || selectedType !== 'all' || isBookmarkedOnly || activeProjectId !== 'all') && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer shrink-0"
                  title="모든 필터 초기화"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
            {CATEGORY_FILTERS.map((cat) => {
              const isVideo = cat === '소개 영상';
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    isSelected
                      ? isVideo
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 ring-2 ring-rose-400'
                        : 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-400/50'
                      : isVideo
                      ? 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/60 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {isVideo && <Video className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{cat}</span>
                  {isVideo && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Header Count & Quick Drive Launch */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              자료 목록
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {filteredResources.length}개
            </span>
            {isBookmarkedOnly && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
                즐겨찾기 필터 적용 중
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <FolderSearch className="w-3.5 h-3.5" />
              <span>Google 드라이브에서 직접 찾기</span>
            </button>
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isBookmarked={bookmarkedIds.includes(resource.id)}
                onToggleBookmark={handleToggleBookmark}
                onOpenPreview={(res) => setPreviewResource(res)}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">검색된 자료가 없습니다</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              현재 필터 또는 검색어와 일치하는 자료가 없습니다. 검색어를 변경하거나 모든 필터를 초기화해 보세요.
            </p>
            <div className="pt-2">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
              >
                필터 초기화
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-900/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-semibold text-slate-400">
            2026학년도 서울발산초등학교 주요 교육 사업 통합 아카이브 포털
          </p>
          <p className="text-[11px] text-slate-500">
            AI·디지털 선도학교 · STEAM 클럽 · 사회정서학습(SEL) · 독서·토론 프로젝트 · 학교 간 교원학습공동체
          </p>
          <div className="pt-2 flex justify-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setShowIntroVideoModal(true)}
              className="hover:text-sky-300 underline cursor-pointer"
            >
              소개 영상 바로보기
            </button>
            <span>·</span>
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="hover:text-sky-300 underline cursor-pointer"
            >
              내 Google 드라이브 실시간 검색
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Preview Modal */}
      <ResourceModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      {/* 2. Drive Search Modal */}
      <DriveSearchModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        user={user}
        onSignInSuccess={(u, t) => {
          setUser(u);
          setToken(t);
        }}
      />

      {/* 3. Introduction Video Modal */}
      {showIntroVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">2026 교육 사업 소개 영상</h3>
                  <p className="text-xs text-slate-400">Google Drive 동영상 아카이브 폴더 연동</p>
                </div>
              </div>
              <button
                onClick={() => setShowIntroVideoModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-xl bg-slate-850 border border-slate-700/80 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center shadow-inner">
                <PlayCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">
                  2026 교육 사업 소개 영상 모음 폴더
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  2026학년도 AI·디지털 활용 선도학교 및 STEAM 클럽, SEL 교실, 독서토론 프로젝트의 생생한 활동 영상 원본이 Google Drive 폴더에 등록되어 있습니다.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <a
                  href={INTRO_VIDEO_RESOURCE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
                >
                  <span>Google Drive에서 소개 영상 재생하기</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
