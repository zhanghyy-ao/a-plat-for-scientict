import React, { useState } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import NewsCard from '../ui/NewsCard';
import { motion } from 'framer-motion';

const NewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'academic' | 'admission' | 'cooperation' | 'event'>('all');

  // 模拟数据
  const news = [
    {
      id: 1,
      title: '实验室成功举办2026年计算机科学前沿研讨会',
      category: 'academic' as const,
      date: '2026-02-20',
      summary: '本次研讨会邀请了多位国内外知名学者，共同探讨计算机科学领域的最新研究成果和发展趋势。研讨会涵盖了人工智能、计算机视觉、机器人技术等多个前沿领域的研究进展，为与会者提供了一个交流和学习的平台。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=academic%20conference%20with%20people%20discussing%20computer%20science%20topics%20in%20a%20modern%20lab&image_size=landscape_16_9',
      link: '#',
    },
    {
      id: 2,
      title: '2026年秋季招生开始，欢迎优秀学子加入',
      category: 'admission' as const,
      date: '2026-02-15',
      summary: '实验室面向全国招收优秀的本科生、研究生和博士生，提供良好的研究环境和学术氛围。我们欢迎对人工智能、计算机视觉、机器人技术、网络安全等方向感兴趣的同学加入我们的团队。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=university%20admission%20information%20poster%20with%20students%20and%20campus%20background&image_size=landscape_16_9',
      link: '#',
    },
    {
      id: 3,
      title: '实验室与多家企业达成合作协议',
      category: 'cooperation' as const,
      date: '2026-02-10',
      summary: '为促进产学研结合，实验室与多家知名企业签署了合作协议，共同推动技术创新和成果转化。合作内容包括联合研发、人才培养、技术咨询等多个方面，将为实验室的研究提供更多实际应用场景。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20partnership%20signing%20ceremony%20between%20university%20lab%20and%20companies&image_size=landscape_16_9',
      link: '#',
    },
    {
      id: 4,
      title: '实验室举办2026年新年茶话会',
      category: 'event' as const,
      date: '2026-01-30',
      summary: '为庆祝新年的到来，实验室举办了2026年新年茶话会，全体师生欢聚一堂，总结过去一年的成果，展望新一年的发展。茶话会上还进行了丰富多彩的互动活动，增进了师生之间的感情。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=university%20lab%20new%20year%20party%20with%20students%20and%20teachers%20celebrating&image_size=landscape_16_9',
      link: '#',
    },
    {
      id: 5,
      title: '实验室研究成果在国际顶级期刊发表',
      category: 'academic' as const,
      date: '2026-01-20',
      summary: '实验室的一项研究成果在国际顶级期刊《Nature Computer Science》上发表，该成果提出了一种新的深度学习模型，在图像识别任务上取得了突破性进展。这是实验室在人工智能领域的又一重要成果。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=research%20paper%20published%20in%20top%20journal%20with%20scientists%20celebrating&image_size=landscape_16_9',
      link: '#',
    },
    {
      id: 6,
      title: '实验室与国外高校开展联合研究项目',
      category: 'cooperation' as const,
      date: '2026-01-15',
      summary: '实验室与美国斯坦福大学计算机科学系签署了联合研究协议，共同开展人工智能领域的前沿研究。该项目将结合双方的优势，在深度学习、计算机视觉等方向进行深入合作。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=international%20research%20collaboration%20between%20universities%20with%20scientists%20discussing&image_size=landscape_16_9',
      link: '#',
    },
  ];

  // 过滤新闻
  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="新闻公告" subtitle="了解实验室的最新动态、学术活动和招生信息" />

      {/* 新闻筛选 */}
      <section className="py-12 bg-dark-gray/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { value: 'all', label: '全部' },
              { value: 'academic', label: '学术活动' },
              { value: 'admission', label: '招生信息' },
              { value: 'cooperation', label: '合作交流' },
              { value: 'event', label: '实验室活动' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveCategory(filter.value as any)}
                className={`
                  px-6 py-2 rounded-full font-rajdhani font-medium transition-all
                  ${activeCategory === filter.value 
                    ? 'bg-electric-blue text-white' 
                    : 'bg-dark-gray/50 text-light-gray hover:bg-electric-blue/20'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 新闻列表 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                title={newsItem.title}
                category={newsItem.category}
                date={newsItem.date}
                summary={newsItem.summary}
                image={newsItem.image}
                link={newsItem.link}
              />
            ))}
          </div>

          {/* 空状态 */}
          {filteredNews.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-light-gray text-lg">暂无相关新闻</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsPage;