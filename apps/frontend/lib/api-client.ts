const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headersInit: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headersInit['Authorization'] = `Bearer ${token}`;
    }

    const mergedHeaders = new Headers(headersInit);
    if (options.headers) {
      const customHeaders = new Headers(options.headers);
      customHeaders.forEach((value, key) => {
        mergedHeaders.set(key, value);
      });
    }

    try {
      const fullUrl = `${API_URL}${endpoint}`;
      console.log('Full request URL:', fullUrl);
      const response = await fetch(fullUrl, {
        ...options,
        headers: mergedHeaders,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data type:', typeof data, 'isArray:', Array.isArray(data));

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('Request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
      };
    }
  }

  async login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async signup(payload: SignupRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe(): Promise<ApiResponse<any>> {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  async getCourses(): Promise<ApiResponse<any>> {
    console.log('API_URL:', API_URL);
    console.log('Making request to:', `${API_URL}/courses`);
    return this.request('/courses', {
      method: 'GET',
    });
  }

  async getCourse(id: string): Promise<ApiResponse<any>> {
    return this.request(`/courses/${id}`, {
      method: 'GET',
    });
  }

  async enrollCourse(courseId: string): Promise<ApiResponse<any>> {
    return this.request(`/enrollments/courses/${courseId}`, {
      method: 'POST',
    });
  }

  async getMyEnrollments(): Promise<ApiResponse<any>> {
    return this.request('/enrollments/my-courses', {
      method: 'GET',
    });
  }

  async getEnrollmentForCourse(courseId: string): Promise<ApiResponse<any>> {
    return this.request(`/enrollments/course/${courseId}`, {
      method: 'GET',
    });
  }

  async getLesson(lessonId: string): Promise<ApiResponse<any>> {
    return this.request(`/lessons/${lessonId}`, {
      method: 'GET',
    });
  }

  // Generic helper for GET requests to arbitrary endpoints
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  // Generic helper for POST requests
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async getLessonsByModule(moduleId: string): Promise<ApiResponse<any>> {
    return this.request(`/lessons/module/${moduleId}`, {
      method: 'GET',
    });
  }

  async submitQuiz(lessonId: string, answers: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request(`/lessons/${lessonId}/submit-quiz`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // Labs
  async getLab(id: string): Promise<ApiResponse<any>> {
    return this.request(`/labs/${id}`, {
      method: 'GET',
    });
  }

  async startLabSession(labId: string): Promise<ApiResponse<any>> {
    return this.request(`/labs/${labId}/start`, {
      method: 'POST',
    });
  }

  async completeLab(labId: string, completedObjectives: string[]): Promise<ApiResponse<any>> {
    return this.request(`/labs/${labId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completedObjectives }),
    });
  }

  async getUserLabSessions(): Promise<ApiResponse<any>> {
    return this.request('/labs/sessions/my', {
      method: 'GET',
    });
  }

  async getAllLabs(): Promise<ApiResponse<any>> {
    return this.request('/labs/admin/all', {
      method: 'GET',
    });
  }

  async createLab(data: any): Promise<ApiResponse<any>> {
    return this.request('/labs/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLab(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/labs/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLab(id: string): Promise<ApiResponse<any>> {
    return this.request(`/labs/admin/${id}`, {
      method: 'DELETE',
    });
  }

  // Challenges
  async getChallenges(): Promise<ApiResponse<any>> {
    return this.request('/challenges', {
      method: 'GET',
    });
  }

  async getChallenge(id: string): Promise<ApiResponse<any>> {
    return this.request(`/challenges/${id}`, {
      method: 'GET',
    });
  }

  async submitFlag(challengeId: string, flag: string): Promise<ApiResponse<any>> {
    return this.request(`/challenges/${challengeId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ flag }),
    });
  }

  async getUserChallengeSubmissions(challengeId: string): Promise<ApiResponse<any>> {
    return this.request(`/challenges/${challengeId}/submissions`, {
      method: 'GET',
    });
  }

  async getAllChallenges(): Promise<ApiResponse<any>> {
    return this.request('/challenges/admin/all', {
      method: 'GET',
    });
  }

  async createChallenge(data: any): Promise<ApiResponse<any>> {
    return this.request('/challenges/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChallenge(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/challenges/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChallenge(id: string): Promise<ApiResponse<any>> {
    return this.request(`/challenges/admin/${id}`, {
      method: 'DELETE',
    });
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async getAllChallengeSubmissions(challengeId: string): Promise<ApiResponse<any>> {
    return this.request(`/challenges/admin/${challengeId}/submissions`, {
      method: 'GET',
    });
  }

  // Progress
  async startLesson(lessonId: string): Promise<ApiResponse<any>> {
    return this.request(`/progress/lessons/${lessonId}/start`, {
      method: 'POST',
    });
  }

  async completeLesson(lessonId: string): Promise<ApiResponse<any>> {
    return this.request(`/progress/lessons/${lessonId}/complete`, {
      method: 'PUT',
    });
  }

  async updateLessonProgress(lessonId: string, watchTime: number): Promise<ApiResponse<any>> {
    return this.request(`/progress/lessons/${lessonId}/update`, {
      method: 'PUT',
      body: JSON.stringify({ watchTime }),
    });
  }

  async getCourseProgress(courseId: string): Promise<ApiResponse<any>> {
    return this.request(`/progress/courses/${courseId}`, {
      method: 'GET',
    });
  }

  // Gamification
  async getMyStats(): Promise<ApiResponse<any>> {
    return this.request('/gamification/my-stats', { method: 'GET' });
  }

  async getMyAchievements(): Promise<ApiResponse<any>> {
    return this.request('/gamification/my-achievements', { method: 'GET' });
  }

  // Certificates
  async generateCertificate(courseId: string): Promise<ApiResponse<any>> {
    return this.request(`/certificates/generate/${courseId}`, {
      method: 'POST',
    });
  }

  async getMyCertificates(): Promise<ApiResponse<any>> {
    return this.request('/certificates/my-certificates', {
      method: 'GET',
    });
  }

  async getCertificate(certificateId: string): Promise<ApiResponse<any>> {
    return this.request(`/certificates/${certificateId}`, {
      method: 'GET',
    });
  }

  async verifyCertificate(certificateId: string, hash: string): Promise<ApiResponse<any>> {
    return this.request(`/certificates/verify/${certificateId}?hash=${hash}`, {
      method: 'GET',
    });
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
}

export const apiClient = new ApiClient();
