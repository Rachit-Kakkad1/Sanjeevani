---
title: Sanjeevani OCR Service
emoji: 🏥
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: Medical bill OCR extraction service powered by EasyOCR
---

# Sanjeevani OCR Service

Production-grade OCR extraction for medical and financial bills. Powered by EasyOCR with intelligent layout parsing and noise filtering.

## API Endpoints

### Health Check
```
GET /ocr/health
```

### Extract Text from Bill
```
POST /ocr/extract
Content-Type: multipart/form-data
file: <image_file>
```

### Supported Formats
- PNG, JPG, JPEG, WEBP
- PDF (converted to images internally)

## Features
- **Dual OCR Engine**: EasyOCR (primary) + Tesseract (fallback)
- **Intelligent Parsing**: Context-aware price/quantity detection
- **Noise Filtering**: Rejects phone numbers, GSTIN, invoice IDs
- **Layout Analysis**: Clusters OCR boxes into structured rows
- **Confidence Scoring**: Per-item extraction confidence
