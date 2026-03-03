import React, { useState } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import AchievementCard from '../ui/AchievementCard';
import DataVisualization from '../ui/DataVisualization';
import { motion } from 'framer-motion';

const AchievementsPage: React.FC = () => {
  const [activeType, setActiveType] = useState<'all' | 'paper' | 'project' | 'award' | 'patent'>('all');

  // 模拟数据
  const achievements = [
    {
      id: 1,
      title: '基于深度学习的图像识别算法研究',
      type: 'paper' as const,
      authors: ['张三', '李四', '王五'],
      date: '2026-01',
      description: '提出了一种新的深度学习模型，在ImageNet数据集上取得了state-of-the-art的性能。',
      link: '#',
    },
    {
      id: 2,
      title: '智能机器人控制系统开发',
      type: 'project' as const,
      authors: ['赵六', '钱七', '孙八'],
      date: '2025-12',
      description: '开发了一套基于强化学习的智能机器人控制系统，实现了自主导航和操作。',
      link: '#',
    },
    {
      id: 3,
      title: '计算机视觉技术在医疗领域的应用',
      type: 'award' as const,
      authors: ['周九', '吴十'],
      date: '2025-11',
      description: '该项目获得了国家科技进步二等奖，为医疗诊断提供了新的技术手段。',
      link: '#',
    },
    {
      id: 4,
      title: '一种基于区块链的安全数据共享方法',
      type: 'patent' as const,
      authors: ['郑一', '王二'],
      date: '2025-10',
      description: '提出了一种基于区块链技术的安全数据共享方法，保护用户隐私的同时实现数据流通。',
      link: '#',
    },
    {
      id: 5,
      title: '大规模语言模型的轻量化研究',
      type: 'paper' as const,
      authors: ['张三', '赵六', '周九'],
      date: '2025-09',
      description: '提出了一种新的模型压缩方法，使大型语言模型在移动设备上高效运行。',
      link: '#',
    },
    {
      id: 6,
      title: '智慧城市管理系统',
      type: 'project' as const,
      authors: ['李四', '钱七', '吴十'],
      date: '2025-08',
      description: '开发了一套智慧城市管理系统，实现了城市交通、环境、安全的智能化管理。',
      link: '#',
    },
  ];

  // 过滤成果
  const filteredAchievements = activeType === 'all' 
    ? achievements 
    : achievements.filter(item => item.type === activeType);

  // 图表数据
  const paperData = {
    labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
    datasets: [
      {
        label: '论文发表数量',
        data: [5, 8, 12, 15, 18, 10],
        borderColor: '#0066ff',
        backgroundColor: 'rgba(0, 102, 255, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const projectData = {
    labels: ['国家级', '省部级', '横向项目'],
    datasets: [
      {
        label: '项目数量',
        data: [5, 12, 8],
        backgroundColor: ['#0066ff', '#00ffff', '#808080'],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="研究成果" subtitle="展示实验室的学术论文、科研项目、获奖成果和技术专利" />

      {/* 成果统计 */}
      <section className="py-16 bg-dark-gray/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-dark-gray/80 border border-light-gray/10 rounded-lg p-6"
            >
              <h3 className="text-xl font-orbitron font-semibold mb-4 text-electric-blue">
                论文发表统计
              </h3>
              <DataVisualization type="line" data={paperData} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-dark-gray/80 border border-light-gray/10 rounded-lg p-6"
            >
              <h3 className="text-xl font-orbitron font-semibold mb-4 text-electric-blue">
                项目分布
              </h3>
              <DataVisualization type="pie" data={projectData} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 成果列表 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* 筛选器 */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { value: 'all', label: '全部' },
              { value: 'paper', label: '论文' },
              { value: 'project', label: '项目' },
              { value: 'award', label: '获奖' },
              { value: 'patent', label: '专利' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveType(filter.value as any)}
                className={`
                  px-6 py-2 rounded-full font-rajdhani font-medium transition-all
                  ${activeType === filter.value 
                    ? 'bg-electric-blue text-white' 
                    : 'bg-dark-gray/50 text-light-gray hover:bg-electric-blue/20'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* 成果卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                title={achievement.title}
                type={achievement.type}
                authors={achievement.authors}
                date={achievement.date}
                description={achievement.description}
                link={achievement.link}
              />
            ))}
          </div>

          {/* 空状态 */}
          {filteredAchievements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-light-gray text-lg">暂无相关成果</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AchievementsPage;