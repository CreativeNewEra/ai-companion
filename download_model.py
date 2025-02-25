"""Script to download Stable Diffusion model."""
import os
from diffusers import StableDiffusionPipeline
import torch

def main():
    # Use stable-diffusion-v1-5 model
    model_id = "runwayml/stable-diffusion-v1-5"
    cache_dir = "models/diffusers/test-model"
    
    print(f"Downloading {model_id} to {cache_dir}...")
    try:
        # Download the model files with half precision
        pipeline = StableDiffusionPipeline.from_pretrained(
            model_id,
            cache_dir=cache_dir,
            safety_checker=None,
            torch_dtype=torch.float16,
            local_files_only=False
        )
        # Save model locally
        pipeline.save_pretrained(cache_dir, safe_serialization=True)
        print(f"Model downloaded successfully to {cache_dir}")
        
        # Test loading
        print("Testing model loading...")
        reloaded = StableDiffusionPipeline.from_pretrained(
            cache_dir,
            local_files_only=True,
            torch_dtype=torch.float16
        )
        print("Model loaded successfully from local cache")
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    main()
