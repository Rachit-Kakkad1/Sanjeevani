# Sanjeevani PDF Ingestion Pipeline
# TODO: add architectural diagram

This module provides a production-ready system for extracting structured healthcare pricing data from PDF files (CGHS, NPPA, PMJAY, etc.) and converting them into normalized JSON format for the Sanjeevani audit engine.

## Architecture

The pipeline is built with a modular approach:

- **`parser.py`**: Handles PDF reading and table extraction. It uses `camelot-py` (with Lattice and Stream flavors) for high-accuracy table detection, with a robust fallback to `pdfplumber` for complex or non-standard PDFs.
- **`cleaner.py`**: Normalizes raw data, performs heuristic column detection, cleans OCR artifacts, and maps data to the standard Sanjeevani schema.
- **`exporter.py`**: Manages the export of processed data into structured JSON files.
- **`utils.py`**: Contains reusable utility functions for text normalization, price parsing, and fuzzy alias generation.
- **`main.py`**: Orchestrates the entire pipeline from file discovery to final export.

## Dependencies

The system requires Python 3.8+ and the following libraries:

- `camelot-py[cv]`: Advanced table extraction.
- `pdfplumber`: Fallback PDF parsing.
- `pandas`: Data manipulation and cleaning.
- `rapidfuzz`: Fuzzy string matching and normalization.
- `opencv-python`: Required by Camelot for image-based table detection.

To install dependencies:
```bash
pip install -r ingestion/requirements.txt
```

*Note: Camelot also requires Ghostscript to be installed on the system for certain PDF types.*

## How to Run

1. Place the target PDF file (e.g., `new_cghs_rates_applicable.pdf`) in the project root directory.
2. Run the ingestion script:

```bash
python ingestion/main.py
```

Or specify a specific file:
```bash
python ingestion/main.py my_custom_rates.pdf
```

## Expected Output

The processed data is saved to `ingestion/output/cghs_rates.json`. The output follows this schema:

```json
{
  "source": "CGHS",
  "code": "RI009",
  "canonicalName": "CT Coronary Angiography including Calcium Score Test",
  "aliases": [
    "ct coronary angiography calcium score"
  ],
  "pricing": {
    "tier1": {
      "nonNABH": 7820,
      "NABH": 9200,
      "superSpeciality": 9200
    }
  },
  "classification": "Radiological Investigation"
}
```

## Scalability

The system is designed to be easily extendable:
- New heuristic patterns can be added to `cleaner.py` to support different PDF layouts (NPPA, PMJAY).
- The `utils.py` module can be expanded with more specialized medical term normalizers.
- The pipeline can be integrated into a cloud function or containerized for automated batch processing.
