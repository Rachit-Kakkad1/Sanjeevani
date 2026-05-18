from ingestion.utils import clean_tokens

def prepare_for_matching(record):
    """
    Adds match preparation metadata to a record for the audit engine.
    """
    name = record.get("canonicalName", "")
    aliases = record.get("aliases", [])
    
    normalized_tokens = clean_tokens(name)
    
    alias_tokens = set()
    for alias in aliases:
        alias_tokens.update(clean_tokens(alias))
        
    # Combine code, name, and aliases for full-text search
    searchable_text = f"{record.get('code', '')} {name} {' '.join(aliases)}"
    searchable_text = " ".join(clean_tokens(searchable_text))
    
    record["matchData"] = {
        "normalizedTokens": normalized_tokens,
        "aliasTokens": list(alias_tokens),
        "searchableText": searchable_text
    }
    
    return record
