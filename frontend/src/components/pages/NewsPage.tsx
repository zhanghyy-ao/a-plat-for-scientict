import React, { useState, useEffect } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import NewsCard from '../ui/NewsCard';
import { motion } from 'framer-motion';
import { newsApi } from '../../utils/api';

interface NewsItem {
  id: string;
  title: string;
  category: 'academic' | 'admission' | 'cooperation' | 'event';
  publish_date: string;
  content: string;
  author: string;
  view_count: number;
}

const NewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'academic' | 'admission' | 'cooperation' | 'event'>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await newsApi.getNews();
      setNews(data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤新闻
  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      academic: '学术活动',
      admission: '招生信息',
      cooperation: '合作交流',
      event: '实验室活动'
    };
    return labels[category] || category;
  };

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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.map((newsItem) => (
                  <NewsCard
                    key={newsItem.id}
                    title={newsItem.title}
                    category={newsItem.category}
                    date={newsItem.publish_date}
                    summary={newsItem.content}
                    image={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(newsItem.title)}&image_size=landscape_16_9`}
                    link="#"
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
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsPage;
