import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: '首页', path: '/' },
    { name: '关于我们', path: '/about' },
    { name: '研究成果', path: '/achievements' },
    { name: '新闻公告', path: '/news' },
    { name: '联系方式', path: '/contact' },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'bg-dark-gray/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}
        ${className}
      `}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-orbitron font-bold text-electric-blue">
              计算机学院实验室
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `font-rajdhani font-medium transition-colors
                  ${isActive ? 'text-electric-blue' : 'text-white hover:text-electric-blue'}
                `}
              >
                {item.name}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="font-rajdhani text-white">
                  {user?.username} ({user?.role === 'admin' ? '管理员' : user?.role === 'mentor' ? '导师' : '学生'})
                </span>
                {/* 消息中心 - 所有登录用户可见 */}
                <NavLink
                  to="/messages"
                  className="font-rajdhani font-medium transition-colors text-white hover:text-electric-blue"
                >
                  消息中心
                </NavLink>
                {(user?.role === 'admin' || user?.role === 'student') && (
                  <NavLink
                    to={user?.role === 'admin' ? '/student-management' : '/student-hub'}
                    className="font-rajdhani font-medium transition-colors text-white hover:text-electric-blue"
                  >
                    {user?.role === 'admin' ? '学生管理' : '学生中心'}
                  </NavLink>
                )}
                {(user?.role === 'admin' || user?.role === 'mentor') && (
                  <NavLink
                    to={user?.role === 'admin' ? '/mentor-management' : '/'}
                    className="font-rajdhani font-medium transition-colors text-white hover:text-electric-blue"
                  >
                    {user?.role === 'admin' ? '导师管理' : '导师中心'}
                  </NavLink>
                )}
                {user?.role === 'admin' && (
                  <NavLink
                    to="/content-management"
                    className="font-rajdhani font-medium transition-colors text-white hover:text-electric-blue"
                  >
                    内容管理
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="font-rajdhani font-medium transition-colors text-white hover:text-electric-blue"
                >
                  注销
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="font-rajdhani font-medium transition-colors text-white hover:text-electric-blue"
              >
                登录
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 overflow-hidden"
            >
              <div className="flex flex-col space-y-4 py-4 border-t border-light-gray/10">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      `font-rajdhani font-medium transition-colors py-2
                      ${isActive ? 'text-electric-blue' : 'text-white hover:text-electric-blue'}
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                ))}
                {isAuthenticated ? (
                  <>
                    <div className="font-rajdhani text-white py-2">
                      {user?.username} ({user?.role === 'admin' ? '管理员' : user?.role === 'mentor' ? '导师' : '学生'})
                    </div>
                    {(user?.role === 'admin' || user?.role === 'student') && (
                      <NavLink
                        to={user?.role === 'admin' ? '/student-management' : '/student-hub'}
                        className="font-rajdhani font-medium transition-colors py-2 text-white hover:text-electric-blue"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {user?.role === 'admin' ? '学生管理' : '学生中心'}
                      </NavLink>
                    )}
                    {(user?.role === 'admin' || user?.role === 'mentor') && (
                      <NavLink
                        to={user?.role === 'admin' ? '/mentor-management' : '/'}
                        className="font-rajdhani font-medium transition-colors py-2 text-white hover:text-electric-blue"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {user?.role === 'admin' ? '导师管理' : '导师中心'}
                      </NavLink>
                    )}
                    {user?.role === 'admin' && (
                      <NavLink
                        to="/content-management"
                        className="font-rajdhani font-medium transition-colors py-2 text-white hover:text-electric-blue"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        内容管理
                      </NavLink>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="font-rajdhani font-medium transition-colors py-2 text-white hover:text-electric-blue text-left"
                    >
                      注销
                    </button>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    className="font-rajdhani font-medium transition-colors py-2 text-white hover:text-electric-blue"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    登录
                  </NavLink>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;