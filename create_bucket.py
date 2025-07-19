"""
Create the missing profile-pictures bucket in Supabase
"""
import os
from cloudinary_storage import supabase_storage

def create_profile_pictures_bucket():
    print("🪣 CREATING PROFILE-PICTURES BUCKET")
    print("=" * 45)
    
    if not supabase_storage or not supabase_storage.is_enabled():
        print("❌ Supabase storage not available")
        return False
    
    try:
        print("🔧 Attempting to create 'profile-pictures' bucket...")
        
        # Create the bucket
        result = supabase_storage.client.storage.create_bucket(
            'profile-pictures',
            options={"public": True}
        )
        
        if hasattr(result, 'error') and result.error:
            print(f"⚠️ Bucket creation result: {result.error}")
            # Check if bucket already exists
            if "already exists" in str(result.error).lower():
                print("✅ Bucket already exists - that's fine!")
                return True
        else:
            print("✅ Bucket created successfully!")
        
        # Verify bucket exists now
        print("🔍 Verifying bucket creation...")
        buckets = supabase_storage.client.storage.list_buckets()
        bucket_names = [bucket.name for bucket in buckets]
        
        if 'profile-pictures' in bucket_names:
            print("✅ Bucket 'profile-pictures' is now available!")
            print(f"📦 All buckets: {bucket_names}")
            return True
        else:
            print(f"❌ Bucket still not found. Available: {bucket_names}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating bucket: {e}")
        return False

def test_upload_functionality():
    """Test that we can actually upload a file"""
    print("\n🧪 TESTING UPLOAD FUNCTIONALITY")
    print("=" * 35)
    
    if not supabase_storage or not supabase_storage.is_enabled():
        print("❌ Storage not available")
        return False
    
    try:
        # Create a simple test image
        from PIL import Image
        from io import BytesIO
        
        # Create a small test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_data = img_bytes.getvalue()
        
        print("🖼️ Created test image (100x100 red square)")
        
        # Test upload
        result = supabase_storage.upload_profile_picture(
            file_data=img_data,
            user_id="test_user",
            file_extension="jpg"
        )
        
        if result['success']:
            print("✅ Test upload successful!")
            print(f"📁 Filename: {result['filename']}")
            print(f"🔗 Public URL: {result['public_url']}")
            return True
        else:
            print(f"❌ Test upload failed: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Upload test error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 FINALIZING SUPABASE SETUP")
    print("=" * 30)
    
    # Create bucket
    bucket_success = create_profile_pictures_bucket()
    
    if bucket_success:
        # Test upload
        upload_success = test_upload_functionality()
        
        if upload_success:
            print("\n🎉 COMPLETE SUCCESS!")
            print("✅ Supabase storage is fully functional")
            print("✅ Profile pictures will now work in your app")
            print("\n🚀 NEXT STEPS:")
            print("1. Restart your Moodly app: .\\run_app.bat")
            print("2. Try uploading a profile picture")
            print("3. Check that it displays correctly")
        else:
            print("\n⚠️ BUCKET CREATED BUT UPLOAD FAILED")
            print("Check your Supabase bucket permissions")
    else:
        print("\n❌ BUCKET CREATION FAILED")
        print("You may need to create it manually in Supabase dashboard")