#!/bin/bash
# filepath: d:\PLP Academy\Moodly 2.0 by Hillan\collab-edit-github-now\deploy.sh

echo "🚀 Preparing Moodly for Render Deployment..."

# Create requirements.txt if it doesn't exist
if [ ! -f requirements.txt ]; then
    echo "📝 Creating requirements.txt..."
    cat > requirements.txt << EOF
Flask==2.3.3
python-dotenv==1.0.0
werkzeug==2.3.7
openai==0.28.1
cloudinary==1.36.0
django-cloudinary-storage==0.3.0
gunicorn==21.2.0
psycopg2-binary==2.9.7
EOF
fi

# Build frontend
echo "🔨 Building React frontend..."
npm install
npm run build

# Test Python dependencies
echo "🐍 Testing Python setup..."
pip install -r requirements.txt

echo "✅ Render deployment preparation complete!"
echo "📋 Next steps:"
echo "1. Push to GitHub"
echo "2. Connect repository to Render"
echo "3. Set environment variables in Render dashboard"
echo "4. Deploy!"