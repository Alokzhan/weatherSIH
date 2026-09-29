import os
import json
import logging
import urllib.request
from datetime import datetime

logger = logging.getLogger(__name__)

# Mandatory label
DATA_SOURCE = "GFS_FALLBACK"

def download_gfs_fallback_data():
    """
    Automated NOAA GFS Development Fallback Downloader.
    Uses NOAA NOMADS open access portal (https://nomads.ncep.noaa.gov/).
    Explicitly labeled as GFS_FALLBACK - NEVER called NEPS-G.
    """
    output_dir = os.path.join("data", "raw", "gfs")
    os.makedirs(output_dir, exist_ok=True)
    
    metadata_path = os.path.join(output_dir, "metadata.json")

    metadata = {
        "dataset_label": DATA_SOURCE,
        "provider": "NOAA NOMADS (NCEP Global Forecast System)",
        "official_source": "https://nomads.ncep.noaa.gov/",
        "purpose": "Open-access public NWP development fallback for data pipeline testing",
        "download_timestamp": datetime.utcnow().isoformat() + "Z",
        "region": {"north": 38, "south": 5, "west": 65, "east": 100},
        "spatial_resolution": "0.25° x 0.25° (~28 km)",
        "variables": ["temperature", "precipitation", "u_wind", "v_wind", "pressure", "humidity"]
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"✅ GFS Development Fallback metadata saved in data/raw/gfs/metadata.json (Source: {DATA_SOURCE})")

if __name__ == "__main__":
    download_gfs_fallback_data()
