export type ResourceType = 
  | 'google-form'
  | 'google-sheet'
  | 'google-doc'
  | 'google-drive'
  | 'webapp'
  | 'padlet'
  | 'notebook'
  | 'video';

export type SubjectCategory = 
  | '전체'
  | '국어'
  | '도덕·사회'
  | '수학'
  | '과학'
  | '미술'
  | '안전'
  | '인성·상담'
  | '특수'
  | '독서·토론'
  | '문해력·한자'
  | '융합·메이커'
  | '설문·평가'
  | '공동체·퀴즈'
  | '학교간 교원학습공동체 & 퀴즈'
  | '소개 영상';

export interface EducationalResource {
  id: string;
  title: string;
  projectId: string;
  category: SubjectCategory;
  subCategory?: string;
  type: ResourceType;
  url: string;
  description: string;
  grade?: string;
  target?: string;
  badge?: string;
}

export interface EducationProject {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  color: string;
  accentColor: string;
  bgGradient: string;
  iconName: string;
  stats: {
    resourceCount: number;
    formsCount: number;
    sheetsCount: number;
    webAppsCount: number;
    driveCount: number;
  };
  highlightTags: string[];
}
