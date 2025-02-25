import axios from 'axios';

export interface ImageGenerationRequest {
  prompt: string;
  model_id?: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
}

export interface ImageGenerationResponse {
  image: string;  // Base64 encoded image
  prompt: string;
  generation_time: number;
  model_used: string;
  width: number;
  height: number;
  negative_prompt?: string;
}

export interface Model {
  name: string;
  type: string;
  modified_at?: string;
  size?: number;
}

export interface ModelListResponse {
  models: Model[];
}

export interface PersonalityTrait {
  value: number;
  name: string;
  description: string;
}

export interface Personality {
  openness: PersonalityTrait;
  conscientiousness: PersonalityTrait;
  extraversion: PersonalityTrait;
  agreeableness: PersonalityTrait;
  neuroticism: PersonalityTrait;
}

export interface Emotion {
  valence: number;  // Pleasure/displeasure (positive/negative)
  arousal: number;  // Energy level (high/low)
  dominance: number;  // Confidence level (high/low)
}

export interface ChatRequest {
  content: string;
  model_id?: string;
  stream?: boolean;
  temperature?: number;
}

export interface ChatResponse {
  response: string;
  personality: Personality;
  emotion: Emotion;
  processing_time: number;
  model_used: string;
}

class ModelService {
  private static instance: ModelService;
  private _baseUrl: string;
  private _wsUrl: string;
  private _currentTextModel: string | null = null;
  private _currentImageModel: string | null = null;

  public get baseUrl(): string {
    return this._baseUrl;
  }

  public get wsUrl(): string {
    return this._wsUrl;
  }

  private constructor() {
    this._baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    this._wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  }

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  /**
   * List all available models
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
   * Get the current text model
   */
  getCurrentTextModel(): string | null {
    return this._currentTextModel;
  }

  /**
   * Get the current image model
   */
  getCurrentImageModel(): string | null {
    return this._currentImageModel;
  }

  /**
   * Set the current text model
   */
  setCurrentTextModel(modelId: string): void {
    this._currentTextModel = modelId;
    localStorage.setItem('currentTextModel', modelId);
  }

  /**
   * Set the current image model
   */
  setCurrentImageModel(modelId: string): void {
    this._currentImageModel = modelId;
    localStorage.setItem('currentImageModel', modelId);
  }

  /**
   * Get the current personality
   */
  async getPersonality(): Promise<Personality> {
    try {
      const response = await axios.get(`${this._baseUrl}/personality/current`);
      return response.data;
    } catch (error) {
      console.error('Failed to get personality:', error);
      throw error;
    }
  }

  /**
   * Get the current emotion
   */
  async getEmotion(): Promise<Emotion> {
    try {
      const response = await axios.get(`${this._baseUrl}/emotions/current`);
      return response.data;
    } catch (error) {
      console.error('Failed to get emotion:', error);
      throw error;
    }
  }

  /**
   * Update personality traits
   */
  async updatePersonality(traits: Record<string, number>): Promise<Personality> {
    try {
      const response = await axios.post(`${this._baseUrl}/personality/update`, {
        traits
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update personality:', error);
      throw error;
    }
  }

  /**
   * Update emotional state
   */
  async updateEmotion(values: Record<string, number>): Promise<Emotion> {
    try {
      const response = await axios.post(`${this._baseUrl}/emotions/update`, {
        values
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update emotion:', error);
      throw error;
    }
  }

  /**
   * Get message history
   */
  async getMessages(limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${this._baseUrl}/messages?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw error;
    }
  }

  /**
   * Send a chat message and get the AI response
   */
  async sendMessage(
    content: string, 
    modelId?: string, 
    stream: boolean = false,
    temperature: number = 0.7
  ): Promise<ChatResponse> {
    try {
      console.log('Sending message to:', `${this._baseUrl}/chat`);
      const response = await axios.post(`${this._baseUrl}/chat`, {
        content,
        model_id: modelId || this._currentTextModel,
        stream,
        temperature
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
      // If no model_id is provided, use the current image model
      if (!request.model_id && this._currentImageModel) {
        request.model_id = this._currentImageModel;
      }
      
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
   * Get memory statistics
   */
  async getMemoryStats(): Promise<any> {
    try {
      const response = await axios.get(`${this._baseUrl}/memory/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      throw error;
    }
  }

  /**
   * Get facts about a subject
   */
  async getFacts(subject: string = 'user'): Promise<any> {
    try {
      const response = await axios.get(`${this._baseUrl}/memory/facts?subject=${subject}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get facts:', error);
      throw error;
    }
  }

  /**
   * Get the current system prompt
   */
  async getSystemPrompt(): Promise<string> {
    try {
      const response = await axios.get(`${this._baseUrl}/system/prompt`);
      return response.data.system_prompt;
    } catch (error) {
      console.error('Failed to get system prompt:', error);
      throw error;
    }
  }

  /**
   * Create a WebSocket connection
   */
  createWebSocketConnection(): WebSocket {
    const ws = new WebSocket(this._wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return ws;
  }
}

export default ModelService;
