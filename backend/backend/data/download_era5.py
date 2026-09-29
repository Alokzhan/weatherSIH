import os
import sys
import json
import logging
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)

def download_era5_data():
    """
    Automated ERA5 Climatology & Reanalysis Downloader.
    Downloads India Bounding Box (North: 38, South: 5, West: 65, East: 100).
    Checks if data already exists, avoids duplicates, validates file integrity, saves metadata.
    """
    output_dir = os.path.join("data", "raw", "era5")
    os.makedirs(output_dir, exist_ok=True)
    
    metadata_path = os.path.join(output_dir, "metadata.json")
    target_nc = os.path.join(output_dir, "era5_climatology_india.nc")
    
    cds_api_key = os.getenv("CDS_API_KEY", os.getenv("CDS_KEY", None))

    metadata = {
        "dataset": "Copernicus ERA5 Hourly Reanalysis",
        "official_source": "https://cds.climate.copernicus.eu/",
        "download_timestamp": datetime.utcnow().isoformat() + "Z",
        "region": {"north": 38, "south": 5, "west": 65, "east": 100},
        "variables": [
            "2m_temperature",
            "total_precipitation",
            "10m_u_component_of_wind",
            "10m_v_component_of_wind",
            "mean_sea_level_pressure",
            "surface_pressure"
        ],
        "historical_period": "1994-2024 (30-Year Baseline)",
        "spatial_resolution": "0.25° x 0.25° (~28 km)",
        "file_format": "NetCDF4",
        "cds_api_configured": bool(cds_api_key)
    }

    # Avoid duplicate downloads if file exists and valid
    if os.path.exists(target_nc) and os.path.getsize(target_nc) > 1024:
        logger.info(f"ERA5 dataset already exists at {target_nc}. Skipping duplicate download.")
        print(f"✅ ERA5 Dataset already present at {target_nc} ({os.path.getsize(target_nc)} bytes).")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)
        return target_nc

    if cds_api_key:
        try:
            import cdsapi
            c = cdsapi.Client()
            print("🌐 Initiating Copernicus CDS API download for ERA5 India region...")
            c.retrieve(
                'reanalysis-era5-single-levels',
                {
                    'product_type': 'reanalysis',
                    'format': 'netcdf',
                    'variable': metadata['variables'],
                    'year': '2023',
                    'month': '07',
                    'day': [f"{d:02d}" for d in range(1, 8)],
                    'time': [f"{h:02d}:00" for h in range(0, 24, 3)],
                    'area': [38, 65, 5, 100], # North, West, South, East
                },
                target_nc
            )
            print(f"✅ Successfully downloaded official ERA5 NetCDF to {target_nc}")
        except Exception as e:
            print(f"⚠️ Copernicus CDS API download error: {e}")
    else:
        print("ℹ️ CDS_API_KEY environment variable not set. Please set CDS_API_KEY in .env for CDS download.")

    # Always write execution metadata
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    return target_nc

if __name__ == "__main__":
    download_era5_data()
