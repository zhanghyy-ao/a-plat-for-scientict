import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';

interface AchievementCardProps {
  title: string;
  type: 'paper' | 'project' | 'award' | 'patent';
  authors: string[];
  date: string;
  description?: string;
  link?: string;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  type,
  authors,
  date,
  description,
  link,
  className = '',
}) => {
  const typeLabels = {
    paper: '论文',
    project: '项目',
    award: '获奖',
    patent: '专利',
  };

  const typeColors = {
    paper: 'bg-blue-500',
    project: 'bg-green-500',
    award: 'bg-yellow-500',
    patent: 'bg-purple-500',
  };

  return (
    <Card hoverable className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeColors[type]} text-white`}>
            {typeLabels[type]}
          </span>
          <span className="text-sm text-light-gray">{date}</span>
        </div>
        <h3 className="text-lg font-orbitron font-semibold mb-3">{title}</h3>
        <p className="text-sm text-light-gray mb-4">
          作者：{authors.join(', ')}
        </p>
        {description && (
          <p className="text-sm text-light-gray mb-4">{description}</p>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-electric-blue hover:underline flex items-center"
          >
            查看详情
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </motion.div>
    </Card>
  );
};

export default AchievementCard;