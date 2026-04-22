# Activate venv
.\venv311\Scripts\Activate.ps1

# Start server
python -m uvicorn main:app --host 0.0.0.0 --port 8000