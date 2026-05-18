import os
import camelot
import pdfplumber
import pandas as pd
import logging

logger = logging.getLogger(__name__)

# TODO: add support for encrypted PDFs
class PDFParser:
    def __init__(self, file_path):
        self.file_path = file_path
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at {file_path}")
        self.stats = {"pages_processed": 0, "tables_extracted": 0, "warnings": 0}

    def extract_tables(self):
        """Main extraction logic using camelot with pdfplumber fallback."""
        logger.info(f"Starting robust extraction from {self.file_path}")
        
        try:
            logger.info("Attempting Camelot Lattice extraction...")
            # line_scale=40 helps with broken lines, split_text=True helps with multi-line rows
            tables = camelot.read_pdf(self.file_path, pages='all', flavor='lattice', line_scale=40, split_text=True)
            if len(tables) > 0:
                logger.info(f"Extracted {len(tables)} tables using Lattice.")
                self.stats["tables_extracted"] = len(tables)
                return [t.df for t in tables]
        except Exception as e:
            logger.warning(f"Camelot Lattice failed: {e}")
            self.stats["warnings"] += 1

        try:
            logger.info("Attempting Camelot Stream extraction...")
            tables = camelot.read_pdf(self.file_path, pages='all', flavor='stream')
            if len(tables) > 0:
                logger.info(f"Extracted {len(tables)} tables using Stream.")
                self.stats["tables_extracted"] = len(tables)
                return [t.df for t in tables]
        except Exception as e:
            logger.warning(f"Camelot Stream failed: {e}")
            self.stats["warnings"] += 1

        logger.info("Falling back to PDFPlumber extraction...")
        return self._extract_with_pdfplumber()

    def _extract_with_pdfplumber(self):
        dfs = []
        try:
            with pdfplumber.open(self.file_path) as pdf:
                self.stats["pages_processed"] = len(pdf.pages)
                for i, page in enumerate(pdf.pages):
                    try:
                        tables = page.extract_tables()
                        for table in tables:
                            if table:
                                dfs.append(pd.DataFrame(table))
                    except Exception as pe:
                        logger.warning(f"Failed to extract table from page {i+1}: {pe}")
                        self.stats["warnings"] += 1
                        
            logger.info(f"Extracted {len(dfs)} tables using PDFPlumber.")
            self.stats["tables_extracted"] = len(dfs)
        except Exception as e:
            logger.error(f"PDFPlumber extraction failed: {e}")
            self.stats["warnings"] += 1
        
        return dfs

def get_parser(file_path):
    return PDFParser(file_path)
