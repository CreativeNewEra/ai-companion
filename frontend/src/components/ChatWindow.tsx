import React, { useState, useEffect, useRef } from 'react';
import ImageGenerator from './ImageGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageList } from './MessageList';
import { Sidebar } from './Sidebar';
import EmotionIndicator, { EmotionType } from './EmotionIndicator';
import PersonalityDisplay from './PersonalityDisplay';
import { Avatar } from './Avatar';

interface PersonalityTrait {
  name: string;
  value: number;
  description: string;
}

interface Message {
  id: string;
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

interface ChatWindowProps {
  messages?: Message[];
  onSubmit?: (message: string) => void;
  isLoading?: boolean;
  error?: string;
  modelService: any;
  personality?: {
    openness: PersonalityTrait;
    conscientiousness: PersonalityTrait;
    extraversion: PersonalityTrait;
    agreeableness: PersonalityTrait;
    neuroticism: PersonalityTrait;
  };
  emotion?: {
    primary: EmotionType;
    intensity: number;
    secondary?: EmotionType;
    secondaryIntensity?: number;
  };
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages = [],
  onSubmit = () => {},
  isLoading = false,
  error = '',
  modelService,
  personality,
  emotion
}) => {
  const [input, setInput] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showPersonalitySettings, setShowPersonalitySettings] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState(personality);
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchPersonalityState = async () => {
      try {
        const response = await fetch(`${modelService.baseUrl}/personality/current`);
        if (response.ok) {
          const data = await response.json();
          setCurrentPersonality(data);
        }
      } catch (error) {
        console.error('Failed to fetch personality state:', error);
      }
    };

    const fetchEmotionState = async () => {
      try {
        const response = await fetch(`${modelService.baseUrl}/emotions/current`);
        if (response.ok) {
          const data = await response.json();
          setCurrentEmotion(data);
        }
      } catch (error) {
        console.error('Failed to fetch emotion state:', error);
      }
    };

    fetchPersonalityState();
    fetchEmotionState();
  }, [modelService]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const togglePersonalitySettings = () => {
    setShowPersonalitySettings(!showPersonalitySettings);
  };

  const CHARACTER_LIMIT = 2000;
  const isApproachingLimit = input.length > CHARACTER_LIMIT * 0.9;

  return (
    <div className="flex flex-col h-screen bg-mesh dark:bg-dark-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-700">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Toggle Sidebar"
                aria-label="Toggle Sidebar"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="ml-4">
                <Avatar isUser={false} size="sm" />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePersonalitySettings}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Personality Settings"
                aria-label="Open Personality Settings"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarExpanded ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out z-30 w-72 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-700`}
        >
          <Sidebar
            isExpanded={isSidebarExpanded}
            onToggle={toggleSidebar}
            onPersonalityClick={togglePersonalitySettings}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex-1 overflow-hidden relative">
            <MessageList messages={messages} />

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/80 dark:from-dark-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-4 px-6 py-3 rounded-xl bg-white/50 dark:bg-dark-800/50 border border-gray-100/10 dark:border-dark-600/10 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="loading-dot" style={{ "--delay": "0s" } as React.CSSProperties} />
                    <div className="loading-dot" style={{ "--delay": "0.2s" } as React.CSSProperties} />
                    <div className="loading-dot" style={{ "--delay": "0.4s" } as React.CSSProperties} />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/80 dark:from-dark-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 dark:border-dark-700 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-royal/5 to-primary-electric/5 dark:from-primary-royal/10 dark:to-primary-electric/10 rounded-xl -m-0.5 blur-sm group-focus-within:blur-md transition-all duration-300"></div>
              <div className="relative flex items-end gap-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendButtonRef.current?.click();
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full p-4 rounded-2xl bg-white dark:bg-dark-700 
                           border border-gray-200 dark:border-dark-600 
                           focus:outline-none focus:border-primary-royal/50 dark:focus:border-primary-electric/50 
                           shadow-sm focus:shadow-lg transition-all duration-300 resize-none
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           text-gray-900 dark:text-light-100"
                  rows={1}
                  maxLength={CHARACTER_LIMIT}
                />

                <div className="flex gap-2 pb-4">
                  {/* Image Generation Button */}
                  <button
                    onClick={() => setShowImageGenerator(true)}
                    className="p-2 rounded-lg transition-all duration-300 text-primary-royal dark:text-primary-ice hover:bg-primary-royal hover:text-white dark:hover:bg-primary-electric dark:hover:text-white transform hover:scale-110"
                    aria-label="Generate image"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>

                  {/* Send Button */}
                  <button
                    ref={sendButtonRef}
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className={`p-2 rounded-lg transition-all duration-300
                              ${input.trim() 
                                ? 'text-primary-royal dark:text-primary-ice hover:bg-primary-royal hover:text-white dark:hover:bg-primary-electric dark:hover:text-white transform hover:scale-110 hover:rotate-12' 
                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
                    aria-label="Send message"
                  >
                    <svg
                      className="w-6 h-6"
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
                    </svg>
                  </button>
                </div>
              </div>

              {/* Character Count */}
              {input.length > 0 && (
                <div
                  className={`absolute bottom-4 right-24 text-sm transition-colors duration-200 ${
                    isApproachingLimit 
                      ? 'text-amber-500 dark:text-amber-400' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isApproachingLimit && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <span>
                      {input.length} / {CHARACTER_LIMIT}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPersonalitySettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-lg w-full shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-royal/5 to-primary-electric/5 dark:from-primary-royal/10 dark:to-primary-electric/10" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Personality Settings
                  </h2>
                  <button
                    onClick={togglePersonalitySettings}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {currentPersonality && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <PersonalityDisplay traits={currentPersonality} />
                    </motion.div>
                  )}
                  
                  {currentEmotion && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <EmotionIndicator emotion={currentEmotion} />
                    </motion.div>
                  )}
                </div>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={togglePersonalitySettings}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-primary-royal to-primary-electric text-white rounded-xl 
                           hover:from-primary-deep hover:to-primary-royal transform hover:scale-[1.02] active:scale-[0.98]
                           transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Close Settings
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showImageGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-4xl"
            >
              <ImageGenerator
                onClose={() => setShowImageGenerator(false)}
                onImageGenerated={(image, prompt, generationTime) => {
                  const imageMessage: Message = {
                    id: `img-${Date.now()}`,
                    content: prompt,
                    isUser: false,
                    timestamp: new Date().toISOString(),
                    type: 'image',
                    imageData: {
                      base64: image,
                      prompt,
                      generationTime
                    }
                  };
                  onSubmit(`Generated image: ${prompt}`);
                  setShowImageGenerator(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
