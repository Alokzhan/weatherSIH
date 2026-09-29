import os
import glob
import logging

logger = logging.getLogger(__name__)

# Mandatory label: Never call GFS data NEPS-G
DATA_SOURCE = "GFS_FALLBACK"

class GFSAdapter:
    """
    NOAA GFS Development Fallback Adapter.
    Used exclusively as an open-access public NWP development fallback.
    MUST NOT be called NEPS-G.
    """
    def __init__(self, raw_dir: str = None):
        self.raw_dir = raw_dir or os.path.join("data", "raw", "gfs")

    def load_gfs_forecast(self):
        files = glob.glob(os.path.join(self.raw_dir, "*.grib2")) + glob.glob(os.path.join(self.raw_dir, "*.nc"))
        if files:
            return {
                "source": DATA_SOURCE,
                "files_count": len(files),
                "provider": "NOAA NOMADS (Public Access)",
                "status": "VALID_DEVELOPMENT_FALLBACK"
            }
        return {
            "source": DATA_SOURCE,
            "files_count": 0,
            "provider": "NOAA NOMADS (Public Access)",
            "status": "NO_GFS_FILES",
            "download_script": "python backend/data/download_gfs.py"
        }
