# Check if Python is installed
if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not found in PATH. Please install Python 3.11+." -ForegroundColor Red
    Exit 1
}

# Check if .venv exists, if not create it
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv .venv
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
. .\.venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Check for credentials.json
if (-not (Test-Path "credentials.json")) {
    Write-Host "WARNING: credentials.json not found!" -ForegroundColor Yellow
    Write-Host "Please download your OAuth 2.0 Client credentials from Google Cloud Console"
    Write-Host "and save them as 'credentials.json' in this directory."
    Write-Host "Press any key to continue once you have placed the file..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Check for .env
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from example..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
}

# Run the app
Write-Host "Starting Email Assistant..." -ForegroundColor Green
$env:PYTHONPATH = $PWD
python -m src.main
