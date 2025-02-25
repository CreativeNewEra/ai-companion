import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Model {
  name: string;
  type: string;
  modified_at?: string;
  size?: number;
}

interface ModelSelectorProps {
  modelService: any;
  onModelSelect: (modelId: string) => void;
  selectedModel?: string;
  modelType?: 'text' | 'image';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  modelService, 
  onModelSelect,
  selectedModel,
  modelType = 'text'
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [models, setModels] = useState<Model[]>([]);
  const [currentModel, setCurrentModel] = useState<string>(selectedModel || "");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const response = await modelService.listModels();
        
        if (response && response.models) {
          // Filter models by type if specified
          const filteredModels = modelType 
            ? response.models.filter((model: Model) => model.type === modelType)
            : response.models;
            
          setModels(filteredModels);
          
          // Set default model if none selected
          if (!currentModel && filteredModels.length > 0) {
            setCurrentModel(filteredModels[0].name);
            onModelSelect(filteredModels[0].name);
          }
        } else {
          setError("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching models:", err);
        setError("Failed to load models");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModels();
  }, [modelService, modelType, currentModel]);
  
  // Update if selectedModel prop changes
  useEffect(() => {
    if (selectedModel && selectedModel !== currentModel) {
      setCurrentModel(selectedModel);
    }
  }, [selectedModel, currentModel]);
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setCurrentModel(newModel);
    onModelSelect(newModel);
  };
  
  const modelTypeLabel = modelType === 'image' ? 'Image' : 'Text';
  
  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} border ${isDarkMode ? 'border-dark-600' : 'border-gray-200'}`}>
      <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Select {modelTypeLabel} Model
      </h3>
      
      {isLoading ? (
        <div className="flex items-center space-x-2 py-2">
          <div className="animate-pulse w-4 h-4 rounded-full bg-primary-royal"></div>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading models...
          </span>
        </div>
      ) : error ? (
        <div className={`text-sm text-red-500 py-2`}>
          {error}
        </div>
      ) : models.length === 0 ? (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} py-2`}>
          No {modelType} models available
        </div>
      ) : (
        <select 
          value={currentModel}
          onChange={handleModelChange}
          aria-label={`Select ${modelTypeLabel} Model`}
          title={`Select ${modelTypeLabel} Model`}
          className={`w-full p-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-dark-700 border-dark-600 text-gray-200' 
              : 'bg-white border-gray-200 text-gray-800'
          } focus:outline-none focus:ring-2 focus:ring-primary-royal/50`}
        >
          {models.map(model => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
      )}
      
      {currentModel && !isLoading && !error && (
        <div className="mt-2">
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Current model: <span className="font-medium">{currentModel}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
