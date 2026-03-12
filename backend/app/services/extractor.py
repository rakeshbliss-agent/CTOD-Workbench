import re
from typing import Optional
from pypdf import PdfReader


def extract_pages_from_pdf(file_path: str) -> list[dict]:
    reader = PdfReader(file_path)
    pages: list[dict] = []

    for index, page in enumerate(reader.pages):
        text = page.extract_text() or ''
        pages.append({
            'page_number': index + 1,
            'text': text,
        })

    return pages


def normalize_whitespace(value: str) -> str:
    return re.sub(r'\s+', ' ', value).strip()


def build_aliases(field_name: str, section: str) -> list[str]:
    aliases = [field_name.strip()]
    lower_name = field_name.lower().strip()

    alias_map = {
        'study title': ['title of study', 'study name', 'protocol title'],
        'country': ['countries', 'study country', 'location', 'region'],
        'dose': ['dosage', 'dose level', 'treatment dose'],
        'age': ['mean age', 'median age'],
        'gender': ['sex'],
        'sample size': ['n=', 'number of patients', 'patients enrolled'],
    }

    if lower_name in alias_map:
        aliases.extend(alias_map[lower_name])

    if section and section.lower() not in lower_name:
        aliases.append(f'{section} {field_name}')

    deduped = []
    seen = set()
    for alias in aliases:
        key = alias.lower()
        if key not in seen:
            deduped.append(alias)
            seen.add(key)
    return deduped


def extract_value_from_line(line: str, alias: str) -> Optional[str]:
    patterns = [
        rf'{re.escape(alias)}\s*[:\-]\s*(.+)',
        rf'{re.escape(alias)}\s+(.+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, line, flags=re.IGNORECASE)
        if match:
            value = normalize_whitespace(match.group(1))
            if value:
                return value
    return None


def find_field_match(field_name: str, section: str, pages: list[dict]) -> dict:
    aliases = build_aliases(field_name, section)

    best_result = {
        'extracted_value': None,
        'evidence_snippet': None,
        'page_number': None,
        'confidence': 0.0,
        'status': 'Draft',
    }

    for page in pages:
        page_text = page['text']
        if not page_text.strip():
            continue

        lines = [normalize_whitespace(line) for line in page_text.splitlines() if line.strip()]

        for alias in aliases:
            for idx, line in enumerate(lines):
                if alias.lower() not in line.lower():
                    continue

                value = extract_value_from_line(line, alias)

                if not value and idx + 1 < len(lines):
                    next_line = lines[idx + 1]
                    if len(next_line) <= 200:
                        value = next_line

                evidence = line
                if idx + 1 < len(lines):
                    evidence = f'{line} {lines[idx + 1]}'

                evidence = normalize_whitespace(evidence)[:500]

                if value:
                    return {
                        'extracted_value': value[:1000],
                        'evidence_snippet': evidence,
                        'page_number': page['page_number'],
                        'confidence': 0.86,
                        'status': 'Draft',
                    }

                best_result = {
                    'extracted_value': None,
                    'evidence_snippet': evidence,
                    'page_number': page['page_number'],
                    'confidence': 0.35,
                    'status': 'Draft',
                }

    return best_result
