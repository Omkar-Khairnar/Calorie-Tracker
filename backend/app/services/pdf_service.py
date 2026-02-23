import pdfplumber
import io
from typing import List, Dict, Any

def extract_meals_from_pdf(pdf_data: bytes) -> List[Dict[str, Any]]:
    """
    Parses a PDF file and extracts tabular nutrition data.
    Maps it to a format compatible with MealLogCreate.
    """
    extracted_data = []
    with pdfplumber.open(io.BytesIO(pdf_data)) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if not table:
                continue
                
            # Assume first row is header if it contains keywords
            # For simplicity, we just look for rows with numeric values
            for row in table[1:]: # Skip header
                if not row or len(row) < 3:
                    continue
                
                try:
                    # Very basic mapping: [Date/Time, Food Name, Calories, Protein, Carbs, Fat]
                    # This logic should be refined based on actual PDF formats
                    extracted_data.append({
                        "meal_type": "Imported",
                        "consumed_at": row[0], # Should be parsed to ISO format
                        "items": [{
                            "name": str(row[1]),
                            "quantity": 1.0,
                            "unit": "serving",
                            "calories": float(row[2]) if row[2] else 0.0,
                            "protein": float(row[3]) if len(row) > 3 and row[3] else 0.0,
                            "carbs": float(row[4]) if len(row) > 4 and row[4] else 0.0,
                            "fat": float(row[5]) if len(row) > 5 and row[5] else 0.0,
                        }]
                    })
                except (ValueError, IndexError):
                    continue
                    
    return extracted_data
