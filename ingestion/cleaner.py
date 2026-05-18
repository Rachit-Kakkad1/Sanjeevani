import pandas as pd
import logging
from datetime import datetime, timezone
from ingestion.utils import normalize_text, parse_price, generate_aliases, clean_code
from ingestion.matcher import prepare_for_matching

logger = logging.getLogger(__name__)

INVALID_CLASSIFICATION_KEYWORDS = {
    'reimbursement', 'surgery', 'package', 'procedure', 'note', 
    'session', 'example', 'theatre', 'operation', 'percentage', 'charges', 'hospital'
}

# TODO: add support for excel source files
class DataCleaner:
    def __init__(self, source_file="unknown", source_version="1.0"):
        self.source_file = source_file
        self.source_version = source_version
        self.ingestion_time = datetime.now(timezone.utc).isoformat()
        
        self.stats = {
            "processed": 0,
            "accepted": 0,
            "rejected": 0,
            "duplicates": 0,
            "warnings": 0
        }
        self.seen_records = set()

    def process_dataframes(self, dfs):
        """Processes a list of DataFrames and returns normalized records."""
        all_records = []
        for df in dfs:
            records = self._clean_dataframe(df)
            for r in records:
                self.stats["processed"] += 1
                
                # Validation
                if not self._validate_record(r):
                    # TODO: log details of rejected records for debugging
