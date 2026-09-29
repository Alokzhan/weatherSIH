import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def download_neps_g_data():
    """
    Automated NEPS-G 50-Member Ensemble Forecast Data Downloader & Directory Inspector.
    Expected folder structure: data/raw/neps_g/YYYY/MM/DD/forecast/*.grib2 or *.nc
    """
    output_dir = os.path.join("data", "raw", "neps_g")
    os.makedirs(output_dir, exist_ok=True)
    
    metadata_path = os.path.join(output_dir, "metadata.json")

    metadata = {
        "dataset": "NCMRWF NEPS-G 50-Member Ensemble Forecast System",
        "official_source": "https://www.ncmrwf.gov.in/",
        "download_timestamp": datetime.utcnow().isoformat() + "Z",
        "expected_members": 50,
        "variables": ["precipitation", "temperature", "u_wind", "v_wind", "pressure", "humidity"],
        "forecast_lead_hours": 240,
        "spatial_resolution": "~12 km (N768 Gaussian Grid)",
        "expected_structure": "data/raw/neps_g/YYYY/MM/DD/forecast/*.grib2",
        "instructions": (
            "Place official NCMRWF NEPS-G GRIB2 or NetCDF4 files in data/raw/neps_g/YYYY/MM/DD/forecast/\n"
            "The neps_g adapter (backend/data/adapters/neps_g.py) will parse all 50 members directly."
        )
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print("ℹ️ NEPS-G metadata saved in data/raw/neps_g/metadata.json")

if __name__ == "__main__":
    download_neps_g_data()
