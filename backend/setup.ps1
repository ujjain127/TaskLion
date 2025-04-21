Write-Host "Setting up TaskLion backend environment..."

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

Write-Host "Backend setup completed successfully!" 