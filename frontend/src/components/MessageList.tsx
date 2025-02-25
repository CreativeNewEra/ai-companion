import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelativeTime, formatMessageTime } from '../utils/timeUtils';
import { Avatar } from './Avatar';

interface Message {
  id: string | number;
  content: string;
  isUser: boolean;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  contextScore?: number;
  type?: 'text' | 'image';
  imageData?: {
    base64: string;
    prompt: string;
    generationTime: number;
  };
}

interface MessageListProps {
  messages: Message[];
}

const formatMessageContent = (message: Message) => {
  if (message.type === 'image' && message.imageData) {
    return (
      <div className="relative">
        <img
          src={`data:image/png;base64,${message.imageData.base64}`}
          alt={message.imageData.prompt}
          className="rounded-lg max-w-sm w-full"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs rounded-b-lg">
          <div className="font-medium">Generation Time: {message.imageData.generationTime.toFixed(2)}s</div>
          <div className="opacity-75 mt-0.5">{message.imageData.prompt}</div>
        </div>
      </div>
    );
  }

  // Handle code blocks in text messages
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const parts = message.content.split(codeBlockRegex);
  
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // This is a code block
      return (
        <pre key={index} className="text-sm bg-gray-100 dark:bg-dark-700 rounded-lg p-4 my-2 overflow-x-auto">
          <code>{part.trim()}</code>
        </pre>
      );
    }
    // This is regular text - handle Markdown-style code
    const inlineCodeRegex = /`([^`]+)`/g;
    const textParts = part.split(inlineCodeRegex);
    return (
      <span key={index}>
        {textParts.map((text, i) => (
          i % 2 === 1 ? (
            <code key={i} className="bg-gray-100 dark:bg-dark-700 rounded px-1.5 py-0.5 text-sm">
              {text}
            </code>
          ) : text
        ))}
      </span>
    );
  });
};

const MessageBubble = React.forwardRef<HTMLDivElement, { message: Message }>(({ message }, ref) => {
  const isUser = message.isUser;
  const showContextScore = !isUser && message.contextScore !== undefined;
  const showStatus = isUser && message.status;

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { type: "spring", stiffness: 300, damping: 25 }
        },
        exit: { 
          opacity: 0, 
          scale: 0.95, 
          transition: { duration: 0.2 }
        }
      }}
      className={`flex items-start gap-4 px-4 py-6 group hover:bg-gray-50/50 dark:hover:bg-dark-800/50 ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar with proper size and spacing */}
      <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'} pt-1`}>
        <Avatar isUser={isUser} size="md" />
      </div>

      {/* Message Content with improved layout */}
      <div
        className={`flex flex-col ${
          isUser ? 'items-end' : 'items-start'
        } max-w-2xl flex-grow space-y-1`}
      >
        {/* Message Bubble */}
        <div 
          className={`relative rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-primary-royal text-white ml-12' 
              : 'bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 mr-12'
          } shadow-sm`}
        >
          <div className={`text-sm leading-relaxed ${message.type === 'image' ? 'p-1' : ''}`}>
            {formatMessageContent(message)}
          </div>

          {/* Context Score Indicator */}
          {showContextScore && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-primary-electric/20"
              style={{ opacity: message.contextScore }}
            />
          )}
        </div>

        {/* Timestamp and Status */}
        <div
          className={`flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 px-1 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span>{formatMessageTime(message.timestamp)}</span>
          {showStatus && (
            <span className="flex items-center">
              {message.status === 'sending' && (
                <div className="flex gap-1">
                  <div className="loading-dot" style={{ "--delay": "0s" } as React.CSSProperties} />
                  <div className="loading-dot" style={{ "--delay": "0.2s" } as React.CSSProperties} />
                  <div className="loading-dot" style={{ "--delay": "0.4s" } as React.CSSProperties} />
                </div>
              )}
              {message.status === 'sent' && (
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {message.status === 'error' && (
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export const MessageList: React.FC<MessageListProps> = ({ messages = [] }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {messages.map((message, index) => (
            <MessageBubble
              key={`${message.id}-${message.timestamp}`}
              message={message}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
