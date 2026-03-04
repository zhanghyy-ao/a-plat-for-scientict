import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaClipboardList, FaComments, FaUserCog,
  FaChevronRight
} from 'react-icons/fa';

interface MentorLayoutProps {
  children: React.ReactNode;
}

const MentorLayout: React.FC<MentorLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', name: '工作台', icon: FaHome },
    { path: '/my-students', name: '我的学生', icon: FaUsers },
    { path: '/pending-progress', name: '待审进度', icon: FaClipboardList },
    { path: '/messages', name: '消息中心', icon: FaComments },
    { path: '/mentor-profile', name: '个人资料', icon: FaUserCog },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header showNavbar={true} />
      <main className="flex-1 flex pt-20">
        <aside className="w-64 bg-dark-gray/80 backdrop-blur-md border-r border-white/10 flex-shrink-0">
          <div className="p-6 pt-4">
            <h2 className="text-xl font-bold font-orbitron text-white mb-6">导师中心</h2>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/30'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="text-lg" />
                      <span className="font-rajdhani font-medium">{item.name}</span>
                    </div>
                    {isActive && <FaChevronRight className="text-sm" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MentorLayout;
