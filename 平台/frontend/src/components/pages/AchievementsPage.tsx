import React, { useState, useEffect } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import AchievementCard from '../ui/AchievementCard';
import DataVisualization from '../ui/DataVisualization';
import { motion } from 'framer-motion';
import { achievementApi } from '../../utils/api';

interface Achievement {
  id: string;
  title: string;
  type: 'paper' | 'project' | 'award' | 'patent';
  authors: string[];
  publish_date: string;
  description: string;
  link: string;
}

const AchievementsPage: React.FC = () => {
  const [activeType, setActiveType] = useState<'all' | 'paper' | 'project' | 'award' | 'patent'>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await achievementApi.getAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤成果
  const filteredAchievements = activeType === 'all' 
    ? achievements 
    : achievements.filter(item => item.type === activeType);

  // 计算统计数据
  const paperCountByYear = achievements
    .filter(a => a.type === 'paper')
    .reduce((acc, paper) => {
      const year = paper.publish_date?.substring(0, 4) || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const years = Object.keys(paperCountByYear).sort();
  const paperCounts = years.map(year => paperCountByYear[year]);

  // 图表数据
  const paperData = {
    labels: years.length > 0 ? years : ['2021', '2022', '2023', '2024', '2025'],
    datasets: [
      {
        label: '论文发表数量',
        data: paperCounts.length > 0 ? paperCounts : [0, 0, 0, 0, 0],
        borderColor: '#0066ff',
        backgroundColor: 'rgba(0, 102, 255, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const projectCountByLevel = achievements
    .filter(a => a.type === 'project')
    .reduce((acc, project) => {
      const level = (project as any).level || 'other';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const projectData = {
    labels: Object.keys(projectCountByLevel).length > 0 
      ? Object.keys(projectCountByLevel).map(k => k === 'international' ? '国际级' : k === 'national' ? '国家级' : k === 'provincial' ? '省部级' : '其他')
      : ['国家级', '省部级', '横向项目'],
    datasets: [
      {
        label: '项目数量',
        data: Object.values(projectCountByLevel).length > 0 ? Object.values(projectCountByLevel) : [5, 12, 8],
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    title={achievement.title}
                    type={achievement.type}
                    authors={achievement.authors || []}
                    date={achievement.publish_date?.substring(0, 7) || '-'}
                    description={achievement.description}
                    link={achievement.link || '#'}
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
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AchievementsPage;
