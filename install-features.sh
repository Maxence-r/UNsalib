#!/bin/bash
# Installation script for Dashboard Features
# Run this in Git Bash or WSL

echo "🚀 Installing Dashboard Features..."
echo ""

# Navigate to frontend
cd frontend

echo "📦 Installing frontend dependencies..."
npm install victory lucide-react

echo ""
echo "✅ Installation complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the frontend: cd frontend && npm run dev"
echo "2. Start the backend: cd backend && npm start"
echo "3. Open http://localhost:3000/admin/dashboard"
echo ""
echo "📖 See DASHBOARD_FEATURES.md for full documentation"
