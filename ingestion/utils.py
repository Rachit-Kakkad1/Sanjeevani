import re
import string
from rapidfuzz import utils

MEDICAL_ABBREVIATIONS = {
    "ct": ["computed tomography", "ct scan"],
    "mri": ["magnetic resonance imaging"],
    "usg": ["ultrasound", "sonography"],
    "ecg": ["electrocardiogram"],
    "eeg": ["electroencephalogram"],
    "angio": ["angiography"],
    "xr": ["x-ray", "xray"],
    "rx": ["prescription"],
    "opd": ["outpatient department"],
    "ipd": ["inpatient department"],
    "icu": ["intensive care unit"]
}

def normalize_text(text): # TODO: add more medical abbreviations
    """
    Standardizes text by removing special characters, 
    collapsing whitespace, and stripping.
    """
    if not text or str(text).lower() in ['nan', 'nat', 'none']: return ""
    # Collapse newlines and whitespace
    text = re.sub(r'\s+', ' ', str(text)).strip()
    return text

def parse_price(value):
    """
    Converts string price to float, handling commas and OCR confusions.
    """
    if not value or str(value).lower() in ['nan', 'none', '']:
        return 0.0
    val_str = str(value).strip()
    
    # Fix common OCR confusions in prices
    ocr_fixes = {'O': '0', 'o': '0', 'l': '1', 'I': '1', 'i': '1', 'S': '5', 's': '5'}
    for k, v in ocr_fixes.items():
        val_str = val_str.replace(k, v)
        
    val_str = val_str.replace(',', '').replace(' ', '')
    
    try:
        # Extract first valid number pattern
        match = re.search(r'\d+(\.\d+)?', val_str)
        if match:
            return float(match.group())
        return 0.0
    except (ValueError, TypeError):
        return 0.0

def generate_aliases(name):
    """
    Generates a list of normalized fuzzy aliases for a medical term.
    """
    if not name:
        return []
    
    base = utils.default_process(name).lower()
    aliases = {base}
    
    # 1. Punctuation-free alias
    no_punct = base.translate(str.maketrans('', '', string.punctuation)).strip()
    no_punct = re.sub(r'\s+', ' ', no_punct)
    if no_punct and len(no_punct) > 2:
        aliases.add(no_punct)
    
    # 2. Token cleaned (remove common filler words)
    common_words = {"test", "investigation", "score", "including", "of", "the", "and", "or", "for", "with", "without", "procedure"}
    tokens = no_punct.split()
    cleaned_tokens = [w for w in tokens if w not in common_words]
    stripped = " ".join(cleaned_tokens).strip()
    if stripped and len(stripped) > 2:
        aliases.add(stripped)
        
    # 3. Abbreviation normalization
    has_abbr = False
    expanded_words = []
    for w in cleaned_tokens:
        if w in MEDICAL_ABBREVIATIONS:
            expanded_words.append(MEDICAL_ABBREVIATIONS[w][0])
            has_abbr = True
        else:
            expanded_words.append(w)
            
    if has_abbr:
        aliases.add(" ".join(expanded_words))
        
    # 4. Specific procedure permutations (e.g. CT Coronary Angiography)
    if "ct" in cleaned_tokens and "angiography" in cleaned_tokens:
        aliases.add(stripped.replace("angiography", "angio").strip())
        aliases.add("coronary ct angio")
        aliases.add("ct angio")

    return sorted(list(aliases))

def clean_code(code):
    """Normalizes item codes and removes internal spaces."""
    if not code or str(code).lower() in ['nan', 'none']: return ""
    return re.sub(r'\s+', '', str(code)).strip().upper()

def clean_tokens(text):
    """Returns a list of clean tokens for embeddings and matching."""
    if not text: return []
    text = str(text).lower().translate(str.maketrans('', '', string.punctuation))
    return [w for w in text.split() if w]
