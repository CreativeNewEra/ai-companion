import React from 'react';
import { motion } from 'framer-motion';

interface PersonalityTrait {
  name: string;
  value: number;
  description: string;
}

interface PersonalityDisplayProps {
  traits: {
    openness: PersonalityTrait;
    conscientiousness: PersonalityTrait;
    extraversion: PersonalityTrait;
    agreeableness: PersonalityTrait;
    neuroticism: PersonalityTrait;
  };
  className?: string;
}

const PersonalityDisplay: React.FC<PersonalityDisplayProps> = ({ traits, className = '' }) => {
  const getTraitColor = (value: number): string => {
    // Color gradient from cool to warm based on trait value
    const hue = 200 - (value * 120); // 200 (blue) to 80 (green-yellow)
    return `hsl(${hue}, 70%, 50%)`;
  };

  const traitVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { 
      width: 'auto',
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Personality Profile
      </h2>
      <div className="space-y-4">
        {Object.entries(traits).map(([key, trait]) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {trait.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(trait.value * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: getTraitColor(trait.value),
                  width: `${trait.value * 100}%`
                }}
                initial="initial"
                animate="animate"
                variants={traitVariants}
              />
            </div>
            <motion.p 
              className="text-xs text-gray-500 dark:text-gray-400 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {trait.description}
            </motion.p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalityDisplay;
