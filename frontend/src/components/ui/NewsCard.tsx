import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';

interface NewsCardProps {
  title: string;
  category: 'academic' | 'admission' | 'cooperation' | 'event';
  date: string;
  summary: string;
  image?: string;
  link?: string;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  category,
  date,
  summary,
  image,
  link,
  className = '',
}) => {
  const categoryLabels = {
    academic: '学术活动',
    admission: '招生信息',
    cooperation: '合作交流',
    event: '实验室活动',
  };

  const categoryColors = {
    academic: 'bg-blue-500',
    admission: 'bg-green-500',
    cooperation: 'bg-purple-500',
    event: 'bg-orange-500',
  };

  return (
    <Card hoverable className={className} onClick={link ? () => window.location.href = link : undefined}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        {image && (
          <div className="h-48 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColors[category]} text-white`}>
              {categoryLabels[category]}
            </span>
            <span className="text-sm text-light-gray">{date}</span>
          </div>
          <h3 className="text-lg font-orbitron font-semibold mb-3">{title}</h3>
          <p className="text-sm text-light-gray mb-4">{summary}</p>
          {link && (
            <a
              href={link}
              className="text-sm text-electric-blue hover:underline flex items-center"
            >
              阅读更多
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          )}
        </div>
      </motion.div>
    </Card>
  );
};

export default NewsCard;