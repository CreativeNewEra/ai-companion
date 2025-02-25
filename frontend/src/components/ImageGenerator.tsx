import React, { useState, useEffect, useRef } from 'react';
import ModelService, { ImageGenerationRequest, ImageGenerationResponse } from '../services/ModelService';

interface ImageGeneratorProps {
  onClose?: () => void;
  onImageGenerated?: (image: string, prompt: string, generationTime: number) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onClose, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<'flux' | 'sdxl'>('flux');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResponse | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    negative_prompt: '',
    num_inference_steps: 30,
    guidance_scale: 7.5,
    width: 1024,
    height: 1024
  });

  const advancedButtonRef = useRef<HTMLButtonElement>(null);
  const generateButtonRef = useRef<HTMLButtonElement>(null);
  const modelService = ModelService.getInstance();

  useEffect(() => {
    if (advancedButtonRef.current) {
      advancedButtonRef.current.setAttribute('aria-expanded', showAdvanced.toString());
    }
  }, [showAdvanced]);

  useEffect(() => {
    if (generateButtonRef.current) {
      generateButtonRef.current.setAttribute('aria-disabled', (isLoading || !prompt.trim()).toString());
    }
  }, [isLoading, prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: ImageGenerationRequest = {
        prompt: prompt.trim(),
        model,
        ...advancedSettings
      };

      const response = await modelService.generateImage(request);
      setGeneratedImage(response);
      onImageGenerated?.(response.image, response.prompt, response.generation_time);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancedSettingChange = (
    setting: keyof typeof advancedSettings,
    value: string | number
  ) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full" role="dialog" aria-label="Image Generator">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Image Generator
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close image generator"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prompt
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
            aria-label="Image generation prompt"
          />
        </div>

        {/* Model Selection */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model
            </label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value as 'flux' | 'sdxl')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              aria-label="Select image generation model"
            >
              <option value="flux">Flux</option>
              <option value="sdxl">Stable Diffusion XL</option>
            </select>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div>
          <button
            ref={advancedButtonRef}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            aria-controls="advanced-settings"
            title={`${showAdvanced ? 'Hide' : 'Show'} advanced settings`}
          >
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
            <svg
              className={`w-4 h-4 ml-1 transform transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div id="advanced-settings" className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div>
              <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Negative Prompt
              </label>
              <input
                id="negative-prompt"
                type="text"
                value={advancedSettings.negative_prompt}
                onChange={(e) => handleAdvancedSettingChange('negative_prompt', e.target.value)}
                placeholder="Things to avoid in the image..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                aria-label="Negative prompt for image generation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="inference-steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Inference Steps
                </label>
                <input
                  id="inference-steps"
                  type="number"
                  value={advancedSettings.num_inference_steps}
                  onChange={(e) => handleAdvancedSettingChange('num_inference_steps', parseInt(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-label="Number of inference steps"
                />
              </div>

              <div>
                <label htmlFor="guidance-scale" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Guidance Scale
                </label>
                <input
                  id="guidance-scale"
                  type="number"
                  value={advancedSettings.guidance_scale}
                  onChange={(e) => handleAdvancedSettingChange('guidance_scale', parseFloat(e.target.value))}
                  step={0.1}
                  min={1}
                  max={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-label="Guidance scale value"
                />
              </div>

              <div>
                <label htmlFor="width" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Width
                </label>
                <input
                  id="width"
                  type="number"
                  value={advancedSettings.width}
                  onChange={(e) => handleAdvancedSettingChange('width', parseInt(e.target.value))}
                  step={64}
                  min={256}
                  max={2048}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-label="Image width in pixels"
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Height
                </label>
                <input
                  id="height"
                  type="number"
                  value={advancedSettings.height}
                  onChange={(e) => handleAdvancedSettingChange('height', parseInt(e.target.value))}
                  step={64}
                  min={256}
                  max={2048}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-label="Image height in pixels"
                />
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div>
          <button
            ref={generateButtonRef}
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading || !prompt.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-label="Generate image"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Generating...</span>
              </div>
            ) : (
              'Generate Image'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm mt-2" role="alert">
            {error}
          </div>
        )}

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="mt-6">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={`data:image/png;base64,${generatedImage.image}`}
                alt={generatedImage.prompt}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 text-sm">
                <div className="font-medium">Generation Time: {generatedImage.generation_time.toFixed(2)}s</div>
                <div className="text-xs opacity-75 mt-1">{generatedImage.prompt}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
