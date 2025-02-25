"""
Model Manager
Manages the available AI models and provides a unified interface for model operations
"""

import logging
import os
from typing import Dict, Any, List, Optional, Union, Generator
from .backends.ollama import OllamaBackend

logger = logging.getLogger("ai_companion.model_manager")

class ModelManager:
    """
    Manages AI models and provides a unified interface for model operations
    """
    
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        """
        Initialize the model manager
        
        Args:
            ollama_url: URL for the Ollama API
        """
        self.ollama = OllamaBackend(base_url=ollama_url)
        self.default_text_model = os.environ.get("DEFAULT_TEXT_MODEL", "llama2")
        self.default_image_model = os.environ.get("DEFAULT_IMAGE_MODEL", "stable-diffusion")
        logger.info(f"Initialized ModelManager with default text model: {self.default_text_model}, default image model: {self.default_image_model}")
    
    def list_models(self) -> List[Dict[str, Any]]:
        """
        List all available models
        
        Returns:
            List of model information dictionaries
        """
        models = self.ollama.list_models()
        
        # Add model type classification (text or image)
        for model in models:
            # This is a simple heuristic - in a real implementation, you'd want a more robust way to identify model types
            name = model.get("name", "").lower()
            if any(img_model in name for img_model in ["stable-diffusion", "sdxl", "dall-e", "imagen"]):
                model["type"] = "image"
            else:
                model["type"] = "text"
        
        return models
    
    def get_default_model(self, model_type: str = "text") -> str:
        """
        Get the default model for the specified type
        
        Args:
            model_type: Type of model ("text" or "image")
            
        Returns:
            Name of the default model
        """
        if model_type == "image":
            return self.default_image_model
        return self.default_text_model
    
    def generate_text(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        stream: bool = False,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> Union[Dict[str, Any], Generator[Dict[str, Any], None, None]]:
        """
        Generate text using the specified model
        
        Args:
            prompt: User prompt for generation
            model: Name of the model to use (defaults to default_text_model)
            system_prompt: Optional system prompt to control model behavior
            stream: Whether to stream the response
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            If stream=False: Dictionary containing the response
            If stream=True: Generator yielding response chunks
        """
        model = model or self.default_text_model
        logger.info(f"Generating text with model: {model}")
        
        return self.ollama.generate_completion(
            model=model,
            prompt=prompt,
            system_prompt=system_prompt,
            stream=stream,
            temperature=temperature,
            max_tokens=max_tokens
        )
    
    def generate_image(
        self,
        prompt: str,
        model: Optional[str] = None,
        negative_prompt: Optional[str] = None,
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5,
        width: int = 512,
        height: int = 512
    ) -> Dict[str, Any]:
        """
        Generate an image using the specified model
        
        Args:
            prompt: Text prompt for image generation
            model: Name of the model to use (defaults to default_image_model)
            negative_prompt: Things to avoid in the generated image
            num_inference_steps: Number of denoising steps
            guidance_scale: How closely to follow the prompt
            width: Image width
            height: Image height
            
        Returns:
            Dictionary containing the generated image data
        """
        model = model or self.default_image_model
        logger.info(f"Generating image with model: {model}")
        
        return self.ollama.generate_image(
            model=model,
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            width=width,
            height=height
        )
