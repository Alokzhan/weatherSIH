# 🌐 Real Meteorological Data Sources Specification

This document details all official real-world meteorological datasets integrated into the **StormTrace AI** system (*Problem Statement PS-EW2026*).

---

## 1. ERA5 / ERA5-Land (Copernicus Climate Data Store)

* **Dataset Name**: ERA5 Reanalysis & ERA5-Land High-Resolution Stream
* **Official Source**: Copernicus Climate Data Store (CDS) — [https://cds.climate.copernicus.eu/](https://cds.climate.copernicus.eu/)
* **Access Method**: Automated Python `cdsapi` client using official user credentials (`CDS_API_KEY` in `.env`).
* **Variables**:
  * Surface 2m Temperature (`2m_temperature`)
  * Total Precipitation (`total_precipitation`)
  * 10m U Wind (`10m_u_component_of_wind`)
  * 10m V Wind (`10m_v_component_of_wind`)
  * Mean Sea Level Pressure (`mean_sea_level_pressure`)
  * Relative Humidity / Surface Pressure (`surface_pressure`)
  * 3D Upper-Air Geopotential, Specific Humidity, U/V Wind ($1000, 925, 850, 700, 500\text{ hPa}$)
* **Spatial Resolution**:
  * ERA5 Reanalysis: $0.25^\circ \times 0.25^\circ$ ($\sim 28\text{ km}$)
  * ERA5-Land: $0.1^\circ \times 0.1^\circ$ ($\sim 9\text{ km}$)
* **Temporal Resolution**: Hourly ($1\text{ h}$)
* **Geographic Coverage**: India / South Asia Bounding Box ($5^\circ\text{N} - 38^\circ\text{N}$, $65^\circ\text{E} - 100^\circ\text{E}$)
* **Historical Period**: 30-Year Climatology Baseline ($1994 - 2024$)
* **File Format**: NetCDF4 (`.nc`) / GRIB2 (`.grib2`)
* **License/Access Restrictions**: Open Access under Copernicus License; requires free CDS account registration and API Key.
* **Exact Purpose**:
  * Calculating 30-year grid-wide climatology baseline quantiles ($P_{50}, P_{90}, P_{95}, P_{99}$).
  * Ground-truth target labels for Stage 2 DDPM Physics-Informed Downscaling ($12\text{ km} \to 5\text{ km}$).
  * Evaluating Extreme Forecast Index (EFI) integrals.

---

## 2. IMDAA (India Regional Reanalysis Dataset)

* **Dataset Name**: High-Resolution Regional Land Data Assimilation (IMDAA)
* **Official Source**: National Centre for Medium Range Weather Forecasting (NCMRWF), Ministry of Earth Sciences — [https://www.ncmrwf.gov.in/](https://www.ncmrwf.gov.in/)
* **Access Method**: Direct download via NCMRWF data portal or local adapter `data/raw/imdaa/` for manual authenticated downloads.
* **Variables**: 2m Temperature, Total Rain, Soil Moisture, Surface Pressure, U/V 10m Wind.
* **Spatial Resolution**: $12\text{ km} \times 12\text{ km}$ native regional grid over South Asia.
* **Temporal Resolution**: Hourly / 3-Hourly.
* **Geographic Coverage**: Indian Subcontinent ($0^\circ\text{N} - 45^\circ\text{N}$, $60^\circ\text{E} - 110^\circ\text{E}$).
* **Historical Period**: $1979 - \text{Present}$.
* **File Format**: GRIB2 (`.grib2`) / NetCDF4 (`.nc`).
* **License/Access Restrictions**: Government Access / Research Registration required.
* **Exact Purpose**: High-resolution Indian regional historical baseline and regional extreme event validation.

---

## 3. NCMRWF NEPS-G (Global Ensemble Prediction System)

* **Dataset Name**: NCMRWF Ensemble Prediction System - Global (NEPS-G)
* **Official Source**: NCMRWF, MoES India — [https://www.ncmrwf.gov.in/](https://www.ncmrwf.gov.in/)
* **Access Method**: Local data adapter `backend/data/adapters/neps_g.py` parsing official GRIB2/NetCDF files stored in `data/raw/neps_g/YYYY/MM/DD/forecast/`.
* **Variables**: Total Precipitation, 2m Temp, 10m U/V Wind, MSLP, 500hPa Geopotential.
* **Spatial Resolution**: $\sim 12\text{ km}$ ($\text{N768}$ Gaussian grid).
* **Temporal Resolution**: 3-Hourly out to $T+240\text{ h}$ (10 Days).
* **Geographic Coverage**: Global / Sub-sampled South Asia Domain.
* **Ensemble Size**: **50 Real Ensemble Members** ($M_1 \dots M_{50}$) + 1 Control Member.
* **Historical Period**: Operational daily forecasts ($2020 - \text{Present}$).
* **File Format**: GRIB2 (`.grib2`) / NetCDF4 (`.nc`).
* **License/Access Restrictions**: Restricted MoES Operational NWP Access.
* **Exact Purpose**: Primary  input for Stage 1 PyTorch Spherical ST-GNN multi-member storm centroid tracking.

---

## 4. NOAA GFS (Development Fallback Dataset)

* **Dataset Name**: NOAA Global Forecast System (GFS 0.25° Ensemble / Deterministic)
* **Official Source**: NOAA NOMADS Operational Server — [https://nomads.ncep.noaa.gov/](https://nomads.ncep.noaa.gov/)
* **Access Method**: Open HTTP / HTTPs / OpenDAP automated fallback client (`backend/data/download_gfs.py`). Labeled explicitly as `DATA_SOURCE = "GFS_FALLBACK"`.
* **Variables**: Total Precipitation, 2m Temp, 10m Wind, MSLP, Relative Humidity.
* **Spatial Resolution**: $0.25^\circ \times 0.25^\circ$ ($\sim 28\text{ km}$).
* **Temporal Resolution**: 3-Hourly out to $T+240\text{ h}$.
* **Geographic Coverage**: India Bounding Box ($5^\circ\text{N} - 38^\circ\text{N}$, $65^\circ\text{E} - 100^\circ\text{E}$).
* **File Format**: GRIB2 / NetCDF4.
* **License/Access Restrictions**: Public Domain (NOAA Open Data).
* **Exact Purpose**: Open-access development fallback to verify NWP ingestion pipeline when NEPS-G operational servers require credentials.

---

## 5. ECMWF Open Data (Optional Forecast Source)

* **Dataset Name**: ECMWF Open Data Real-Time Broadcast
* **Official Source**: ECMWF Open Data Portal — [https://www.ecmwf.int/en/forecasts/datasets/open-data](https://www.ecmwf.int/en/forecasts/datasets/open-data)
* **Access Method**: Python `ecmwf-opendata` client (`backend/data/adapters/ecmwf.py`).
* **Variables**: Surface Temperature, Total Precipitation, 10m Wind Speed, MSLP.
* **Spatial Resolution**: $0.4^\circ \times 0.4^\circ$.
* **Temporal Resolution**: 3-Hourly out to $T+144\text{ h}$.
* **File Format**: GRIB2.
* **License/Access Restrictions**: CC-BY 4.0 Open License.
* **Exact Purpose**: Optional secondary NWP forecast provider for multi-model cross-validation.

---

## 6. Open-Meteo Live API (Demonstration Only)

* **Dataset Name**: Open-Meteo ECMWF & GFS Seamless Forecast & Historical API
* **Official Source**: Open-Meteo — [https://open-meteo.com/](https://open-meteo.com/)
* **Access Method**: HTTP REST API (`LIVE_WEATHER_DEMO`).
* **License/Access Restrictions**: Open Access CC-BY 4.0.
* **Exact Purpose**: Live UI dashboard demonstration and real-time client search. **Not** used for scientific ML model training or validation benchmark reporting.

---

## 7. Real Historical Extreme Event Validation Datasets

Stored in `data/events/`:
1. **`event_001` (Super Cyclone Amphan - May 2020)**: NOAA IBTrACS & IMD Best Track Dataset.
2. **`event_002` (North India Severe Heatwave - May 2024)**: Copernicus ERA5 Surface Temperature Reanalysis.
3. **`event_003` (Mumbai Severe Cloudburst - July 2024)**: IMD Telemetry & ERA5-Land 9km Stream.
4. **`event_004` (Sikkim Teesta Flash Flood - Sept 2026)**: Copernicus ERA5-Land & Open-Meteo Historical Archive.
