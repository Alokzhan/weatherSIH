# Data Sources & Provenance Metadata
**Project Name:** StormTrace AI  
**Focus:** AI-Driven Spatio-Temporal Tracking of Extreme Weather Anomalies in Large-Scale Numerical Weather Prediction Outputs  

---

## 1. Primary Datasets

### A. Copernicus ERA5 Atmospheric Reanalysis
- **Source:** ECMWF Copernicus Climate Change Service (C3S)
- **URL:** [https://cds.climate.copernicus.eu](https://cds.climate.copernicus.eu)
- **Dataset Name:** ERA5 hourly data on single levels from 1940 to present
- **Variables:**
  - 2m Temperature (`t2m`) [K]
  - 10m u-component of wind (`u10`) [m/s]
  - 10m v-component of wind (`v10`) [m/s]
  - Surface pressure (`sp`) / Mean sea level pressure (`msl`) [Pa / hPa]
  - Total precipitation (`tp`) [m / mm]
  - Relative humidity (`r`) [%]
- **Spatial Resolution:** 0.25° × 0.25° (~25–30 km) regridded to 0.12° (~12 km) over India Domain
- **Temporal Resolution:** Hourly / 6-hourly aggregated to 24-hour totals
- **Domain:** Latitude 0°N to 40°N, Longitude 50°E to 110°E (India & North Indian Ocean)
- **License:** Licence to use Copernicus Products

### B. Open-Meteo ECMWF / ERA5 Historical & Forecast APIs
- **Source:** Open-Meteo High-Resolution Weather API & Historical Weather API
- **URL:** [https://open-meteo.com/en/docs/era5](https://open-meteo.com/en/docs/era5)
- **Variables:** `temperature_2m`, `relative_humidity_2m`, `precipitation`, `surface_pressure`, `wind_speed_10m`, `wind_direction_10m`
- **Spatial Resolution:** 11 km
- **License:** Non-Commercial / CC BY 4.0

### C. NCMRWF NEPS-G 50-Member Global Ensemble (Proxy Adapter Support)
- **Source:** National Centre for Medium Range Weather Forecasting (NCMRWF), India
- **URL:** [https://www.ncmrwf.gov.in](https://www.ncmrwf.gov.in)
- **Dataset Name:** NCMRWF Ensemble Prediction System (NEPS-G)
- **Members:** 50 Ensemble Members + Control Run
- **Resolution:** ~12 km horizontal resolution
- **Adapter Class:** `backend.data.adapters.neps_adapter.NEPSGAdapter`

---

## 2. Processing Steps & Climatology
1. **Domain Crop:** Extracted 0°N–40°N, 50°E–110°E.
2. **Quantile Baseline:** Calculated P50, P90, P95, P99, and P99.9 percentile fields over historical monsoon/cyclone seasons.
3. **Storage Format:** Stored locally in NetCDF (`.nc`), Zarr (`.zarr`), and compressed NumPy archive (`.npz`) formats under `backend/data/processed/` and `backend/data/era5_archive/`.