self.stats["rejected"] += 1
                    continue

                # Deduplication using code + canonicalName
                dedup_key = f"{r.get('code', '')}_{r.get('canonicalName', '').lower()}"
                if dedup_key in self.seen_records:
                    self.stats["duplicates"] += 1
                    continue
                self.seen_records.add(dedup_key)
                
                # Add confidence scoring and matching layer
                r = self._calculate_confidence(r)
                r = prepare_for_matching(r)
                all_records.append(r)
                self.stats["accepted"] += 1
                
        return all_records

    def _clean_dataframe(self, df):
        df = df.dropna(how='all').reset_index(drop=True)
        column_map = self._detect_columns(df)
        if not column_map:
            logger.warning("Could not detect columns. Skipping table.")
            self.stats["warnings"] += 1
            return []

        records = []
        start_idx = self._find_data_start(df, column_map)
        current_classification = "General"
        
        for i in range(start_idx, len(df)):
            row = df.iloc[i]
            
            if self._is_classification_row(row):
                new_class = normalize_text(str(row.iloc[0]))
                if len(new_class) > 3:
                    current_classification = new_class
                continue

            record = self._parse_row(row, column_map, current_classification)
            if record:
                records.append(record)
                
        return records

    def _detect_columns(self, df):
        """Identifies column indices for code, name, and prices."""
        for i in range(min(4, len(df))):
            row_str = " ".join([str(x).lower() for x in df.iloc[i]])
            mapping = {}
            
            if 'code' in row_str:
                for idx, val in enumerate(df.iloc[i]):
                    if 'code' in str(val).lower(): mapping['code'] = idx
            
            if any(k in row_str for k in ['investigation', 'treatment', 'name', 'procedure']):
                for idx, val in enumerate(df.iloc[i]):
                    lv = str(val).lower()
                    if any(k in lv for k in ['investigation', 'treatment', 'name', 'procedure']):
                        mapping['name'] = idx

            if 'non' in row_str and 'nabh' in row_str:
                for idx, val in enumerate(df.iloc[i]):
                    if 'non' in str(val).lower() and 'nabh' in str(val).lower(): mapping['nonNABH'] = idx
            
            if 'nabh' in row_str and 'non' not in row_str:
                for idx, val in enumerate(df.iloc[i]):
                    lv = str(val).lower()
                    if 'nabh' in lv and 'non' not in lv: mapping['NABH'] = idx

            if 'super' in row_str or 'speciality' in row_str:
                for idx, val in enumerate(df.iloc[i]):
                    if 'super' in str(val).lower() or 'speciality' in str(val).lower(): mapping['superSpeciality'] = idx

            if 'name' in mapping and ('nonNABH' in mapping or 'NABH' in mapping):
                return mapping
                
        if len(df.columns) >= 5:
            return {'code': 1, 'name': 2, 'nonNABH': 3, 'NABH': 4, 'superSpeciality': 5 if len(df.columns) > 5 else 4}
        
        return None

    def _find_data_start(self, df, mapping):
        for i in range(min(5, len(df))):
            row = df.iloc[i]
            name_val = str(row.iloc[mapping['name']]).lower()
            if any(k in name_val for k in ['investigation', 'procedure', 'treatment', 'name']): continue
            if 'code' in mapping and 'code' in str(row.iloc[mapping['code']]).lower(): continue
            return i
        return 0

    def _is_classification_row(self, row):
        non_empty = [x for x in row if str(x).strip() != "" and str(x).lower() != 'nan']
        if len(non_empty) == 1:
            val = str(non_empty[0]).strip()
            val_lower = val.lower()
            
            # Reject long footers/rules
            if len(val) > 75: return False
            
            # Reject if contains rule-like keywords
            if any(kw in val_lower for kw in INVALID_CLASSIFICATION_KEYWORDS): return False
            
            # Check if mostly alphabetic (categories usually are)
            alpha_count = sum(c.isalpha() for c in val)
            if len(val) > 0 and (alpha_count / len(val)) < 0.6: return False
            
            return True
        return False

    def _parse_row(self, row, mapping, classification):
        try:
            name = normalize_text(str(row.iloc[mapping['name']]))
            if not name or name.lower() in ['name', 'investigation', 'procedure', 'treatment']: return None
            
            code = clean_code(row.iloc[mapping.get('code', -1)]) if 'code' in mapping else ""
            
            nonNABH = parse_price(row.iloc[mapping['nonNABH']]) if 'nonNABH' in mapping else 0.0
            
            nabh_raw = row.iloc[mapping['NABH']] if 'NABH' in mapping else ""
            NABH = parse_price(nabh_raw)
            if NABH == 0: NABH = nonNABH
            
            ss_raw = row.iloc[mapping['superSpeciality']] if 'superSpeciality' in mapping else ""
            superSpeciality = parse_price(ss_raw)
            if superSpeciality == 0: superSpeciality = NABH
            
            return {
                "source": "CGHS",
                "sourceMetadata": {
                    "sourceFile": self.source_file,
                    "sourceVersion": self.source_version,
                    "ingestedAt": self.ingestion_time
                },
                "code": code,
                "canonicalName": name,
                "aliases": generate_aliases(name),
                "pricing": {
                    "tier1": {
                        "nonNABH": nonNABH,
                        "NABH": NABH,
                        "superSpeciality": superSpeciality
                    }
                },
                "classification": classification
            }
        except Exception:
            return None

    def _validate_record(self, record):
        if not record.get("canonicalName") or len(record["canonicalName"]) < 3: return False
            
        prices = record["pricing"]["tier1"]
        if prices["nonNABH"] == 0 and prices["NABH"] == 0: return False
            
        # Reject common header leakage
        if record.get("code", "").upper() == "S.NO." or record["canonicalName"].lower() == "scenario":
            return False
            
        # Check for garbage text ratio
        name = record["canonicalName"]
        special_chars = sum(1 for c in name if not c.isalnum() and c not in [' ', '-', '(', ')'])
        if len(name) > 0 and special_chars / len(name) > 0.3: return False
            
        return True

    def _calculate_confidence(self, record):
        score = 1.0
        
        if not record.get("code"): score -= 0.15
        
        prices = record["pricing"]["tier1"]
        if prices["nonNABH"] == 0 or prices["NABH"] == 0: score -= 0.1
            
        if len(record["canonicalName"]) < 6: score -= 0.1
        
        if len(record["aliases"]) == 0: score -= 0.05
            
        record["confidence"] = round(max(0.0, score), 2)
        return record

def get_cleaner(source_file="unknown"):
    return DataCleaner(source_file=source_file)
