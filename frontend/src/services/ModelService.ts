import axios from 'axios';

export interface ImageGenerationRequest {
  prompt: string;
  model?: 'flux' | 'sdxl';
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  width?: number;
  height?: number;
}

export interface ImageGenerationResponse {
  image: string;  // Base64 encoded PNG
  prompt: string;
  generation_time: number;
  model: string;
  metadata: {
    negative_prompt?: string;
    num_inference_steps: number;
    guidance_scale: number;
    width: number;
    height: number;
  };
}

export interface ModelCapability {
  name: string;
  description: string;
}

export interface ModelConfig {
  [key: string]: any;
}

export interface ModelInfo {
  name: string;
  type: string;
  capabilities: string[];
  config: ModelConfig;
  backend_type: string;
}

export interface BackendInfo {
  models: {
    [key: string]: {
      capabilities: string[];
      context_length: number;
    };
  };
  required_config: string[];
  optional_config: string[];
}

export interface ModelListResponse {
  [backend: string]: BackendInfo;
}

class ModelService {
  private static instance: ModelService;
  private _baseUrl: string;

  public get baseUrl(): string {
    return this._baseUrl;
  }

  private constructor() {
    this._baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  }

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  /**
   * List all available models grouped by backend type
   */
  async listModels(): Promise<ModelListResponse> {
    try {
      const response = await axios.get(`${this._baseUrl}/models`);
      return response.data;
    } catch (error) {
      console.error('Failed to list models:', error);
      throw error;
    }
  }

  /**
   * Get information about the currently active model
   */
  getCurrentModel(): string {
    // Default to ollama:llama2 if no model is set
    return 'ollama:llama2';
  }

  getModels(): Record<string, { name: string; capabilities: string[]; groups: string[] }> {
    return {
      'ollama:llama2': {
        name: 'Llama 2',
        capabilities: ['chat', 'instruction_following'],
        groups: ['local']
      },
      'flux': {
        name: 'Flux Image Generator',
        capabilities: ['image_generation'],
        groups: ['local']
      },
      'sdxl': {
        name: 'Stable Diffusion XL',
        capabilities: ['image_generation'],
        groups: ['local']
      }
    };
  }

  setCurrentModel(type: string, name: string): void {
    this.switchModel(type, name).catch(console.error);
  }

  /**
   * Switch to a different model
   */
  async switchModel(
    backendType: string,
    modelName: string,
    config?: ModelConfig
  ): Promise<ModelInfo> {
    try {
      const response = await axios.post(`${this._baseUrl}/models/switch`, {
        backend_type: backendType,
        model_name: modelName,
        config
      });
      return response.data;
    } catch (error) {
      console.error('Failed to switch model:', error);
      throw error;
    }
  }

  /**
   * Get capabilities for a specific model
   */
  getModelCapabilities(modelInfo: ModelInfo): string[] {
    return modelInfo.capabilities || [];
  }

  /**
   * Format model name for display
   */
  formatModelName(modelName: string): string {
    return modelName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get a human-readable description of a model's capabilities
   */
  getCapabilityDescription(capability: string): string {
    const descriptions: { [key: string]: string } = {
      'chat': 'General conversation and chat interactions',
      'instruction_following': 'Follows specific instructions and commands',
      'code_generation': 'Generates and completes code snippets',
      'code_analysis': 'Analyzes and explains code',
      'function_calling': 'Can call and use external functions',
      'advanced_reasoning': 'Complex problem-solving and analysis',
      'extended_context': 'Handles longer conversations and context',
      'image_generation': 'Generates images from text descriptions'
    };
    return descriptions[capability] || capability;
  }

  /**
   * Check if a model requires API key
   */
  requiresApiKey(backendType: string): boolean {
    return ['openai', 'anthropic'].includes(backendType);
  }

  /**
   * Get configuration requirements for a backend
   */
  getBackendConfigRequirements(
    modelList: ModelListResponse,
    backendType: string
  ): { required: string[]; optional: string[] } {
    const backend = modelList[backendType];
    return {
      required: backend?.required_config || [],
      optional: backend?.optional_config || []
    };
  }

  /**
   * Send a chat message and get the AI response
   */
  async sendMessage(content: string): Promise<{ response: string }> {
    try {
      console.log('Sending message to:', `${this._baseUrl}/chat`);
      const response = await axios.post(`${this._baseUrl}/chat`, {
        content
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Generate an image from a text prompt
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await axios.post(
        `${this._baseUrl}/images/generate`,
        request,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate image:', error);
      throw error;
    }
  }

  /**
   * Unload image generation models to free GPU memory
   */
  async unloadImageModels(): Promise<void> {
    try {
      await axios.post(`${this._baseUrl}/images/unload`);
    } catch (error) {
      console.error('Failed to unload image models:', error);
      throw error;
    }
  }
}

export default ModelService;
