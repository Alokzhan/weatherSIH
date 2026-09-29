import os
import glob
import logging

logger = logging.getLogger(__name__)

DATA_SOURCE = "ECMWF_OPEN_DATA"

class ECMWFAdapter:
    """
    ECMWF Open Data Optional Forecast Source Adapter.
    """
    def __init__(self, raw_dir: str = None):
        self.raw_dir = raw_dir or os.path.join("data", "raw", "ecmwf")

    def load_ecmwf_forecast(self):
        files = glob.glob(os.path.join(self.raw_dir, "*.grib2")) + glob.glob(os.path.join(self.raw_dir, "*.nc"))
        if files:
            return {
                "source": DATA_SOURCE,
                "files_count": len(files),
                "status": "VALID_ECMWF_OPEN_DATA"
            }
        return {
            "source": DATA_SOURCE,
            "files_count": 0,
            "status": "NO_ECMWF_FILES"
        }
