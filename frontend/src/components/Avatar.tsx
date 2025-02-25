import { motion } from 'framer-motion';

interface AvatarProps {
  isUser: boolean;
  size?: 'sm' | 'md' | 'lg';
  imageUrl?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export const Avatar = ({ isUser, size = 'md' }: AvatarProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        flex items-center justify-center 
        shadow-lg
        ${isUser ? 
          'bg-gradient-to-br from-primary-royal to-primary-electric text-white' : 
          'relative group'
        }
        transition-all duration-200
      `}
    >
      {/* AI Avatar Glow Effect */}
      {!isUser && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-ice/20 to-primary-electric/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
      )}

      {isUser ? (
        <motion.svg
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-1/2 h-1/2 text-light-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </motion.svg>
      ) : (
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary-royal/10 to-primary-electric/10 p-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-royal/5 to-primary-electric/5 rounded-full" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <svg className="w-2/3 h-2/3 text-primary-electric" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4"
              />
            </svg>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
