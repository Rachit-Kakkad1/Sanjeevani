# 🔍 MedClear OCR Service | AI-Powered Data Extraction

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.1-EE4C2C?logo=pytorch)](https://pytorch.org/)
[![EasyOCR](https://img.shields.io/badge/EasyOCR-1.7-blue)](https://github.com/JaidedAI/EasyOCR)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

The **MedClear OCR Service** is a specialized computer vision microservice designed to extract structured data from complex medical bills, insurance statements, and financial documents. Built with **FastAPI** and powered by state-of-the-art Deep Learning models.

---

## 🧠 Intelligence & Extraction

This service employs a multi-engine approach to ensure maximum accuracy across diverse document formats.

### Core Capabilities
-   **Dual-Engine OCR**: Intelligent fallback between **EasyOCR** (Deep Learning based) and **Tesseract** (Traditional LSTM).
-   **Image Pre-processing**: Automated noise reduction, deskewing, and adaptive thresholding to handle low-quality scans.
-   **Tabular Data Reconstruction**: Advanced algorithms to recreate row-column structures from raw text coordinates.
-   **Fuzzy Matching**: Integration with Levenshtein distance for resilient medical terminology identification.
-   **Validation Pipeline**: Multi-stage validation for financial figures and date formats.

## 🛠️ Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | **FastAPI** | High-performance, async Python web framework. |
| **Deep Learning** | **PyTorch** | Backend for neural network inference. |
| **OCR Engine 1** | **EasyOCR** | Ready-to-use OCR with 80+ supported languages. |
| **OCR Engine 2** | **Tesseract** | Reliable fallback for legacy document styles. |
| **Vision** | **OpenCV** | Professional image processing and transformation. |
| **Schema** | **Pydantic** | Strict data validation and settings management. |

---

## 📁 Project Structure

```text
ocr-service/
├── app/
│   ├── routers/            # FastAPI route handlers (OCR, Health)
│   ├── services/           # Core OCR logic and engine management
│   ├── utils/              # Image filters, validators, and model downloaders
│   └── main.py             # FastAPI entry point & lifespan management
├── Dockerfile              # Containerization for consistent deployment
├── requirements.txt        # Python dependency manifest
└── .dockerignore           # Optimized docker build exclusion
```

---

## 🚦 Getting Started

### Prerequisites
-   **Python**: 3.10 or 3.11
-   **Tesseract OCR**: (Optional) Installed on system for fallback support
-   **Poppler**: (Optional) Required for PDF processing (`pdf2image`)

### Installation & Setup

1.  **Virtual Environment**:
    ```bash
    cd ocr-service
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Download Models**:
    The service will automatically download required EasyOCR models on first run.

4.  **Run Service**:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    The service documentation (Swagger UI) will be available at `http://localhost:8000/docs`.

---

## 🐳 Docker Deployment

For a production-ready, isolated environment:

```bash
docker build -t medclear-ocr .
docker run -p 8000:8000 medclear-ocr
```

---

## 🛡️ Health & Diagnostics

The service provides a diagnostic endpoint to verify engine availability:
`GET /ocr/health`

**Example Response:**
```json
{
  "success": true,
  "engines": {
    "easyocr": true,
    "tesseract": true
  }
}
```

---

## ⚖️ License

© 2026 MedClear. All rights reserved. Proprietary and Confidential.
