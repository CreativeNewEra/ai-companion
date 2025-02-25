import React, { createContext, useContext, useState } from 'react';

export interface ModelService {
  getCapabilityDescription: (capability: string) => string;
  getModels: () => Record<string, {
    name: string;
    capabilities: string[];
    groups: string[];
  }>;
  getCurrentModel: () => string;
  setCurrentModel: (type: string, name: string) => void;
}

interface ModelContextType {
  currentModel: string;
  setCurrentModel: (type: string, name: string) => void;
  modelService: ModelService;
  isLoading?: boolean;
  error?: string | null;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

interface ModelProviderProps {
  children: React.ReactNode;
  modelService: ModelService;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({ children, modelService }) => {
  const [currentModel, setCurrentModel] = useState(() => {
    const model = modelService.getCurrentModel();
    const [type, name] = model.split(':');
    return model;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = {
    currentModel,
    setCurrentModel: (type: string, name: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const modelName = `${type}:${name}`;
        modelService.setCurrentModel(type, name);
        setCurrentModel(modelName);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to switch model');
      } finally {
        setIsLoading(false);
      }
    },
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

export const useModelCapabilities = (modelName: string) => {
  const { modelService } = useModel();
  const models = modelService.getModels();
  
  if (!models[modelName]) {
    return [];
  }

  return models[modelName].capabilities.map(capability => ({
    name: capability,
    description: modelService.getCapabilityDescription(capability)
  }));
};

export const useModelGroups = (modelName: string) => {
  const { modelService } = useModel();
  const models = modelService.getModels();
  
  if (!models[modelName]) {
    return [];
  }

  return models[modelName].groups;
};
