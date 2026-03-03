const API_BASE_URL = 'http://localhost:5000';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: (username: string, password: string) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => request<any>('/auth/me'),
};

export const studentApi = {
  getStudents: (mentorId?: string) => {
    const query = mentorId ? `?mentor_id=${mentorId}` : '';
    return request<any[]>(`/students${query}`);
  },
  getStudent: (id: string) => request<any>(`/students/${id}`),
  createStudent: (data: any) =>
    request<any>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStudent: (id: string, data: any) =>
    request<any>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteStudent: (id: string) =>
    request<any>(`/students/${id}`, {
      method: 'DELETE',
    }),
  assignMentor: (id: string, mentorId: string) =>
    request<any>(`/students/${id}/assign-mentor`, {
      method: 'PUT',
      body: JSON.stringify({ mentor_id: mentorId }),
    }),
};

export const mentorApi = {
  getMentors: () => request<any[]>('/mentors'),
  getMentor: (id: string) => request<any>(`/mentors/${id}`),
  createMentor: (data: any) =>
    request<any>('/mentors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMentor: (id: string, data: any) =>
    request<any>(`/mentors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMentor: (id: string) =>
    request<any>(`/mentors/${id}`, {
      method: 'DELETE',
    }),
  getMentorStudents: (id: string) =>
    request<any[]>(`/mentors/${id}/students`),
};

export const myApi = {
  getMyStudents: () => request<any[]>('/my/students'),
  getMyStudentDetail: (id: string) =>
    request<any>(`/my/students/${id}`),
  getMyProgress: () => request<any[]>('/my/progress'),
  getMyPendingProgress: () => request<any[]>('/my/pending-progress'),
};

export const progressApi = {
  getProgressList: (studentId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/progress${query}`);
  },
  getProgressDetail: (id: string) =>
    request<any>(`/progress/${id}`),
  createProgress: (data: any) =>
    request<any>('/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProgress: (id: string, data: any) =>
    request<any>(`/progress/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getFeedback: (id: string) =>
    request<any>(`/progress/${id}/feedback`),
  submitFeedback: (id: string, data: any) =>
    request<any>(`/progress/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFeedback: (id: string, data: any) =>
    request<any>(`/progress/${id}/feedback`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const projectApi = {
  getProjects: () => request<any[]>('/projects'),
  getProject: (id: string) => request<any>(`/projects/${id}`),
  createProject: (data: any) =>
    request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: any) =>
    request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    request<any>(`/projects/${id}`, {
      method: 'DELETE',
    }),
};

export const newsApi = {
  getNews: () => request<any[]>('/news'),
  getNewsItem: (id: string) => request<any>(`/news/${id}`),
  createNews: (data: any) =>
    request<any>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateNews: (id: string, data: any) =>
    request<any>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNews: (id: string) =>
    request<any>(`/news/${id}`, {
      method: 'DELETE',
    }),
};

export const achievementApi = {
  getAchievements: () => request<any[]>('/achievements'),
  getAchievement: (id: string) => request<any>(`/achievements/${id}`),
  createAchievement: (data: any) =>
    request<any>('/achievements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAchievement: (id: string, data: any) =>
    request<any>(`/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAchievement: (id: string) =>
    request<any>(`/achievements/${id}`, {
      method: 'DELETE',
    }),
};

export const todoApi = {
  getTodos: (status?: string, priority?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/todos${query}`);
  },
  getTodo: (id: string) => request<any>(`/todos/${id}`),
  createTodo: (data: any) =>
    request<any>('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTodo: (id: string, data: any) =>
    request<any>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTodo: (id: string) =>
    request<any>(`/todos/${id}`, {
      method: 'DELETE',
    }),
};

export const resourceApi = {
  getResources: (type?: string, category?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/resources${query}`);
  },
  getResource: (id: string) => request<any>(`/resources/${id}`),
  createResource: (data: any) =>
    request<any>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const noteApi = {
  getNotes: () => request<any[]>('/notes'),
  getNote: (id: string) => request<any>(`/notes/${id}`),
  createNote: (data: any) =>
    request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateNote: (id: string, data: any) =>
    request<any>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNote: (id: string) =>
    request<any>(`/notes/${id}`, {
      method: 'DELETE',
    }),
};

export const bookingApi = {
  getBookings: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<any[]>(`/bookings${query}`);
  },
  getBooking: (id: string) => request<any>(`/bookings/${id}`),
  createBooking: (data: any) =>
    request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteBooking: (id: string) =>
    request<any>(`/bookings/${id}`, {
      method: 'DELETE',
    }),
};

export const messageApi = {
  getMessages: () => request<any>('/messages'),
  sendMessage: (data: any) =>
    request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMessage: (id: string) => request<any>(`/messages/${id}`),
  getConversation: (userId: string) =>
    request<any[]>(`/messages/conversation/${userId}`),
};

export const taskApi = {
  getTasks: () => request<any[]>('/tasks'),
  createTask: (data: any) =>
    request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTask: (id: string) => request<any>(`/tasks/${id}`),
  updateAssignment: (taskId: string, assignmentId: string, data: any) =>
    request<any>(`/tasks/${taskId}/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const appointmentApi = {
  getAppointments: () => request<any[]>('/appointments'),
  createAppointment: (data: any) =>
    request<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAppointment: (id: string) => request<any>(`/appointments/${id}`),
  updateAppointment: (id: string, data: any) =>
    request<any>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const notificationApi = {
  getNotifications: () => request<any[]>('/notifications'),
  updateNotification: (id: string, data: any) =>
    request<any>(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  markAllRead: () =>
    request<any>('/notifications/mark-all-read', {
      method: 'PUT',
    }),
};

export const healthApi = {
  check: () => request<any>('/health'),
};
