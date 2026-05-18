import os
import sys
import logging
import glob
import json
from ingestion.parser import get_parser
from ingestion.cleaner import get_cleaner
from ingestion.exporter import get_exporter

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("MedClear-Ingestion")

def run_pipeline(pdf_path=None): # TODO: add command line flags for output directory
    logger.info("🚀 Starting Production-Grade MedClear Ingestion Pipeline")
    
    if not pdf_path:
        pdf_files = glob.glob("*.pdf")
        if not pdf_files:
            logger.error("No PDF files found in the root directory.")
            return
        pdf_path = next((f for f in pdf_files if "cghs" in f.lower()), pdf_files[0])
        
    logger.info(f"Using source file: {pdf_path}")
    
    try:
        # Phase 1: Parse
        logger.info("--- PHASE 1: EXTRACTION ---")
        parser = get_parser(pdf_path)
        raw_dfs = parser.extract_tables()
        logger.info(f"Extraction complete. {parser.stats['tables_extracted']} tables found.")
        
        if not raw_dfs:
            logger.error("No tables extracted. Exiting.")
            return

        # Phase 2: Clean & Normalize
        logger.info("--- PHASE 2: CLEANING & NORMALIZATION ---")
        cleaner = get_cleaner(source_file=os.path.basename(pdf_path))
        normalized_records = cleaner.process_dataframes(raw_dfs)
        logger.info(f"Cleaning complete. {cleaner.stats['accepted']} records accepted.")

        # Phase 3: Export
        logger.info("--- PHASE 3: EXPORT ---")
        exporter = get_exporter()
        exporter.export_json(normalized_records, "cghs_rates.json", pretty=False)
        exporter.export_json(normalized_records, "cghs_rates_pretty.json", pretty=True)
        exporter.export_csv(normalized_records, "cghs_rates.csv")
        
        # Phase 4: Reporting
        report = {
            "sourceFile": pdf_path,
            "extractionStats": parser.stats,
            "cleaningStats": cleaner.stats,
            "totalFinalRecords": len(normalized_records)
        }
        report_path = exporter.export_report(report)
        
        # Console Summary
        print("\n" + "="*50)
        print("📊 PIPELINE EXECUTION SUMMARY")
        print("="*50)
        print(f"Source File:         {pdf_path}")
        print(f"Tables Extracted:    {parser.stats['tables_extracted']}")
        print(f"Raw Rows Processed:  {cleaner.stats['processed']}")
        print(f"Records Rejected:    {cleaner.stats['rejected']}")
        print(f"Duplicate Rows:      {cleaner.stats['duplicates']}")
        print(f"Final Valid Records: {cleaner.stats['accepted']}")
        print(f"Quality Report:      {report_path}")
        
        if normalized_records:
            print("\nSample Normalized Record:")
            print(json.dumps(normalized_records[0], indent=2))
        print("="*50 + "\n")

    except Exception as e:
        logger.exception(f"Pipeline failed with critical error: {e}")

if __name__ == "__main__":
    pdf_input = sys.argv[1] if len(sys.argv) > 1 else None
    run_pipeline(pdf_input)
