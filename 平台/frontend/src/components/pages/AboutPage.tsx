import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import TeamMemberCard from '../ui/TeamMemberCard';
import Timeline, { TimelineItem } from '../common/Timeline';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  // 模拟数据
  const labHistory = [
    {
      title: '实验室成立',
      date: '2010年',
      description: '计算机学院实验室正式成立，开始招收第一批研究生。',
    },
    {
      title: '获批重点实验室',
      date: '2015年',
      description: '被评为学校重点实验室，获得更多科研资源支持。',
    },
    {
      title: '扩建研究团队',
      date: '2018年',
      description: '引进多名高水平研究人员，团队规模扩大到20人。',
    },
    {
      title: '获得国家级项目',
      date: '2020年',
      description: '成功获批国家自然科学基金重点项目，研究经费大幅增加。',
    },
    {
      title: '成果转化突破',
      date: '2023年',
      description: '多项研究成果实现产业化，与多家企业建立合作关系。',
    },
    {
      title: '国际合作拓展',
      date: '2025年',
      description: '与美国、欧洲多所高校建立国际合作关系，开展联合研究。',
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
    {
      id: 5,
      name: '钱博士',
      position: '研究员',
      researchArea: '自然语言处理、知识图谱',
      email: 'qian@computer.edu.cn',
    },
    {
      id: 6,
      name: '孙博士',
      position: '助理研究员',
      researchArea: '大数据分析、数据挖掘',
      email: 'sun@computer.edu.cn',
    },
  ];

  const researchAreas = [
    {
      title: '人工智能',
      description: '深度学习、机器学习、强化学习、自然语言处理、知识图谱等方向的研究。',
      achievements: '发表高水平论文50余篇，获批国家自然科学基金项目10项。',
    },
    {
      title: '计算机视觉',
      description: '图像识别、目标检测、视频分析、三维重建、医学影像处理等方向的研究。',
      achievements: '开发了多个视觉识别系统，获得省部级科技进步奖2项。',
    },
    {
      title: '机器人技术',
      description: '智能控制、自主导航、人机交互、多机器人协同等方向的研究。',
      achievements: '研发了多款智能机器人原型，申请专利15项。',
    },
    {
      title: '网络安全',
      description: '密码学、网络防护、安全协议、隐私计算等方向的研究。',
      achievements: '开发了网络安全检测系统，为多家企业提供安全服务。',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="关于我们" subtitle="了解计算机学院实验室的历史、团队和研究方向" />

      {/* 实验室简介 */}
      <section className="py-20 bg-dark-gray/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-lg overflow-hidden shadow-2xl"
            >
              <img
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20computer%20science%20laboratory%20with%20advanced%20equipment%20and%20researchers&image_size=landscape_16_9"
                alt="实验室环境"
                className="w-full h-auto"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
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
              <p className="text-light-gray mb-6">
                实验室拥有一支高水平的研究团队，包括教授、副教授、讲师和博士后等多名研究人员。我们与国内外多所高校和企业保持着密切的合作关系，共同推动技术创新和成果转化。
              </p>
              <p className="text-light-gray">
                实验室配备了先进的科研设备和计算资源，为研究人员提供了良好的工作环境。我们欢迎优秀的学生和研究人员加入我们的团队，共同探索计算机科学的前沿领域。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 实验室历史 */}
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
              实验室历史
            </h2>
            <div className="w-20 h-1 bg-electric-blue mx-auto"></div>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Timeline>
              {labHistory.map((item, index) => (
                <TimelineItem key={index} title={item.title} date={item.date}>
                  {item.description}
                </TimelineItem>
              ))}
            </Timeline>
          </div>
        </div>
      </section>

      {/* 研究方向 */}
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
              研究方向
            </h2>
            <div className="w-20 h-1 bg-electric-blue mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {researchAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-8 hover:border-electric-blue transition-colors"
              >
                <h3 className="text-xl font-orbitron font-semibold mb-4 text-electric-blue">
                  {area.title}
                </h3>
                <p className="text-light-gray mb-4">{area.description}</p>
                <p className="text-sm text-neon-cyan">{area.achievements}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 团队成员 */}
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
              团队成员
            </h2>
            <div className="w-20 h-1 bg-electric-blue mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;