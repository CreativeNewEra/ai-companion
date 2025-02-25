"""Test script for image generation with public models."""
import asyncio
import logging
import sys
from pathlib import Path
from backend.app.core.image_generation import ImageGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    # Initialize the image generator
    generator = ImageGenerator()
    
    try:
        logger.info("Initializing test...")
        
        # Test parameters with Hugging Face model ID
        test_params = {
            "prompt": "A serene mountain landscape at sunset, photorealistic, detailed",
            "model_source": "runwayml/stable-diffusion-v1-5",  # Public model
            "num_inference_steps": 20,
            "width": 512,  # Reduced size for faster testing
            "height": 512,
            "guidance_scale": 7.5
        }
        
        logger.info(f"Starting image generation with model: {test_params['model_source']}")
        logger.info(f"Prompt: {test_params['prompt']}")
        
        # Generate image
        image_b64 = await generator.generate_image(**test_params)
        
        # Save the test image
        import base64
        from PIL import Image
        import io
        
        output_path = Path("test_output.png")
        image_data = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_data))
        image.save(output_path)
        logger.info(f"Test image generated successfully and saved as '{output_path}'")
        logger.info("Image size: %dx%d", image.width, image.height)
        
    except Exception as e:
        logger.error(f"Error during test: {str(e)}", exc_info=True)
        sys.exit(1)
    finally:
        # Clean up
        logger.info("Cleaning up resources...")
        generator.unload_models()
        logger.info("Test completed")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        sys.exit(1)
