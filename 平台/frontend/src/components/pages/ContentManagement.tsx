import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

const ContentManagement: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="内容管理" subtitle="管理网站的静态内容" />
      
      <div className="flex flex-1 container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-64 flex-shrink-0 mr-8"
        >
          <div className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-4">
            <h3 className="text-xl font-orbitron font-semibold mb-6 text-electric-blue">
              内容管理
            </h3>
            <nav className="space-y-2">
              <Link 
                to="/content-management/news"
                className="block py-2 px-4 rounded-lg transition-colors hover:bg-electric-blue/20 text-white hover:text-electric-blue"
              >
                新闻管理
              </Link>
              <Link 
                to="/content-management/achievements"
                className="block py-2 px-4 rounded-lg transition-colors hover:bg-electric-blue/20 text-white hover:text-electric-blue"
              >
                成果管理
              </Link>
              <Link 
                to="/content-management/about"
                className="block py-2 px-4 rounded-lg transition-colors hover:bg-electric-blue/20 text-white hover:text-electric-blue"
              >
                关于我们
              </Link>
              <Link 
                to="/content-management/contact"
                className="block py-2 px-4 rounded-lg transition-colors hover:bg-electric-blue/20 text-white hover:text-electric-blue"
              >
                联系我们
              </Link>
            </nav>
          </div>
        </motion.div>
        
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-orbitron font-semibold text-electric-blue mb-6">
              内容管理中心
            </h3>
            <p className="text-light-gray mb-8">
              在这里，您可以管理网站的所有静态内容，包括新闻、成果、关于我们和联系我们页面的内容。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-6 hover:border-electric-blue transition-colors">
                <h4 className="text-lg font-semibold text-white mb-3">新闻管理</h4>
                <p className="text-light-gray mb-4">管理实验室的新闻动态，包括发布、编辑和删除新闻。</p>
                <Button href="/content-management/news" variant="outline">
                  进入管理
                </Button>
              </div>
              
              <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-6 hover:border-electric-blue transition-colors">
                <h4 className="text-lg font-semibold text-white mb-3">成果管理</h4>
                <p className="text-light-gray mb-4">管理实验室的研究成果，包括论文、项目和奖项。</p>
                <Button href="/content-management/achievements" variant="outline">
                  进入管理
                </Button>
              </div>
              
              <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-6 hover:border-electric-blue transition-colors">
                <h4 className="text-lg font-semibold text-white mb-3">关于我们</h4>
                <p className="text-light-gray mb-4">编辑实验室的基本信息、历史和发展愿景。</p>
                <Button href="/content-management/about" variant="outline">
                  进入管理
                </Button>
              </div>
              
              <div className="bg-dark-gray border border-light-gray/10 rounded-lg p-6 hover:border-electric-blue transition-colors">
                <h4 className="text-lg font-semibold text-white mb-3">联系我们</h4>
                <p className="text-light-gray mb-4">编辑实验室的联系方式和地理位置信息。</p>
                <Button href="/content-management/contact" variant="outline">
                  进入管理
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContentManagement;