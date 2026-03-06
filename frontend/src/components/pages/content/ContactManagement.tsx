import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Button from '../../common/Button';
import { useAuth } from '../../../contexts/AuthContext';

interface ContactInfo {
  id: string;
  address: string;
  phone: string;
  email: string;
  office_hours: string;
  location: {
    latitude: number;
    longitude: number;
  };
  social_media: {
    wechat?: string;
    weibo?: string;
    github?: string;
  };
  updated_at: string;
}

const ContactManagement: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<ContactInfo>>({
    address: '',
    phone: '',
    email: '',
    office_hours: '',
    location: {
      latitude: 39.9042,
      longitude: 116.4074
    },
    social_media: {
      wechat: '',
      weibo: '',
      github: ''
    }
  });
  const { user } = useAuth();

  const mockContactInfo: ContactInfo = {
    id: '1',
    address: '北京市海淀区中关村大街1号 科研楼A座3层',
    phone: '010-12345678',
    email: 'lab@university.edu.cn',
    office_hours: '周一至周五 9:00 - 18:00',
    location: {
      latitude: 39.9042,
      longitude: 116.4074
    },
    social_media: {
      wechat: 'our_lab',
      weibo: '@计算机实验室',
      github: 'https://github.com/our-lab'
    },
    updated_at: '2024-01-15'
  };

  useEffect(() => {
    setTimeout(() => {
      setContactInfo(mockContactInfo);
      setLoading(false);
    }, 500);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactInfo) {
      const updatedInfo: ContactInfo = {
        ...contactInfo,
        ...formData,
        updated_at: new Date().toISOString().split('T')[0]
      } as ContactInfo;
      setContactInfo(updatedInfo);
    }
    setShowModal(false);
  };

  const handleEdit = () => {
    if (contactInfo) {
      setFormData(contactInfo);
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="联系我们管理" subtitle="管理联系页面的联系方式信息" />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <Link
            to="/content-management"
            className="inline-flex items-center text-electric-blue hover:text-electric-blue/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回内容管理
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-orbitron font-semibold text-electric-blue">
              联系方式信息
            </h3>
            {user?.role === 'admin' && (
              <Button onClick={handleEdit}>
                编辑信息
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : contactInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">基本信息</h4>
                  <div className="space-y-4">
                    <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-light-gray mb-1">地址</p>
                          <p className="text-white">{contactInfo.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-light-gray mb-1">电话</p>
                          <p className="text-white">{contactInfo.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-light-gray mb-1">邮箱</p>
                          <p className="text-white">{contactInfo.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-light-gray mb-1">办公时间</p>
                          <p className="text-white">{contactInfo.office_hours}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">社交媒体</h4>
                  <div className="space-y-4">
                    {contactInfo.social_media.wechat && (
                      <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-light-gray mb-1">微信</p>
                            <p className="text-white">{contactInfo.social_media.wechat}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {contactInfo.social_media.weibo && (
                      <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.57-.18-.405-.646.356-1.017.389-1.891.003-2.521-.725-1.193-2.716-1.089-5.133.033 0 0-.762.334-.569-.27.379-1.218.326-2.231-.271-2.824-1.36-1.346-4.963.049-8.046 3.113C1.001 10.844 0 12.412 0 13.842c0 2.775 2.557 5.038 6.566 5.976 0 0 6.156 1.391 10.704-1.156 0 0 2.992-1.701 3.848-4.572.208-.703.152-1.264-.159-1.667z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-light-gray mb-1">微博</p>
                            <p className="text-white">{contactInfo.social_media.weibo}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {contactInfo.social_media.github && (
                      <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-light-gray mb-1">GitHub</p>
                            <p className="text-white">{contactInfo.social_media.github}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-light-gray/10">
                  <p className="text-sm text-light-gray">
                    最后更新: {contactInfo.updated_at}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-gray border border-light-gray/10 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-orbitron font-semibold text-electric-blue mb-6">
              编辑联系方式
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-light-gray mb-2">地址</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-light-gray mb-2">电话</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-light-gray mb-2">邮箱</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-light-gray mb-2">办公时间</label>
                  <input
                    type="text"
                    required
                    value={formData.office_hours}
                    onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">社交媒体</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-light-gray mb-2">微信</label>
                      <input
                        type="text"
                        value={formData.social_media?.wechat}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          social_media: { ...formData.social_media, wechat: e.target.value } as any
                        })}
                        className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-light-gray mb-2">微博</label>
                      <input
                        type="text"
                        value={formData.social_media?.weibo}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          social_media: { ...formData.social_media, weibo: e.target.value } as any
                        })}
                        className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-light-gray mb-2">GitHub</label>
                      <input
                        type="text"
                        value={formData.social_media?.github}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          social_media: { ...formData.social_media, github: e.target.value } as any
                        })}
                        className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  取消
                </Button>
                <Button type="submit">
                  保存
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default ContactManagement;
