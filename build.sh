#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm ci

# Build React application
echo "Building React frontend..."
npm run build

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build completed successfully!"
echo "Frontend built in ./dist directory"
echo "Python dependencies installed"
