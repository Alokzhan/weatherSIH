import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def download_imdaa_data():
    """
    Automated IMDAA Data Downloader & Manual Download Instructions Logger.
    """
    output_dir = os.path.join("data", "raw", "imdaa")
    os.makedirs(output_dir, exist_ok=True)
    
    metadata_path = os.path.join(output_dir, "metadata.json")

    ncmrwf_user = os.getenv("NCMRWF_USERNAME", None)

    metadata = {
        "dataset": "High-Resolution Regional Land Data Assimilation (IMDAA)",
        "official_source": "https://www.ncmrwf.gov.in/",
        "access_method": "NCMRWF Official Regional Distribution Portal",
        "download_timestamp": datetime.utcnow().isoformat() + "Z",
        "region": {"north": 45, "south": 0, "west": 60, "east": 110},
        "spatial_resolution": "12 km x 12 km Native Regional Grid",
        "variables": ["2m_temperature", "total_precipitation", "soil_moisture", "surface_pressure", "u10", "v10"],
        "ncmrwf_user_configured": bool(ncmrwf_user),
        "manual_download_required": True,
        "instructions": (
            "1. Visit https://www.ncmrwf.gov.in/\n"
            "2. Register for authenticated access to IMDAA high-resolution regional reanalysis.\n"
            "3. Place downloaded .grib2 or .nc files into data/raw/imdaa/\n"
            "4. Run python -m backend.data.validate_dataset"
        )
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print("ℹ️ IMDAA metadata updated in data/raw/imdaa/metadata.json")
    print(metadata["instructions"])

if __name__ == "__main__":
    download_imdaa_data()
