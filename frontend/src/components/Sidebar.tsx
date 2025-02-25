import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Settings, Brain, History, Loader2, Image } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useModel } from '../context/ModelContext';
import ModelSelector from './ModelSelector';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onPersonalityClick?: () => void;
}

export const Sidebar = ({ isExpanded, onToggle, onPersonalityClick }: SidebarProps) => {
  const { textModel, imageModel, setTextModel, setImageModel, modelService, isLoading, error } = useModel();
  
  return (
    <motion.div 
      initial={false}
      animate={{ width: isExpanded ? '20rem' : '4rem' }}
      className="bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm border-r dark:border-dark-700 flex flex-col"
    >
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between">
          <motion.h1 
            initial={false}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            className="font-bold text-xl bg-gradient-to-r from-primary-royal to-primary-electric bg-clip-text text-transparent"
          >
            AI Companion
          </motion.h1>
          <button 
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <MessageCircle className="w-5 h-5 text-primary-royal dark:text-primary-ice" />
          </button>
        </div>
        
        <motion.div 
          initial={false}
          animate={{ 
            opacity: isExpanded ? 1 : 0,
            scale: isExpanded ? 1 : 0.8
          }}
          className={`mt-8 space-y-6 ${isExpanded ? 'visible' : 'invisible'}`}
        >
          {/* Text Model Selector */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-royal/5 to-primary-electric/5 dark:from-dark-700 dark:to-dark-600 rounded-2xl border border-primary-royal/10 dark:border-dark-600">
              <div className="p-4">
                <h2 className="font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary-electric" />
                  AI Models
                </h2>
                
                {isLoading && (
                  <div className="flex items-center justify-center p-4" role="status">
                    <Loader2 className="w-6 h-6 text-primary-electric animate-spin" />
                    <span className="sr-only">Loading models...</span>
                  </div>
                )}
                
                {error && (
                  <div className="p-4 text-red-500 text-sm" role="alert">
                    {error}
                  </div>
                )}
                
                {!isLoading && !error && (
                  <div className="space-y-4">
                    {/* Text Model Selector */}
                    <ModelSelector 
                      modelService={modelService}
                      onModelSelect={setTextModel}
                      selectedModel={textModel || undefined}
                      modelType="text"
                    />
                    
                    {/* Image Model Selector */}
                    <ModelSelector 
                      modelService={modelService}
                      onModelSelect={setImageModel}
                      selectedModel={imageModel || undefined}
                      modelType="image"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Decorative gradient orb */}
            <div className="absolute -z-10 top-1/2 -translate-y-1/2 -right-24 w-48 h-48 bg-gradient-to-br from-primary-royal/10 to-primary-electric/5 rounded-full blur-3xl" />
          </div>
          
          <nav className="space-y-1">
            <button 
              onClick={onPersonalityClick}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Personality settings"
              title="Personality settings"
            >
              <Brain className="w-5 h-5 text-primary-electric" />
              <span className="font-medium">Personality</span>
            </button>
            <button 
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Memory settings"
              title="Memory settings"
            >
              <History className="w-5 h-5 text-primary-electric" />
              <span className="font-medium">Memory</span>
            </button>
            <button 
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="General settings"
              title="General settings"
            >
              <Settings className="w-5 h-5 text-primary-electric" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>
        </motion.div>
      </div>
      
      {/* Footer */}
      <div className={`p-4 border-t dark:border-dark-700 ${isExpanded ? 'block' : 'hidden'}`}>
        <ThemeToggle />
      </div>
    </motion.div>
  );
};
