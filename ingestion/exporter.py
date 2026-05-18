import json
import os
import logging
import pandas as pd

logger = logging.getLogger(__name__)

# TODO: add database direct export
class DataExporter:
    def __init__(self, output_dir):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def export_json(self, data, filename, pretty=False):
        """Exports list of dictionaries to a JSON file."""
        output_path = os.path.join(self.output_dir, filename)
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                if pretty:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                else:
                    json.dump(data, f, separators=(',', ':'), ensure_ascii=False)
            logger.info(f"Exported JSON to {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to export JSON: {e}")
            return None

    def export_csv(self, data, filename):
        """Exports flattened data to CSV."""
        output_path = os.path.join(self.output_dir, filename)
        try:
            # Flatten pricing for CSV
            flat_data = []
            for r in data:
                flat_data.append({
                    "source": r.get("source"),
                    "code": r.get("code"),
                    "canonicalName": r.get("canonicalName"),
                    "classification": r.get("classification"),
                    "nonNABH": r.get("pricing", {}).get("tier1", {}).get("nonNABH"),
                    "NABH": r.get("pricing", {}).get("tier1", {}).get("NABH"),
                    "superSpeciality": r.get("pricing", {}).get("tier1", {}).get("superSpeciality"),
                    "confidence": r.get("confidence")
                })
            df = pd.DataFrame(flat_data)
            df.to_csv(output_path, index=False, encoding='utf-8')
            logger.info(f"Exported CSV to {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to export CSV: {e}")
            return None

    def export_report(self, report_data, filename="extraction_report.json"):
        """Exports extraction quality report."""
        output_path = os.path.join(self.output_dir, filename)
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2)
            logger.info(f"Exported Quality Report to {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to export report: {e}")
            return None

def get_exporter(output_dir="ingestion/output"):
    return DataExporter(output_dir)
