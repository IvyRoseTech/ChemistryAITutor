FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (needed for some python packages)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY inference_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY inference_service/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
