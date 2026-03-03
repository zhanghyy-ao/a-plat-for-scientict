import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, FiUser, FiBook, FiLayout,
  FiFileText, FiEdit3, FiArrowUpRight,
  FiUsers, FiMessageSquare, FiClipboard,
  FiCalendar
} from 'react-icons/fi';

interface SidebarProps {
  type: 'student' | 'mentor';
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ type, className = '' }) => {
  const studentLinks = [
    { name: '个人工作台', path: '/dashboard', icon: <FiLayout /> },
    { name: '学生中心', path: '/student-hub', icon: <FiHome /> },
    { name: '课题进度', path: '/progress', icon: <FiBook /> },
    { name: '学习资源', path: '/resources', icon: <FiFileText /> },
    { name: '个人笔记', path: '/notes', icon: <FiEdit3 /> },
  ];

  const mentorLinks = [
    { name: '导师工作台', path: '/mentor-dashboard', icon: <FiHome /> },
    { name: '我的学生', path: '/my-students', icon: <FiUsers /> },
    { name: '待审进度', path: '/pending-progress', icon: <FiClipboard /> },
    { name: '消息中心', path: '/messages', icon: <FiMessageSquare /> },
  ];

  const links = type === 'student' ? studentLinks : mentorLinks;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.aside 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`
        w-64 fixed left-4 top-4 bottom-4 z-50
        transition-all duration-300
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-neon-cyan/10 to-neon-pink/20 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(168,85,247,0.15)] overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-cyan/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-neon-pink/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <nav className="relative px-5 py-4 h-full">
        <motion.div 
          variants={itemVariants}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple via-neon-cyan to-neon-pink flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            >
              <FiHome className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold font-orbitron text-white">
                {type === 'student' ? '学生空间' : '导师空间'}
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                {type === 'student' ? '探索学术之旅' : '指导学生成长'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3">
          {links.map((link, index) => (
            <motion.li 
              key={index}
              variants={itemVariants}
              whileHover={{ x: 8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="list-none"
            >
              <NavLink
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-r from-neon-purple/30 to-neon-cyan/30 text-white border border-neon-purple/40 shadow-[0_4px_20px_rgba(168,85,247,0.3)]'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? 'bg-gradient-to-br from-neon-purple to-neon-cyan text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                      : 'bg-white/10 group-hover:bg-white/20'
                  }`}>
                    <span className={isActive ? '' : 'group-hover:scale-110 transition-transform'}>
                      {link.icon}
                    </span>
                  </div>
                  <span className="font-medium text-base">{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute right-4 w-2 h-11 bg-gradient-to-b from-neon-purple to-neon-cyan rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.li>
          ))}
        </div>

        <motion.div 
          variants={itemVariants}
          className="mt-10 pt-4 border-t border-white/10"
        >
          <div className="bg-gradient-to-r from-neon-purple/15 to-neon-cyan/15 rounded-2xl p-5 border border-neon-purple/25 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center flex-shrink-0"
              >
                <FiArrowUpRight className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <p className="text-xs text-gray-300 mb-1 font-medium">快捷方式</p>
                <p className="text-sm text-white">点击上方导航快速访问功能</p>
              </div>
            </div>
          </div>
        </motion.div>
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
