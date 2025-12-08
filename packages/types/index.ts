// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Course types
export interface CourseWithModules {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  difficulty: string;
  category: string;
  price: number;
  isFree: boolean;
  duration?: number;
  modules: ModuleWithLessons[];
}

export interface ModuleWithLessons {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: LessonInfo[];
}

export interface LessonInfo {
  id: string;
  title: string;
  type: string;
  order: number;
  isFreePreview: boolean;
}

// Video streaming types
export interface VideoQuality {
  quality: string;
  url: string;
  size: number;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  status: string;
  playlistUrl?: string;
  thumbnailUrl?: string;
  qualities?: VideoQuality[];
}

// Lab types
export interface LabSessionInfo {
  id: string;
  status: string;
  accessUrl?: string;
  expiresAt: string;
  completedObjectives: string[];
  score: number;
}

// Challenge types
export interface ChallengeSubmission {
  challengeId: string;
  flag: string;
}

export interface SubmissionResult {
  isCorrect: boolean;
  points: number;
  message: string;
}

// Certificate types
export interface CertificateInfo {
  id: string;
  certificateId: string;
  courseId: string;
  pdfUrl: string;
  issuedAt: string;
}

// Subscription types
export interface SubscriptionInfo {
  tier: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
