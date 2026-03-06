import React, { useState, useEffect } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import HeroSection from '../ui/HeroSection';
import NewsCard from '../ui/NewsCard';
import AchievementCard from '../ui/AchievementCard';
import TeamMemberCard from '../ui/TeamMemberCard';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MentorLayout from '../layout/MentorLayout';
import GlassMentorDashboard from './mentor/GlassMentorDashboard';
import { newsApi, achievementApi, mentorApi } from '../../utils/api';

interface NewsItem {
  id: string;
  title: string;
  category: 'academic' | 'admission' | 'cooperation' | 'event';
  publish_date: string;
  content: string;
}

interface Achievement {
  id: string;
  title: string;
  type: 'paper' | 'project' | 'award' | 'patent';
  authors: string[];
  publish_date: string;
  description: string;
}

interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  research_direction: string;
  email?: string;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [keyAchievements, setKeyAchievements] = useState<Achievement[]>([]);
  const [teamMembers, setTeamMembers] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [newsData, achievementsData, mentorsData] = await Promise.all([
        newsApi.getNews(),
        achievementApi.getAchievements(),
        mentorApi.getMentors()
      ]);
      
      // 只取最新的3条新闻
      setLatestNews(newsData.slice(0, 3));
      
      // 只取最新的3个成果
      setKeyAchievements(achievementsData.slice(0, 3));
      
      // 只取前4个导师
      setTeamMembers(mentorsData.slice(0, 4));
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'mentor') {
    return (
      <MentorLayout>
        <GlassMentorDashboard />
      </MentorLayout>
    );
  }

  const researchAreas = [
    {
      title: '人工智能',
      description: '深度学习、机器学习、自然语言处理',
      icon: '🤖',
    },
    {
      title: '计算机视觉',
      description: '图像识别、目标检测、视频分析',
      icon: '👁️',
    },
    {
      title: '机器人技术',
      description: '智能控制、自主导航、人机交互',
      icon: '🤖',
    },
    {
      title: '网络安全',
      description: '密码学、网络防护、安全协议',
      icon: '🔒',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header showNavbar={true} />
      
      {/* 英雄区 */}
      <HeroSection
        title="计算机学院实验室"
        subtitle="致力于前沿计算机科学研究，培养优秀人才，推动技术创新"
        buttonText="了解更多"
        buttonLink="/about"
        secondaryButtonText="加入我们"
        secondaryButtonLink="/contact"
      />

      {/* 实验室简介 */}
      <section className="py-20 bg-dark-gray/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              关于我们
            </h2>
            <div className="w-20 h-1 bg-electric-blue mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-orbitron font-semibold mb-4 text-electric-blue">
                实验室简介
              </h3>
              <p className="text-light-gray mb-6">
                计算机学院实验室成立于2010年，是学校重点建设的科研机构之一。实验室致力于计算机科学领域的前沿研究，涵盖人工智能、计算机视觉、机器人技术、网络安全等多个方向。
              </p>
              <p className="text-light-gray mb-8">
                实验室拥有一支高水平的研究团队，包括教授、副教授、讲师和博士后等多名研究人员。我们与国内外多所高校和企业保持着密切的合作关系，共同推动技术创新和成果转化。
              </p>
              <Button href="/about">了解详情</Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-lg overflow-hidden shadow-2xl"
            >
              <img
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20computer%20science%20lab%20with%20high-tech%20equipment%20and%20researchers%20working&image_size=landscape_16_9"
                alt="实验室环境"
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 最新动态 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              最新动态
            </h2>
            <div className="w-20 h-1 bg-electric-blue mx-auto"></div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestNews.map((news) => (
                  <NewsCard
                    key={news.id}
                    title={news.title}
                    category={news.category}
                    date={news.publish_date}
                    summary={news.content}
                    image={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(news.title)}&image_size=landscape_16_9`}
                  />
                ))}
              </div>

              {latestNews.length === 0 && (
                <div className="text-center py-12 text-light-gray">
                  暂无新闻数据
                </div>
              )}
            </>
          )}

          <div className="text-center mt-12">
            <Button variant="outline" href="/news">
              查看更多新闻
            </Button>
          </div>
        </div>
      </section>

      {/* 核心成果 */}
      <section className="py-20 bg-dark-gray/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              核心成果
            </h2>
            <div className="w-20 h-1 bg-electric-blue mx-auto"></div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {keyAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    title={achievement.title}
                    type={achievement.type}
                    authors={achievement.authors || []}
                    date={achievement.publish_date?.substring(0, 7) || '-'}
                    description={achievement.description}
                  />
                ))}
              </div>

              {keyAchievements.length === 0 && (
                <div className="text-center py-12 text-light-gray">
                  暂无成果数据
                </div>
              )}
            </>
          )}

          <div className="text-center mt-12">
            <Button variant="outline" href="/achievements">
              查看更多成果
            </Button>
          </div>
        </div>
      </section>

      {/* 研究方向 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              研究方向
            </h2>
            <div className="w-20 h-1 bg-electric-blue mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {researchAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-8 text-center hover:border-electric-blue transition-colors"
              >
                <div className="text-4xl mb-4">{area.icon}</div>
                <h3 className="text-xl font-orbitron font-semibold mb-2">
                  {area.title}
                </h3>
                <p className="text-light-gray">{area.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 团队成员 */}
      <section className="py-20 bg-dark-gray/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              团队成员
            </h2>
            <div className="w-20 h-1 bg-electric-blue mx-auto"></div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    name={member.name}
                    position={member.title}
                    researchArea={member.research_direction || member.department}
                    email={member.email || ''}
                  />
                ))}
              </div>

              {teamMembers.length === 0 && (
                <div className="text-center py-12 text-light-gray">
                  暂无团队成员数据
                </div>
              )}
            </>
          )}

          <div className="text-center mt-12">
            <Button variant="outline" href="/about">
              查看全部成员
            </Button>
          </div>
        </div>
      </section>

      {/* 联系方式 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Link to="/contact" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-electric-blue/20 to-neon-cyan/10 rounded-xl p-8 md:p-12 border border-electric-blue/30 cursor-pointer hover:shadow-lg hover:shadow-electric-blue/20 transition-all"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
                  联系我们
                </h2>
                <p className="text-light-gray max-w-2xl mx-auto">
                  如果您对我们的研究感兴趣，或者想加入我们的团队，欢迎随时联系我们。
                </p>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
