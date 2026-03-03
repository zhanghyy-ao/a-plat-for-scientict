import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import HeroSection from '../ui/HeroSection';
import NewsCard from '../ui/NewsCard';
import AchievementCard from '../ui/AchievementCard';
import TeamMemberCard from '../ui/TeamMemberCard';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  // 模拟数据
  const latestNews = [
    {
      id: 1,
      title: '实验室成功举办2026年计算机科学前沿研讨会',
      category: 'academic' as const,
      date: '2026-02-20',
      summary: '本次研讨会邀请了多位国内外知名学者，共同探讨计算机科学领域的最新研究成果和发展趋势。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=academic%20conference%20with%20people%20discussing%20computer%20science%20topics%20in%20a%20modern%20lab&image_size=landscape_16_9',
    },
    {
      id: 2,
      title: '2026年秋季招生开始，欢迎优秀学子加入',
      category: 'admission' as const,
      date: '2026-02-15',
      summary: '实验室面向全国招收优秀的本科生、研究生和博士生，提供良好的研究环境和学术氛围。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=university%20admission%20information%20poster%20with%20students%20and%20campus%20background&image_size=landscape_16_9',
    },
    {
      id: 3,
      title: '实验室与多家企业达成合作协议',
      category: 'cooperation' as const,
      date: '2026-02-10',
      summary: '为促进产学研结合，实验室与多家知名企业签署了合作协议，共同推动技术创新和成果转化。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20partnership%20signing%20ceremony%20between%20university%20lab%20and%20companies&image_size=landscape_16_9',
    },
  ];

  const keyAchievements = [
    {
      id: 1,
      title: '基于深度学习的图像识别算法研究',
      type: 'paper' as const,
      authors: ['张三', '李四', '王五'],
      date: '2026-01',
      description: '提出了一种新的深度学习模型，在ImageNet数据集上取得了state-of-the-art的性能。',
    },
    {
      id: 2,
      title: '智能机器人控制系统开发',
      type: 'project' as const,
      authors: ['赵六', '钱七', '孙八'],
      date: '2025-12',
      description: '开发了一套基于强化学习的智能机器人控制系统，实现了自主导航和操作。',
    },
    {
      id: 3,
      title: '计算机视觉技术在医疗领域的应用',
      type: 'award' as const,
      authors: ['周九', '吴十'],
      date: '2025-11',
      description: '该项目获得了国家科技进步二等奖，为医疗诊断提供了新的技术手段。',
    },
  ];

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

  const teamMembers = [
    {
      id: 1,
      name: '张教授',
      position: '实验室主任',
      researchArea: '人工智能、机器学习',
      email: 'zhang@computer.edu.cn',
    },
    {
      id: 2,
      name: '李副教授',
      position: '副主任',
      researchArea: '计算机视觉、图像处理',
      email: 'li@computer.edu.cn',
    },
    {
      id: 3,
      name: '王讲师',
      position: '研究员',
      researchArea: '机器人技术、智能控制',
      email: 'wang@computer.edu.cn',
    },
    {
      id: 4,
      name: '赵助教',
      position: '博士后',
      researchArea: '网络安全、密码学',
      email: 'zhao@computer.edu.cn',
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((news) => (
              <NewsCard
                key={news.id}
                title={news.title}
                category={news.category}
                date={news.date}
                summary={news.summary}
                image={news.image}
              />
            ))}
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {keyAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                title={achievement.title}
                type={achievement.type}
                authors={achievement.authors}
                date={achievement.date}
                description={achievement.description}
              />
            ))}
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                name={member.name}
                position={member.position}
                researchArea={member.researchArea}
                email={member.email}
              />
            ))}
          </div>

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