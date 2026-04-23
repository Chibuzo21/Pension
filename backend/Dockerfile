FROM python:3.11-slim

# System dependencies for OpenCV, soundfile, insightface
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsndfile1 \
    libgomp1 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]