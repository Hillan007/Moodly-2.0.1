"""
Cloudinary Storage Implementation for Moodly App
Simple, reliable cloud image storage
"""
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from io import BytesIO
from PIL import Image
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FORCE SET CLOUDINARY CREDENTIALS (matching moodly_app.py)
print("☁️ SETTING UP CLOUDINARY CREDENTIALS...")
os.environ['CLOUDINARY_CLOUD_NAME'] = 'dvpsjm6pl'
os.environ['CLOUDINARY_API_KEY'] = '631924249397255'
os.environ['CLOUDINARY_API_SECRET'] = 'OGnGiRn7bkizhTsrZroOIeepjq8'

class CloudinaryStorage:
    def __init__(self):
        self.cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
        self.api_key = os.environ.get('CLOUDINARY_API_KEY')
        self.api_secret = os.environ.get('CLOUDINARY_API_SECRET')
        
        logger.info("☁️ Initializing Cloudinary Storage...")
        logger.info(f"🔗 Cloud Name: {self.cloud_name}")
        logger.info(f"🔑 API Key present: {'Yes' if self.api_key else 'No'}")
        
        if self.cloud_name and self.api_key and self.api_secret:
            self._configure_cloudinary()
        else:
            logger.warning("❌ Cloudinary credentials missing")
    
    def _configure_cloudinary(self):
        """Configure Cloudinary with credentials"""
        try:
            cloudinary.config(
                cloud_name=self.cloud_name,
                api_key=self.api_key,
                api_secret=self.api_secret,
                secure=True
            )
            
            logger.info("✅ Cloudinary configured successfully!")
            
            # Test connection
            if self._test_connection():
                logger.info("🎉 CLOUDINARY STORAGE READY!")
            else:
                logger.warning("⚠️ Configuration successful but connection test failed")
                
        except Exception as e:
            logger.error(f"❌ Cloudinary configuration failed: {e}")
    
    def _test_connection(self):
        """Test Cloudinary connection"""
        try:
            # Simple API test - get account details
            result = cloudinary.api.ping()
            if result.get('status') == 'ok':
                logger.info("✅ Cloudinary connection successful!")
                return True
            else:
                logger.error("❌ Cloudinary ping failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Connection test failed: {e}")
            return False
    
    def is_enabled(self):
        """Check if Cloudinary is properly configured"""
        enabled = (self.cloud_name and self.api_key and self.api_secret)
        logger.info(f"☁️ Cloudinary storage enabled: {enabled}")
        return enabled
    
    def upload_profile_picture(self, file_data, user_id, file_extension):
        """Upload profile picture to Cloudinary"""
        if not self.is_enabled():
            return {'success': False, 'error': 'Cloudinary not configured'}
        
        try:
            logger.info(f"📤 Uploading profile picture for user {user_id}")
            
            # Process image
            if isinstance(file_data, bytes):
                processed_data = self._resize_image(file_data)
            else:
                file_data.seek(0)
                processed_data = self._resize_image(file_data.read())
            
            # Create public ID for the image
            public_id = f"moodly/profiles/profile_{user_id}"
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                processed_data,
                public_id=public_id,
                folder="moodly/profiles",
                resource_type="image",
                format="jpg",
                quality="auto:good",
                fetch_format="auto",
                transformation=[
                    {'width': 500, 'height': 500, 'crop': 'fill'},
                    {'quality': 'auto:good'}
                ],
                overwrite=True  # Allow overwriting existing profile pictures
            )
            
            if result.get('secure_url'):
                logger.info(f"✅ Upload successful! URL: {result['secure_url']}")
                return {
                    'success': True,
                    'filename': f"{public_id}.jpg",
                    'public_url': result['secure_url'],
                    'file_url': result['secure_url'],
                    'cloudinary_id': result['public_id']
                }
            else:
                logger.error("❌ Upload failed - no URL returned")
                return {'success': False, 'error': 'Upload failed - no URL returned'}
            
        except Exception as e:
            logger.error(f"❌ Upload exception: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_profile_picture_url(self, user_id):
        """Get optimized profile picture URL for a user"""
        if not self.is_enabled():
            return None
        
        try:
            # Generate optimized URL
            url = cloudinary.CloudinaryImage(f"moodly/profiles/profile_{user_id}").build_url(
                width=500,
                height=500,
                crop="fill",
                quality="auto:good",
                fetch_format="auto",
                secure=True
            )
            
            return url
            
        except Exception as e:
            logger.error(f"❌ Error generating URL for user {user_id}: {e}")
            return None
    
    def delete_profile_picture(self, user_id):
        """Delete a user's profile picture"""
        if not self.is_enabled():
            return {'success': False, 'error': 'Cloudinary not configured'}
        
        try:
            public_id = f"moodly/profiles/profile_{user_id}"
            result = cloudinary.uploader.destroy(public_id)
            
            if result.get('result') == 'ok':
                logger.info(f"✅ Deleted profile picture for user {user_id}")
                return {'success': True}
            else:
                logger.warning(f"⚠️ Delete result: {result}")
                return {'success': False, 'error': f"Delete failed: {result}"}
                
        except Exception as e:
            logger.error(f"❌ Delete error: {e}")
            return {'success': False, 'error': str(e)}
    
    def _resize_image(self, file_data, max_size=1000):
        """Resize image before upload (Cloudinary will do final optimization)"""
        try:
            # Open and process image
            image = Image.open(BytesIO(file_data))
            logger.info(f"📏 Original size: {image.size}, mode: {image.mode}")
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
                logger.info("🎨 Converted to RGB")
            
            # Resize if too large (Cloudinary will handle final optimization)
            if max(image.size) > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                logger.info(f"📐 Resized to: {image.size}")
            
            # Save to bytes
            output = BytesIO()
            image.save(output, format='JPEG', quality=90, optimize=True)
            result_size = len(output.getvalue())
            logger.info(f"💾 Processed image size: {result_size} bytes")
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"❌ Image resize error: {e}")
            return file_data
    
    def get_storage_stats(self):
        """Get storage usage statistics"""
        if not self.is_enabled():
            return None
        
        try:
            # Get account usage info
            usage = cloudinary.api.usage()
            
            return {
                'credits_used': usage.get('credits', 0),
                'transformations_used': usage.get('transformations', 0),
                'storage_used_mb': usage.get('storage', 0) / (1024 * 1024),
                'bandwidth_used_mb': usage.get('bandwidth', 0) / (1024 * 1024),
                'connection_status': 'connected'
            }
            
        except Exception as e:
            return {
                'connection_status': f'error: {e}'
            }

# Initialize global instance
logger.info("☁️ Creating global Cloudinary storage instance...")
try:
    cloudinary_storage = CloudinaryStorage()
    if cloudinary_storage.is_enabled():
        logger.info("🎉 GLOBAL CLOUDINARY STORAGE READY!")
    else:
        logger.warning("⚠️ Cloudinary storage created but not enabled - add credentials")
except Exception as e:
    logger.error(f"❌ Failed to create Cloudinary storage instance: {e}")
    cloudinary_storage = None

# For backward compatibility with existing code
supabase_storage = cloudinary_storage
