import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-3 rounded-xl bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-700/50 dark:to-dark-800/30
        hover:from-primary-ice/20 hover:to-primary-royal/5 dark:hover:from-primary-electric/10 dark:hover:to-primary-royal/5
        focus:outline-none focus:ring-2 focus:ring-primary-electric/50 group
        transition-all duration-200 backdrop-blur-sm border border-white/10 dark:border-dark-600"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={false}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0.9 : 1,
          rotate: isDark ? 0 : 180,
        }}
        transition={{ type: "spring", duration: 0.4 }}
      >
        {isDark ? (
          <motion.svg
            className="w-5 h-5 text-primary-ice drop-shadow-glow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </motion.svg>
        ) : (
          <motion.svg
            className="w-5 h-5 text-primary-royal drop-shadow-glow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ opacity: 0, rotate: 45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -45 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </motion.svg>
        )}
      </motion.div>
      
      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300
        ${isDark 
          ? 'bg-gradient-to-br from-primary-electric/20 to-primary-royal/5' 
          : 'bg-gradient-to-br from-primary-royal/10 to-primary-ice/5'} 
        opacity-0 group-hover:opacity-100 blur-sm`} 
      />
      
      {/* Status indicator */}
      <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full
        ${isDark 
          ? 'bg-primary-electric shadow-lg shadow-primary-electric/20' 
          : 'bg-primary-royal shadow-lg shadow-primary-royal/20'}`} 
      />
    </motion.button>
  );
};
