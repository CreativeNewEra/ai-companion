import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type EmotionType = 
  | 'NEUTRAL'
  | 'JOY'
  | 'SADNESS'
  | 'ANGER'
  | 'FEAR'
  | 'SURPRISE'
  | 'TRUST'
  | 'ANTICIPATION';

interface EmotionState {
  primary: EmotionType;
  intensity: number;
  secondary?: EmotionType;
  secondaryIntensity?: number;
}

interface EmotionIndicatorProps {
  emotion: EmotionState;
  className?: string;
}

const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({ emotion, className = '' }) => {
  const getEmotionColor = (type: EmotionType): string => {
    const colors: Record<EmotionType, string> = {
      NEUTRAL: '#9CA3AF',      // Gray
      JOY: '#FCD34D',         // Yellow
      SADNESS: '#60A5FA',     // Blue
      ANGER: '#EF4444',       // Red
      FEAR: '#7C3AED',        // Purple
      SURPRISE: '#F472B6',    // Pink
      TRUST: '#34D399',       // Green
      ANTICIPATION: '#F59E0B'  // Orange
    };
    return colors[type];
  };

  const getEmotionIcon = (type: EmotionType): string => {
    const icons: Record<EmotionType, string> = {
      NEUTRAL: '😐',
      JOY: '😊',
      SADNESS: '😢',
      ANGER: '😠',
      FEAR: '😨',
      SURPRISE: '😮',
      TRUST: '🤝',
      ANTICIPATION: '🤔'
    };
    return icons[type];
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const fadeVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={emotion.primary}
          className="relative"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeVariants}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ 
              backgroundColor: getEmotionColor(emotion.primary),
              opacity: 0.2
            }}
            variants={pulseVariants}
          />
          <div className="relative z-10 flex items-center justify-center p-4">
            <span className="text-2xl" role="img" aria-label={emotion.primary.toLowerCase()}>
              {getEmotionIcon(emotion.primary)}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {emotion.primary.charAt(0) + emotion.primary.slice(1).toLowerCase()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Intensity: {Math.round(emotion.intensity * 100)}%
        </div>
        {emotion.secondary && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            with {emotion.secondary.charAt(0) + emotion.secondary.slice(1).toLowerCase()}
            {emotion.secondaryIntensity && 
              ` (${Math.round(emotion.secondaryIntensity * 100)}%)`
            }
          </div>
        )}
      </div>

      {/* Intensity Bar */}
      <div className="w-full mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ 
            backgroundColor: getEmotionColor(emotion.primary),
            width: `${emotion.intensity * 100}%`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${emotion.intensity * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default EmotionIndicator;
