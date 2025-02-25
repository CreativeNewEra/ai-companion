"""
Ollama Backend Integration
Provides a client for interacting with the Ollama API
"""

import requests
import logging
from typing import Dict, Any, List, Optional, Union, Generator

logger = logging.getLogger("ai_companion.ollama")

class OllamaBackend:
    """
    Client for interacting with the Ollama API
    """
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        """
        Initialize the Ollama backend client
        
        Args:
            base_url: Base URL for the Ollama API (default: http://localhost:11434)
        """
        self.base_url = base_url
        logger.info(f"Initialized Ollama backend with base URL: {base_url}")
    
    def list_models(self) -> List[Dict[str, Any]]:
        """
        List all available models from Ollama
        
        Returns:
            List of model information dictionaries
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            response.raise_for_status()
            models = response.json().get("models", [])
            logger.info(f"Retrieved {len(models)} models from Ollama")
            return models
        except requests.RequestException as e:
            logger.error(f"Error listing Ollama models: {str(e)}")
            return []
    
    def generate_completion(
        self, 
        model: str, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        stream: bool = False,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> Union[Dict[str, Any], Generator[Dict[str, Any], None, None]]:
        """
        Generate a completion using the specified model
        
        Args:
            model: Name of the Ollama model to use
            prompt: User prompt for generation
            system_prompt: Optional system prompt to control model behavior
            stream: Whether to stream the response
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            If stream=False: Dictionary containing the response
            If stream=True: Generator yielding response chunks
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": stream,
            "temperature": temperature
        }
        
        if system_prompt:
            payload["system"] = system_prompt
            
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        logger.info(f"Generating completion with model: {model}")
        
        try:
            if stream:
                return self._stream_completion(payload)
            else:
                response = requests.post(f"{self.base_url}/api/generate", json=payload)
                response.raise_for_status()
                return response.json()
        except requests.RequestException as e:
            logger.error(f"Error generating completion: {str(e)}")
            raise
    
    def _stream_completion(self, payload: Dict[str, Any]) -> Generator[Dict[str, Any], None, None]:
        """
        Stream a completion from Ollama
        
        Args:
            payload: Request payload
            
        Yields:
            Response chunks
        """
        with requests.post(f"{self.base_url}/api/generate", json=payload, stream=True) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if line:
                    yield {"response": line.decode("utf-8")}
    
    def generate_image(
        self, 
        model: str, 
        prompt: str,
        negative_prompt: Optional[str] = None,
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5,
        width: int = 512,
        height: int = 512
    ) -> Dict[str, Any]:
        """
        Generate an image using a diffusion model in Ollama
        
        Args:
            model: Name of the image generation model
            prompt: Text prompt for image generation
            negative_prompt: Things to avoid in the generated image
            num_inference_steps: Number of denoising steps
            guidance_scale: How closely to follow the prompt
            width: Image width
            height: Image height
            
        Returns:
            Dictionary containing the generated image data
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "options": {
                "num_inference_steps": num_inference_steps,
                "guidance_scale": guidance_scale,
                "width": width,
                "height": height
            }
        }
        
        if negative_prompt:
            payload["options"]["negative_prompt"] = negative_prompt
        
        logger.info(f"Generating image with model: {model}")
        
        try:
            response = requests.post(f"{self.base_url}/api/generate", json=payload)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error generating image: {str(e)}")
            raise
