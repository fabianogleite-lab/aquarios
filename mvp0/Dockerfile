FROM python:3.11-slim

WORKDIR /app

# Deps
COPY requirements.txt .
RUN pip install --no-cache-dir --progress-bar off -r requirements.txt

# Backend
COPY backend/ backend/
COPY supabase/ supabase/

# Main
COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
