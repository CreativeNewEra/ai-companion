import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Settings, Wand2, Brain, History, Loader2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useModel, useModelCapabilities } from '../context/ModelContext';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onPersonalityClick?: () => void;
}

type ModelCapability = 
  | 'chat'
  | 'instruction_following'
  | 'code_generation'
  | 'code_analysis'
  | 'function_calling'
  | 'advanced_reasoning'
  | 'extended_context';

const MODEL_CAPABILITIES: Record<string, ModelCapability[]> = {
  // Ollama Models
  'ollama:llama2': ['chat', 'instruction_following'],
  'ollama:mistral': ['chat', 'instruction_following'],
  'ollama:codellama': ['chat', 'code_generation', 'code_analysis'],
  'ollama:neural-chat': ['chat', 'instruction_following'],
  'ollama:starling-lm': ['chat', 'instruction_following'],
  'ollama:dolphin-phi': ['chat', 'instruction_following'],
  
  // OpenAI Models
  'openai:gpt-3.5-turbo': ['chat', 'function_calling'],
  'openai:gpt-4': ['chat', 'function_calling', 'advanced_reasoning'],
  'openai:gpt-4-turbo': ['chat', 'function_calling', 'advanced_reasoning', 'extended_context'],
  
  // GGUF Models
  'gguf:mixtral-8x7b': ['chat', 'function_calling', 'advanced_reasoning'],
  'gguf:gemma-7b': ['chat', 'instruction_following'],
  'gguf:phi-2': ['chat', 'code_generation']
};

const getModelCapabilities = (modelId: string): ModelCapability[] => {
  return MODEL_CAPABILITIES[modelId] || [];
};

export const Sidebar = ({ isExpanded, onToggle, onPersonalityClick }: SidebarProps) => {
  const { currentModel, setCurrentModel, modelService, isLoading, error } = useModel();
  const modelCapabilities = useModelCapabilities(currentModel);
  const models = modelService.getModels();
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
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-primary-royal/5 to-primary-electric/5 dark:from-dark-700 dark:to-dark-600 rounded-2xl border border-primary-royal/10 dark:border-dark-600">
              <h2 className="font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary-electric" />
                Current Model
              </h2>
              <div className="space-y-4">
                {isLoading && (
                  <div className="flex items-center justify-center p-4" role="status">
                    <Loader2 className="w-6 h-6 text-primary-electric animate-spin" />
                    <span className="sr-only">Loading...</span>
                  </div>
                )}
                {error && (
                  <div className="p-4 text-red-500 text-sm" role="alert">
                    {error}
                  </div>
                )}
                {!isLoading && !error && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ollama Models
                    </label>
                    <select 
                      value={currentModel}
                      onChange={(e) => {
                          const [type, name] = e.target.value.split(':');
                          setCurrentModel(type, name);
                      }}
                      className="w-full p-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-electric/50 focus:border-primary-electric transition-all duration-200"
                      aria-label="Select Ollama model"
                      title="Select Ollama model"
                    >
                      <option value="">Select Model</option>
                      {Object.entries(models).map(([modelName, model]) => (
                        <option key={modelName} value={modelName}>
                          {modelName.split(/[-_:]/).map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </option>
                      ))}
                    </select>

                    {/* Model capabilities indicator */}
                    {currentModel && models[currentModel] && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Model Capabilities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {modelCapabilities.map((capability) => (
                            <div 
                              key={capability.name}
                              className="px-2 py-1 bg-primary-electric/10 dark:bg-dark-700 rounded-md text-xs text-primary-electric dark:text-primary-ice group relative"
                              title={capability.description}
                            >
                              {capability.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Decorative gradient orb */}
            <div className="absolute -z-10 top-1/2 -translate-y-1/2 -right-24 w-48 h-48 bg-gradient-to-br from-primary-royal/10 to-primary-electric/5 rounded-full blur-3xl" />
          </div>
          
          <nav className="space-y-1">
            <button 
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
