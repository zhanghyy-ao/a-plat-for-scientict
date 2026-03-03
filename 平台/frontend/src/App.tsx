import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import AchievementsPage from './components/pages/AchievementsPage';
import NewsPage from './components/pages/NewsPage';
import ContactPage from './components/pages/ContactPage';
import StudentManagement from './components/pages/StudentManagement';
import MentorManagement from './components/pages/MentorManagement';
import ContentManagement from './components/pages/ContentManagement';
import NewsManagement from './components/pages/content/NewsManagement';
import AchievementsManagement from './components/pages/content/AchievementsManagement';
import AboutManagement from './components/pages/content/AboutManagement';
import ContactManagement from './components/pages/content/ContactManagement';
import LoginPage from './components/pages/LoginPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import MyStudentsPage from './components/pages/mentor/MyStudentsPage';
import ProgressPage from './components/pages/student/ProgressPage';
import PendingProgressPage from './components/pages/mentor/PendingProgressPage';
import DashboardPage from './components/pages/student/DashboardPage';
import ResourcesPage from './components/pages/student/ResourcesPage';
import NotesPage from './components/pages/student/NotesPage';
import EnhancedStudentHub from './components/pages/student/EnhancedStudentHub';
import AdminStudentManagement from './components/pages/admin/AdminStudentManagement';
import GlassMentorDashboard from './components/pages/mentor/GlassMentorDashboard';
import GlassMessagesPage from './components/pages/mentor/GlassMessagesPage';
import GlassMyStudentsPage from './components/pages/mentor/GlassMyStudentsPage';
import GlassPendingProgressPage from './components/pages/mentor/GlassPendingProgressPage';

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
        navigate('/mentor-dashboard');
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

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/student-management" element={<AdminStudentManagement />} />
        <Route path="/student-hub" element={<EnhancedStudentHub />} />
        <Route path="/mentor-management" element={<MentorManagement />} />
        <Route path="/content-management" element={<ContentManagement />} />
        <Route path="/content-management/news" element={<NewsManagement />} />
        <Route path="/content-management/achievements" element={<AchievementsManagement />} />
        <Route path="/content-management/about" element={<AboutManagement />} />
        <Route path="/content-management/contact" element={<ContactManagement />} />
        <Route path="/mentor-dashboard" element={<GlassMentorDashboard />} />
        <Route path="/my-students" element={<GlassMyStudentsPage />} />
        <Route path="/my-students/:studentId" element={<GlassMyStudentsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/progress/:progressId" element={<ProgressPage />} />
        <Route path="/pending-progress" element={<GlassPendingProgressPage />} />
        <Route path="/pending-progress/:progressId" element={<GlassPendingProgressPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/messages" element={<GlassMessagesPage />} />
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
