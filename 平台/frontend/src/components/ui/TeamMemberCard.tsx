import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';

interface TeamMemberCardProps {
  name: string;
  position: string;
  researchArea: string;
  avatar?: string;
  email?: string;
  className?: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  name,
  position,
  researchArea,
  avatar,
  email,
  className = '',
}) => {
  return (
    <Card hoverable className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="p-6"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-electric-blue">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center">
                <span className="text-xl font-orbitron font-bold text-white">
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <h3 className="text-lg font-orbitron font-semibold mb-1">{name}</h3>
          <p className="text-electric-blue text-sm mb-2">{position}</p>
          <p className="text-light-gray text-sm mb-4">{researchArea}</p>
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-sm text-neon-cyan hover:underline"
            >
              {email}
            </a>
          )}
        </div>
      </motion.div>
    </Card>
  );
};

export default TeamMemberCard;