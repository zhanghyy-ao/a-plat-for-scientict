const API_BASE_URL = 'http://localhost:4000';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('无法连接到服务器，请检查后端服务是否运行 (http://localhost:4000)');
    }
    throw error;
  }
}

export const api = {
  get: <T>(url: string, options?: { params?: Record<string, string | number> }) => {
    let fullUrl = url;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      fullUrl = `${url}?${searchParams.toString()}`;
    }
    return request<T>(fullUrl);
  },
  post: <T>(url: string, data?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T>(url: string, data?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(url: string, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'DELETE',
    }),
};

export const authApi = {
  login: (username: string, password: string) =>
    request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (data: {
    username: string;
    password: string;
    role: 'student' | 'mentor';
    email?: string;
    name: string;
    student_no?: string;
    grade?: string;
    major?: string;
    title?: string;
    department?: string;
  }) =>
    request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<any>('/api/auth/me'),
};

export const studentApi = {
  getStudents: (mentorId?: string) => {
    const query = mentorId ? `?mentor_id=${mentorId}` : '';
    return request<any[]>(`/api/students/${query}`);
  },
  getStudent: (id: string) => request<any>(`/api/students/${id}`),
  createStudent: (data: any) =>
    request<any>('/api/students/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStudent: (id: string, data: any) =>
    request<any>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteStudent: (id: string) =>
    request<any>(`/api/students/${id}`, {
      method: 'DELETE',
    }),
  updateStudentPassword: (id: string, password: string) =>
    request<any>(`/api/students/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }),
  assignMentor: (id: string, mentorId: string) =>
    request<any>(`/api/students/${id}/assign-mentor`, {
      method: 'PUT',
      body: JSON.stringify({ mentor_id: mentorId }),
    }),
};

export const mentorApi = {
  getMentors: () => request<any[]>('/api/mentors/'),
  getMentor: (id: string) => request<any>(`/api/mentors/${id}`),
  createMentor: (data: any) =>
    request<any>('/api/mentors/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMentor: (id: string, data: any) =>
    request<any>(`/api/mentors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMentor: (id: string) =>
    request<any>(`/api/mentors/${id}`, {
      method: 'DELETE',
    }),
  updateMentorPassword: (id: string, password: string) =>
    request<any>(`/api/mentors/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }),
  getMentorStudents: (id: string) =>
    request<any[]>(`/api/mentors/${id}/students`),
};

export const userApi = {
  getAllUsers: () => request<any[]>('/api/users/'),
  getUser: (id: string) => request<any>(`/api/users/${id}`),
};

export const myApi = {
  getMyStudents: () => request<any[]>('/api/my/students'),
  getMyStudentDetail: (id: string) =>
    request<any>(`/api/my/students/${id}`),
  getMyMentor: () => request<any>('/api/my/mentor'),
  getMyProgress: () => request<any[]>('/api/my/progress'),
  getMyPendingProgress: () => request<any[]>('/api/my/pending-progress'),
  getMyProfile: () => request<any>('/api/my/profile'),
  updateMyProfile: (data: any) =>
    request<any>('/api/my/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const progressApi = {
  getProgressList: (studentId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/api/progress/${query}`);
  },
  getProgressDetail: (id: string) =>
    request<any>(`/api/progress/${id}`),
  createProgress: (data: any) =>
    request<any>('/api/progress/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProgress: (id: string, data: any) =>
    request<any>(`/api/progress/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getFeedback: (id: string) =>
    request<any>(`/api/progress/${id}/feedback`),
  submitFeedback: (id: string, data: any) =>
    request<any>(`/api/progress/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFeedback: (id: string, data: any) =>
    request<any>(`/api/progress/${id}/feedback`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const projectApi = {
  getProjects: () => request<any[]>('/api/projects/'),
  getProject: (id: string) => request<any>(`/api/projects/${id}`),
  createProject: (data: any) =>
    request<any>('/api/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: any) =>
    request<any>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    request<any>(`/api/projects/${id}`, {
      method: 'DELETE',
    }),
};

export const newsApi = {
  getNews: () => request<any[]>('/api/news/'),
  getNewsItem: (id: string) => request<any>(`/api/news/${id}`),
  createNews: (data: any) =>
    request<any>('/api/news/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateNews: (id: string, data: any) =>
    request<any>(`/api/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNews: (id: string) =>
    request<any>(`/api/news/${id}`, {
      method: 'DELETE',
    }),
};

export const achievementApi = {
  getAchievements: () => request<any[]>('/api/achievements/'),
  getAchievement: (id: string) => request<any>(`/api/achievements/${id}`),
  createAchievement: (data: any) =>
    request<any>('/api/achievements/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAchievement: (id: string, data: any) =>
    request<any>(`/api/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAchievement: (id: string) =>
    request<any>(`/api/achievements/${id}`, {
      method: 'DELETE',
    }),
};

export const todoApi = {
  getTodos: (status?: string, priority?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/api/todos/${query}`);
  },
  getTodo: (id: string) => request<any>(`/api/todos/${id}`),
  createTodo: (data: any) =>
    request<any>('/api/todos/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTodo: (id: string, data: any) =>
    request<any>(`/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTodo: (id: string) =>
    request<any>(`/api/todos/${id}`, {
      method: 'DELETE',
    }),
};

export const resourceApi = {
  getResources: (type?: string, category?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/api/resources/${query}`);
  },
  getResource: (id: string) => request<any>(`/api/resources/${id}`),
  createResource: (data: any) =>
    request<any>('/api/resources/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const noteApi = {
  getNotes: () => request<any[]>('/api/notes/'),
  getNote: (id: string) => request<any>(`/api/notes/${id}`),
  createNote: (data: any) =>
    request<any>('/api/notes/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateNote: (id: string, data: any) =>
    request<any>(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNote: (id: string) =>
    request<any>(`/api/notes/${id}`, {
      method: 'DELETE',
    }),
};

export const bookingApi = {
  getBookings: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<any[]>(`/api/bookings/${query}`);
  },
  getBooking: (id: string) => request<any>(`/api/bookings/${id}`),
  createBooking: (data: any) =>
    request<any>('/api/bookings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteBooking: (id: string) =>
    request<any>(`/api/bookings/${id}`, {
      method: 'DELETE',
    }),
};

export const messageApi = {
  getMessages: () => request<any>('/api/messages/'),
  sendMessage: (data: any) =>
    request<any>('/api/messages/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMessage: (id: string) => request<any>(`/api/messages/${id}`),
  getConversation: (userId: string) =>
    request<any[]>(`/api/messages/conversation/${userId}`),
};

export const taskApi = {
  getTasks: () => request<any[]>('/api/tasks/'),
  createTask: (data: any) =>
    request<any>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTask: (id: string) => request<any>(`/api/tasks/${id}`),
  updateTask: (id: string, data: any) =>
    request<any>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTask: (id: string) =>
    request<any>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
  updateAssignment: (taskId: string, assignmentId: string, data: any) =>
    request<any>(`/api/tasks/${taskId}/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const appointmentApi = {
  getAppointments: () => request<any[]>('/api/appointments/'),
  createAppointment: (data: any) =>
    request<any>('/api/appointments/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAppointment: (id: string) => request<any>(`/api/appointments/${id}`),
  updateAppointment: (id: string, data: any) =>
    request<any>(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAppointment: (id: string) =>
    request<any>(`/api/appointments/${id}`, {
      method: 'DELETE',
    }),
};

export const notificationApi = {
  getNotifications: () => request<any[]>('/api/notifications/'),
  getNotification: (id: string) => request<any>(`/api/notifications/${id}`),
  markAsRead: (id: string) =>
    request<any>(`/api/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_read: true }),
    }),
  updateNotification: (id: string, data: any) =>
    request<any>(`/api/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNotification: (id: string) =>
    request<any>(`/api/notifications/${id}`, {
      method: 'DELETE',
    }),
  markAllAsRead: () =>
    request<any>('/api/notifications/mark-all-read', {
      method: 'PUT',
    }),
};

export const healthApi = {
  check: () => request<any>('/api/health'),
};

export const channelApi = {
  getChannels: () => request<any[]>('/api/channels/'),
  createChannel: (data: any) =>
    request<any>('/api/channels/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getChannel: (id: string) => request<any>(`/api/channels/${id}/`),
  deleteChannel: (id: string) =>
    request<any>(`/api/channels/${id}/`, {
      method: 'DELETE',
    }),
  getMessages: (channelId: string) => request<any[]>(`/api/channels/${channelId}/messages/`),
  sendMessage: (channelId: string, data: any) =>
    request<any>(`/api/channels/${channelId}/messages/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
