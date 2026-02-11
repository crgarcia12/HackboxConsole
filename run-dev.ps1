# Launch both Flask backend and Vite frontend dev server
Write-Host "Starting HackboxConsole dev environment..." -ForegroundColor Cyan

# Start Flask backend
Write-Host "Starting Flask backend on http://localhost:5000" -ForegroundColor Green
$backend = Start-Process -PassThru -NoNewWindow -FilePath ".venv\Scripts\python.exe" -ArgumentList "startup.py" -WorkingDirectory $PSScriptRoot

# Start Vite frontend
Write-Host "Starting Vite frontend on http://localhost:3000" -ForegroundColor Green
$frontend = Start-Process -PassThru -NoNewWindow -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "$PSScriptRoot\frontend"

Write-Host ""
Write-Host "Open http://localhost:3000 in your browser" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

try {
    Wait-Process -Id $backend.Id, $frontend.Id
} finally {
    if (!$backend.HasExited) { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue }
    if (!$frontend.HasExited) { Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "Servers stopped." -ForegroundColor Red
}
