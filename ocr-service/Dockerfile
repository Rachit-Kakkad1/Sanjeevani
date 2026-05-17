# -------- Base Image --------
FROM python:3.10-slim

# -------- Environment --------
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    OMP_THREAD_LIMIT=1

# -------- Working Directory --------
WORKDIR /app

# -------- System Dependencies --------
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    fonts-dejavu \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# -------- Python Dependencies --------
COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# -------- Copy App --------
COPY . .

# -------- Create Non-root User (security) --------
RUN useradd -m appuser
USER appuser

# -------- Expose Port --------
EXPOSE 8000

# -------- Run Server --------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]