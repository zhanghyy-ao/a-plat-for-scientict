import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { authApi, setAuthToken } from '../../utils/api';

interface RegisterPageProps {
  onRegister: (user: any, token: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 基础信息
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  
  // 学生信息
  const [name, setName] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [grade, setGrade] = useState('');
  const [major, setMajor] = useState('');
  
  // 导师信息
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const validateStep1 = () => {
    if (!username || !password || !confirmPassword) {
      setError('请填写所有必填字段');
      return false;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    if (password.length < 6) {
      setError('密码长度至少为6位');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!name) {
      setError('请输入姓名');
      return false;
    }
    if (role === 'student' && !studentNo) {
      setError('请输入学号');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const registerData: any = {
        username,
        password,
        role,
        email: email || undefined,
        name,
      };

      if (role === 'student') {
        registerData.student_no = studentNo;
        registerData.grade = grade;
        registerData.major = major;
      } else {
        registerData.title = title;
        registerData.department = department;
      }

      const response = await authApi.register(registerData);
      
      if (response.token && response.user) {
        setAuthToken(response.token);
        onRegister(response.user, response.token);
        navigate('/');
      } else {
        setError('注册失败，请重试');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-gray via-blue-gray to-dark-gray py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-dark-gray/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-light-gray/20">
          <div className="p-8 space-y-6">
            {/* Logo and Title */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-electric-blue to-neon-cyan mb-4">
                  <span className="text-2xl font-bold text-white">CS</span>
                </div>
                <h1 className="text-2xl font-orbitron font-bold text-electric-blue mb-2">
                  计算机学院实验室
                </h1>
                <p className="text-light-gray/80">
                  创建新账号
                </p>
              </motion.div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white' : 'bg-light-gray/20 text-light-gray'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 rounded ${
                step >= 2 ? 'bg-gradient-to-r from-electric-blue to-neon-cyan' : 'bg-light-gray/20'
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white' : 'bg-light-gray/20 text-light-gray'
              }`}>
                2
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Step 1: Account Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    选择角色
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-3 px-4 rounded-lg border transition-all ${
                        role === 'student'
                          ? 'border-electric-blue bg-electric-blue/20 text-electric-blue'
                          : 'border-light-gray/30 text-light-gray hover:border-light-gray/50'
                      }`}
                    >
                      学生
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('mentor')}
                      className={`py-3 px-4 rounded-lg border transition-all ${
                        role === 'mentor'
                          ? 'border-electric-blue bg-electric-blue/20 text-electric-blue'
                          : 'border-light-gray/30 text-light-gray hover:border-light-gray/50'
                      }`}
                    >
                      导师
                    </button>
                  </div>
                </div>

                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-light-gray mb-2">
                    用户名 *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="username"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white placeholder-light-gray/50 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                      placeholder="请输入用户名"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-light-gray mb-2">
                    密码 *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={isPasswordVisible ? 'text' : 'password'}
                      required
                      className="block w-full pl-10 pr-10 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white placeholder-light-gray/50 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                      placeholder="请输入密码（至少6位）"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-gray/50 hover:text-light-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isPasswordVisible ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M15.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10.707 7.053a1 1 0 00-1.414 0l-2.829 2.829a1 1 0 101.414 1.414l2.829-2.829a1 1 0 000-1.414z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-light-gray mb-2">
                    确认密码 *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      type={isConfirmPasswordVisible ? 'text' : 'password'}
                      required
                      className="block w-full pl-10 pr-10 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white placeholder-light-gray/50 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                      placeholder="请再次输入密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-gray/50 hover:text-light-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isConfirmPasswordVisible ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M15.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10.707 7.053a1 1 0 00-1.414 0l-2.829 2.829a1 1 0 101.414 1.414l2.829-2.829a1 1 0 000-1.414z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-light-gray mb-2">
                    邮箱
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      className="block w-full pl-10 pr-3 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white placeholder-light-gray/50 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                      placeholder="请输入邮箱（可选）"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Next Button */}
                <Button
                  type="button"
                  fullWidth
                  onClick={handleNext}
                  className="w-full py-3 px-4 bg-gradient-to-r from-electric-blue to-neon-cyan text-white font-medium rounded-lg hover:shadow-lg hover:shadow-electric-blue/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  下一步
                </Button>
              </motion.div>
            )}

            {/* Step 2: Profile Information */}
            {step === 2 && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-light-gray mb-2">
                    姓名 *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white placeholder-light-gray/50 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                      placeholder="请输入姓名"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Student-specific fields */}
                {role === 'student' && (
                  <>
                    <div>
                      <label htmlFor="studentNo" className="block text-sm font-medium text-light-gray mb-2">
                        学号 *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <input
                          id="studentNo"
                          type="text"
                          required
                          className="block w-full pl-10 pr-3 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white placeholder-light-gray/50 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                          placeholder="请输入学号"
                          value={studentNo}
                          onChange={(e) => setStudentNo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="grade" className="block text-sm font-medium text-light-gray mb-2">
                        年级
                      </label>
                      <select
                        id="grade"
                        className="block w-full px-3 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                      >
                        <option value="">请选择年级</option>
                        <option value="大一">大一</option>
                        <option value="大二">大二</option>
                        <option value="大三">大三</option>
                        <option value="大四">大四</option>
                        <option value="研一">研一</option>
                        <option value="研二">研二</option>
                        <option value="研三">研三</option>
                        <option value="博一">博一</option>
                        <option value="博二">博二</option>
                        <option value="博三">博三</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="major" className="block text-sm font-medium text-light-gray mb-2">
                        专业
                      </label>
                      <input
                        id="major"
                        type="text"
                        className="block w-full px-3 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white placeholder-light-gray/50 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                        placeholder="请输入专业"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Mentor-specific fields */}
                {role === 'mentor' && (
                  <>
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-light-gray mb-2">
                        职称
                      </label>
                      <select
                        id="title"
                        className="block w-full px-3 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      >
                        <option value="">请选择职称</option>
                        <option value="教授">教授</option>
                        <option value="副教授">副教授</option>
                        <option value="讲师">讲师</option>
                        <option value="研究员">研究员</option>
                        <option value="副研究员">副研究员</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-light-gray mb-2">
                        院系
                      </label>
                      <input
                        id="department"
                        type="text"
                        className="block w-full px-3 py-3 bg-dark-gray border border-light-gray/30 rounded-lg text-white placeholder-light-gray/50 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                        placeholder="请输入院系"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 py-3 px-4 border border-light-gray/30 text-light-gray font-medium rounded-lg hover:bg-light-gray/10 transition-all"
                  >
                    返回
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-electric-blue to-neon-cyan text-white font-medium rounded-lg hover:shadow-lg hover:shadow-electric-blue/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    注册
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-light-gray/70">
                已有账号?
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="ml-1 font-medium text-electric-blue hover:text-neon-cyan transition-colors"
                >
                  立即登录
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-dark-gray/50 border-t border-light-gray/10">
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-light-gray/50 hover:text-light-gray transition-colors">
                <span className="sr-only">关于我们</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
