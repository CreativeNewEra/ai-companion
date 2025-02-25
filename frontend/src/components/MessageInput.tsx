import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MAX_LENGTH = 2000;

export const MessageInput = ({ onSendMessage, isLoading }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      setMessage(newValue);
    }
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > MAX_LENGTH * 0.9;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative border border-gray-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 shadow-sm hover:border-gray-300 dark:hover:border-dark-600 focus-within:border-primary-electric/50 dark:focus-within:border-primary-electric/50 transition-colors"
    >
      <div className="w-full">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            className="w-full min-h-[24px] max-h-[200px] pr-24 resize-none
              bg-transparent
              border-0
              focus:ring-0
              text-gray-800 dark:text-light-100
              placeholder-gray-400 dark:placeholder-gray-500
              disabled:opacity-50 disabled:cursor-not-allowed
              p-3
              transition-all duration-200
              text-sm"
            rows={1}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <AnimatePresence>
              {message.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
              className={`text-[10px] font-medium ${
                isNearLimit 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}
                >
                  {characterCount}/{MAX_LENGTH}
                </motion.span>
              )}
            </AnimatePresence>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="btn-primary flex items-center justify-center
                bg-primary-royal hover:bg-primary-deep
                disabled:bg-gray-300 dark:disabled:bg-dark-700
                rounded-lg
                min-w-[28px] h-[28px]
                mr-3 mb-2"
            >
              {isLoading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5"
                >
                  <svg className="animate-spin" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" cy="12" r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </motion.div>
              ) : (
                <motion.svg 
                  className="w-5 h-5"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </motion.svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
