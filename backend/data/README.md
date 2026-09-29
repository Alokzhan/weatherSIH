# 📁 StormTrace AI - Data Directory Structure

This directory organizes raw, processed, and historical event datasets for the StormTrace AI system.

```
data/
├── raw/
│   ├── era5/        # Raw Copernicus ERA5 NetCDF/GRIB2 files
│   ├── imdaa/       # Raw NCMRWF IMDAA Reanalysis files
│   ├── neps_g/      # Raw NCMRWF NEPS-G 50-member GRIB2/NetCDF files
│   ├── gfs/         # Raw NOAA GFS Fallback GRIB2 files
│   └── ecmwf/       # Raw ECMWF Open Data files
│
├── processed/
│   ├── climatology/ # Processed 30-year quantile baselines (P50, P90, P95, P99)
│   ├── ensemble/    # Unified xarray 50-member NWP forecast tensors
│   ├── anomalies/   # EFI anomaly grids & 4D-ABB bounding boxes
│   ├── tracks/      # EKF centroid tracking outputs
│   └── downscaling/ # DDPM 5km downscaled tensors
│
├── events/          # Real Historical Extreme Event Suite
│   ├── event_001/   # Cyclone Amphan (May 2020)
│   ├── event_002/   # North India Heatwave (May 2024)
│   ├── event_003/   # Mumbai Cloudburst (July 2024)
│   └── event_004/   # Sikkim Teesta Flash Flood (Sept 2026)
│
└── README.md
```

> **Note**: `data/raw/` and `data/processed/` are excluded from Git tracking via `.gitignore`. Only metadata, scripts, configuration, and small sample test files are committed to version control.
