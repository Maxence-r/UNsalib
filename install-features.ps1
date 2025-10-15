# Installation script for Dashboard Features (PowerShell)
# Run this in PowerShell

Write-Host "🚀 Installing Dashboard Features..." -ForegroundColor Green
Write-Host ""

# Navigate to frontend
Set-Location frontend

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
npm install victory lucide-react

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the frontend: cd frontend; npm run dev"
Write-Host "2. Start the backend (new terminal): cd backend; npm start"
Write-Host "3. Open http://localhost:3000/admin/dashboard"
Write-Host ""
Write-Host "📖 See DASHBOARD_FEATURES.md for full documentation" -ForegroundColor Yellow
