import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import AchievementsPage from './components/pages/AchievementsPage';
import NewsPage from './components/pages/NewsPage';
import ContactPage from './components/pages/ContactPage';
import MentorManagement from './components/pages/MentorManagement';
import ContentManagement from './components/pages/ContentManagement';
import NewsManagement from './components/pages/content/NewsManagement';
import AchievementsManagement from './components/pages/content/AchievementsManagement';
import AboutManagement from './components/pages/content/AboutManagement';
import ContactManagement from './components/pages/content/ContactManagement';
import ResearchAreasManagement from './components/pages/content/ResearchAreasManagement';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import MentorLayout from './components/layout/MentorLayout';
import DashboardPage from './components/pages/student/DashboardPage';
import ResourcesPage from './components/pages/student/ResourcesPage';
import NotesPage from './components/pages/student/NotesPage';
import ProgressPage from './components/pages/student/ProgressPage';
import EnhancedStudentHub from './components/pages/student/EnhancedStudentHub';
import StudentProfilePage from './components/pages/student/StudentProfilePage';

import StudentAppointmentPage from './components/pages/student/StudentAppointmentPage';
import AdminStudentManagement from './components/pages/admin/AdminStudentManagement';

import GlassMyStudentsPage from './components/pages/mentor/GlassMyStudentsPage';
import GlassPendingProgressPage from './components/pages/mentor/GlassPendingProgressPage';
import GlassMentorProfilePage from './components/pages/mentor/GlassMentorProfilePage';
import TaskManagementPage from './components/pages/mentor/TaskManagementPage';
import AppointmentManagementPage from './components/pages/mentor/AppointmentManagementPage';
import NotificationPage from './components/pages/mentor/NotificationPage';
import MessageCenter from './components/pages/MessageCenter';

const AppContent: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      await login(username, password);
      
      if (data.user?.role === 'mentor') {
        navigate('/');
      } else if (data.user?.role === 'student') {
        navigate('/dashboard');
      } else if (data.user?.role === 'admin') {
        navigate('/student-management');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleRegister = (user: any, _token: string) => {
    // 注册成功后，根据角色导航到不同页面
    if (user?.role === 'mentor') {
      navigate('/');
    } else if (user?.role === 'student') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
      
      {/* 管理员路由 */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/student-management" element={<AdminStudentManagement />} />
        <Route path="/mentor-management" element={<MentorManagement />} />
        <Route path="/content-management" element={<ContentManagement />} />
        <Route path="/content-management/news" element={<NewsManagement />} />
        <Route path="/content-management/achievements" element={<AchievementsManagement />} />
        <Route path="/content-management/research-areas" element={<ResearchAreasManagement />} />
        <Route path="/content-management/about" element={<AboutManagement />} />
        <Route path="/content-management/contact" element={<ContactManagement />} />
      </Route>

      {/* 学生路由 */}
      <Route element={<ProtectedRoute requiredRole="student" />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/student-profile" element={<StudentProfilePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/progress/:progressId" element={<ProgressPage />} />
        <Route path="/student-appointments" element={<StudentAppointmentPage />} />
      </Route>

      {/* 导师路由 */}
      <Route element={<ProtectedRoute requiredRole="mentor" />}>
        <Route path="/my-students" element={<MentorLayout><GlassMyStudentsPage /></MentorLayout>} />
        <Route path="/my-students/:studentId" element={<MentorLayout><GlassMyStudentsPage /></MentorLayout>} />
        <Route path="/pending-progress" element={<MentorLayout><GlassPendingProgressPage /></MentorLayout>} />
        <Route path="/pending-progress/:progressId" element={<MentorLayout><GlassPendingProgressPage /></MentorLayout>} />
        <Route path="/mentor-profile" element={<MentorLayout><GlassMentorProfilePage /></MentorLayout>} />
        <Route path="/tasks" element={<MentorLayout><TaskManagementPage /></MentorLayout>} />
        <Route path="/mentor-appointments" element={<MentorLayout><AppointmentManagementPage /></MentorLayout>} />
        <Route path="/notifications" element={<MentorLayout><NotificationPage /></MentorLayout>} />
      </Route>

      {/* 通用受保护路由 - 所有登录用户可访问 */}
      <Route element={<ProtectedRoute />}>
        <Route path="/student-hub" element={<EnhancedStudentHub />} />
        {/* 消息中心 - 新的即时通讯平台 */}
        <Route path="/messages" element={<MessageCenter />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
