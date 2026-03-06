import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TimelineItemProps {
  title: string;
  date: string;
  children: ReactNode;
  className?: string;
}

interface TimelineProps {
  children: ReactNode;
  className?: string;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  date,
  children,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`relative pl-8 pb-8 ${className}`}
    >
      <div className="absolute left-0 top-0 w-4 h-4 bg-electric-blue rounded-full border-2 border-dark-gray"></div>
      <div className="absolute left-1.5 top-4 w-0.5 h-full bg-light-gray/20"></div>
      <div className="mb-1">
        <span className="text-sm text-neon-cyan font-rajdhani">{date}</span>
        <h3 className="text-lg font-orbitron font-semibold mt-1">{title}</h3>
      </div>
      <div className="text-light-gray">{children}</div>
    </motion.div>
  );
};

const Timeline: React.FC<TimelineProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

export default Timeline;