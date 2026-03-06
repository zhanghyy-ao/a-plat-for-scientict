import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserGraduate, FaUniversity, FaGraduationCap, FaBriefcase, 
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaFlask, 
  FaAward, FaEdit, FaSave, FaChevronRight, FaSpinner
} from 'react-icons/fa';
import { myApi } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';

interface MentorInfo {
  id: string;
  name: string;
  title: string;
  department: string;
  research_direction?: string;
  bio?: string;
  email?: string;
  phone?: string;
  student_count?: number;
}

const GlassMentorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [mentorInfo, setMentorInfo] = useState<MentorInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载导师信息
  useEffect(() => {
    loadMentorInfo();
  }, []);

  const loadMentorInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await myApi.getMyProfile();
      setMentorInfo(data);
    } catch (err: any) {
      console.error('Failed to load mentor info:', err);
      setError(err.message || '加载导师信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!mentorInfo) return;
    
    try {
      setIsSaving(true);
      const updateData = {
        name: mentorInfo.name,
        title: mentorInfo.title,
        department: mentorInfo.department,
        research_direction: mentorInfo.research_direction,
        bio: mentorInfo.bio,
        email: mentorInfo.email,
        phone: mentorInfo.phone,
      };
      
      const updatedData = await myApi.updateMyProfile(updateData);
      setMentorInfo(updatedData);
      setIsEditing(false);
      alert('个人信息已保存');
    } catch (err: any) {
      console.error('Failed to save mentor info:', err);
      alert('保存失败: ' + (err.message || '未知错误'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof MentorInfo, value: string) => {
    if (mentorInfo) {
      setMentorInfo({ ...mentorInfo, [field]: value });
    }
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (isLoading) {
    return (
      <div className="particle-bg py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="particle-bg py-8 min-h-screen flex items-center justify-center">
        <div className="glass-strong rounded-3xl p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadMentorInfo}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!mentorInfo) {
    return (
      <div className="particle-bg py-8 min-h-screen flex items-center justify-center">
        <div className="glass-strong rounded-3xl p-8 text-center">
          <p className="text-white/60">暂无导师信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="particle-bg py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold font-orbitron text-white mb-2">个人信息</h1>
            <p className="text-white/60 font-rajdhani text-lg">管理您的个人资料</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={isSaving}
            className={`px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 ${
              isEditing
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/40'
                : 'bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:shadow-lg hover:shadow-blue-500/40'
            } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? <FaSpinner className="animate-spin" /> : (isEditing ? <FaSave /> : <FaEdit />)}
            {isSaving ? '保存中...' : (isEditing ? '保存' : '编辑')}
          </motion.button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="glass-strong rounded-3xl p-8"
          >
            <div className="flex items-center mb-8 pb-8 border-b border-white/10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-28 h-28 bg-gradient-to-br from-blue-600 to-sky-500 rounded-3xl flex items-center justify-center text-white text-5xl font-bold mr-8 shadow-lg shadow-blue-500/30"
              >
                {mentorInfo.name?.charAt(0) || '导'}
              </motion.div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={mentorInfo.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-2xl font-bold font-orbitron focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <h2 className="text-3xl font-bold font-orbitron text-white mb-2">{mentorInfo.name}</h2>
                )}
                <div className="flex items-center gap-4 text-white/60 font-rajdhani">
                  {isEditing ? (
                    <input
                      type="text"
                      value={mentorInfo.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="px-3 py-1 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  ) : (
                    <span>{mentorInfo.title || '未设置职称'}</span>
                  )}
                  <span>•</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={mentorInfo.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="px-3 py-1 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  ) : (
                    <span>{mentorInfo.department || '未设置部门'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaUniversity className="text-purple-400" />
                    基本信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani">姓名</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={mentorInfo.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.name || '未设置'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani">职称</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={mentorInfo.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.title || '未设置'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani">所属部门</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={mentorInfo.department || ''}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.department || '未设置'}</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaEnvelope className="text-sky-400" />
                    联系方式
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani flex items-center gap-2">
                        <FaPhone className="text-sm" />
                        联系电话
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={mentorInfo.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.phone || '未设置'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani flex items-center gap-2">
                        <FaEnvelope className="text-sm" />
                        邮箱
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={mentorInfo.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.email || '未设置'}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaFlask className="text-purple-400" />
                    研究方向
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={mentorInfo.research_direction || ''}
                      onChange={(e) => handleInputChange('research_direction', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      rows={4}
                      placeholder="请输入研究方向"
                    />
                  ) : (
                    <p className="text-white/80 leading-relaxed">
                      {mentorInfo.research_direction || '未设置研究方向'}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaGraduationCap className="text-sky-400" />
                    个人简介
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={mentorInfo.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      rows={4}
                      placeholder="请输入个人简介"
                    />
                  ) : (
                    <p className="text-white/80 leading-relaxed">
                      {mentorInfo.bio || '未设置个人简介'}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaUserGraduate className="text-purple-400" />
                    指导学生
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-white">{mentorInfo.student_count || 0}</div>
                    <div className="text-white/60">名学生</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlassMentorProfilePage;
