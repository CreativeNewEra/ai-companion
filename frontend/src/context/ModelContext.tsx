import React, { createContext, useContext, useState, useEffect } from 'react';
import ModelService from '../services/ModelService';

interface ModelContextType {
  textModel: string | null;
  imageModel: string | null;
  setTextModel: (modelId: string) => void;
  setImageModel: (modelId: string) => void;
  modelService: ModelService;
  isLoading: boolean;
  error: string | null;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

interface ModelProviderProps {
  children: React.ReactNode;
  modelService: ModelService;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({ children, modelService }) => {
  const [textModel, setTextModelState] = useState<string | null>(() => {
    return localStorage.getItem('currentTextModel') || null;
  });
  
  const [imageModel, setImageModelState] = useState<string | null>(() => {
    return localStorage.getItem('currentImageModel') || null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize models from API on first load
  useEffect(() => {
    const initializeModels = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await modelService.listModels();
        
        if (response && response.models && response.models.length > 0) {
          // Find text models
          const textModels = response.models.filter(model => model.type === 'text');
          if (textModels.length > 0 && !textModel) {
            const defaultTextModel = textModels[0].name;
            setTextModelState(defaultTextModel);
            modelService.setCurrentTextModel(defaultTextModel);
          }
          
          // Find image models
          const imageModels = response.models.filter(model => model.type === 'image');
          if (imageModels.length > 0 && !imageModel) {
            const defaultImageModel = imageModels[0].name;
            setImageModelState(defaultImageModel);
            modelService.setCurrentImageModel(defaultImageModel);
          }
        }
      } catch (err) {
        console.error('Failed to initialize models:', err);
        setError('Failed to load models');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeModels();
  }, [modelService]);
  
  const setTextModel = (modelId: string) => {
    setTextModelState(modelId);
    modelService.setCurrentTextModel(modelId);
  };
  
  const setImageModel = (modelId: string) => {
    setImageModelState(modelId);
    modelService.setCurrentImageModel(modelId);
  };

  const value = {
    textModel,
    imageModel,
    setTextModel,
    setImageModel,
    modelService,
    isLoading,
    error,
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};
