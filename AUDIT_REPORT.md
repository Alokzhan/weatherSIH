# StormTrace AI Codebase Audit Report
**Project Name:** StormTrace AI  
**Focus:** AI-Driven Spatio-Temporal Tracking of Extreme Weather Anomalies in Large-Scale Numerical Weather Prediction Outputs  
**Audit Date:** September 28, 2026  

---

## 1. Executive Summary & Existing Functionality

The repository contains a full-stack weather anomaly tracking system consisting of:
- **Frontend (React + Vite + Tailwind + Mapbox/Leaflet)**: Includes high-grade UI components for live risk visualization, cyclone tracking, locality weather exploration, AI model hub, historical analysis, alert center, farmer advisory, and API testing.
- **Backend (FastAPI + Python)**: Exposes endpoints for real-time OpenWeatherMap / Open-Meteo fetching, GNN anomaly tracking, DDPM 12km→5km downscaling, EFI calculation, historical event validation, and user authentication.
- **AI / ML Pipeline Modules**:
  - **Icosahedral Spherical Mesh & GNN/ST-GNN** (`backend/stage1_gnn/`): Constructs a 642-node icosahedral grid for spatio-temporal message passing over spherical coordinates.
  - **DDPM / Diffusion Downscaling** (`backend/stage2_diffusion/`): U-Net based conditional diffusion model for downscaling 12km atmospheric fields to 5km.
  - **EFI Anomaly Detection Engine** (`backend/stage1_gnn/efi_compute.py`, `backend/ensemble_engine.py`): Computes Extreme Forecast Index against climatology.
  - **Physics-Informed Loss** (`backend/stage2_diffusion/physics_loss.py`): Enforces non-negativity and gradient consistency during downscaling training.
  - **Historical Validation Engine** (`backend/historical_validation.py`): Evaluates tracking and downscaling against past extreme events (e.g., Cyclone Amphan).

---

## 2. Fake / Synthetic Data Audit

The codebase currently contains several places where random fallback values or synthetic data generators are invoked when real NetCDF/GRIB files or full 30-year datasets are absent:

1. **`backend/data/synthetic.py` & `backend/data_pipeline.py`**:
   - `generate_synthetic_nwp_tensor(...)` generates lognormal/normal synthetic weather fields (`np.random.lognormal`, `np.random.normal`).
2. **`backend/stage1_gnn/dataset.py` & `inference.py`**:
   - Uses `generate_synthetic_nwp_tensor(...)` or `np.random.randn(...)` as dataset fallback.
3. **`backend/ensemble_engine.py`**:
   - Generates synthetic 50-member ensemble spreads using `np.random.normal(loc=1.0, scale=0.18)` when live NWP ensemble files are missing.
4. **`backend/tracking/detector.py`**:
   - Uses `np.random.normal(...)` to mock threat cell detection grids if array is empty.
5. **`backend/stage2_diffusion/ddpm.py` & `evaluation_metrics.py`**:
   - Training loops and evaluation functions fall back to `torch.randn(...)` or `np.random.exponential(...)`.
6. **Hardcoded Scientific Claims**:
   - Some UI labels and docstrings reference unverified claims like "99.9% accuracy" or "50-member real NEPS-G".

---

## 3. Real-Data Functionality Currently Present

The project already possesses working real-data connectors and loaders:
1. **Live Weather APIs** (`src/components/LocalityExplorer.tsx`, `backend/data/fetch_real_weather_archive.py`):
   - Real-time OpenWeatherMap (2.5 API), Open-Meteo (ERA5/ECMWF forecast model), and Nominatim OpenStreetMap reverse geocoding.
2. **Copernicus ERA5 Downloaders & Loaders** (`backend/data/download_copernicus_era5.py`, `backend/data/era5_loader.py`):
   - Ingests CDS ERA5 NetCDF/GRIB files for regional India domain (0°-40°N, 50°-110°E).
3. **Real Climatology Exceedance & EFI Calculation** (`backend/data/climatology.py`):
   - Computes percentiles (P90, P95, P99) and EFI from actual weather data.

---

## 4. SIH26078 Missing Requirements & Gaps

To strictly meet SIH26078 standards without any fake data fallbacks, the following upgrades are required:

1. **Production Pipeline Strict Real-Data Enforcement**:
   - Remove silent synthetic fallbacks in production pipelines. If real data is missing, return `REAL_DATA_NOT_AVAILABLE` or explicit status responses instead of fake random fields.
2. **Real ERA5 Ingestion & 30-Year Climatology Baseline**:
   - Provide a CLI tool (`python -m data.download --dataset era5`, `python -m data.climatology`) to ingest and construct regional climatology with NetCDF/Zarr support.
3. **Generic NWP Ensemble Interface (`NWPEnsembleDataset`)**:
   - Support generic multi-member ensemble format `[ensemble, time, var, lat, lon]` with adapters for ERA5/GFS/NEPS-G proxy data.
4. **Real Target ST-GNN Training & 3-10 Day Trajectory**:
   - Train ST-GNN on real historical ERA5/NWP anomaly sequences; compute trajectories from model outputs using centroid matching and IoU across T+6h to T+240h.
5. **Real DDPM Downscaling & Physics Loss**:
   - Train and evaluate DDPM on real regridded 12km → 5km fields with peak preservation metrics (CSI, POD, FAR, P99 Error).
6. **Data Provenance & System Status API**:
   - Provide `/api/data/status` returning real data flags (`synthetic_fallback: false`), `DATA_SOURCES.md`, and `manifest.json`.

---

## 5. Files to Modify

| File | Purpose of Modification |
|---|---|
| `backend/data/era5_loader.py` | Enforce strict real NetCDF/Zarr loading; remove synthetic fallbacks. |
| `backend/data/nwp_loader.py` | Implement `NWPEnsembleDataset` with ERA5/GFS/NEPS-G adapters. |
| `backend/data/climatology.py` | Build real P90/P95/P99 climatology without random gamma fallbacks. |
| `backend/stage1_gnn/dataset.py` | Load real ERA5/NWP 4D arrays for GNN training. |
| `backend/stage1_gnn/efi_compute.py` | Calculate EFI strictly using real climatology quantiles. |
| `backend/tracking/detector.py` | Detect anomaly cells from real arrays without random grid generation. |
| `backend/tracking/tracker.py` | Calculate real 3-10 day trajectory tracks via centroid matching. |
| `backend/stage2_diffusion/ddpm.py` | Run 12km→5km downscaling on real atmospheric slices. |
| `backend/stage2_diffusion/evaluation_metrics.py` | Compute real RMSE, MAE, SSIM, CSI, POD, FAR on real data. |
| `backend/api/main.py` | Update `/api/data/status` and endpoints to return clean real status. |
| `src/components/AiModelHub.tsx` | Align UI metrics and labels with real measured evaluation values. |

---

## 6. Files to Remain Unchanged

| File | Reason |
|---|---|
| `src/components/Sidebar.tsx` | UI sidebar navigation and layout are clean and verified. |
| `src/components/Header.tsx` | Top header component functions properly. |
| `src/components/LiveRiskMap.tsx` | Map visualizer was recently updated with CartoDB tiles and works smoothly. |
| `src/components/CycloneTracker.tsx` | Leaflet cyclone tracking UI is functional. |
| `src/components/LocalityExplorer.tsx` | Live weather lookup connected to OpenWeatherMap/Open-Meteo is functional. |
| `backend/stage1_gnn/icosahedral_mesh.py` | Spherical grid mesh logic (642 nodes, 1280 edges) is mathematically sound. |

---

## 7. Execution Plan

We will execute the implementation phase-by-phase as outlined in Section 34 of the task specification:
- **Phase 2**: Real ERA5 Ingestion CLI & Adapter
- **Phase 3**: Real Climatology Pipeline
- **Phase 4**: NWP Ensemble Dataset (`NWPEnsembleDataset`)
- **Phase 5**: 4D Preprocessing
- **Phase 6**: Real EFI & Anomaly Detection
- **Phase 7 & 8**: Real ST-GNN Training & Inference
- **Phase 9**: Real 3-10 Day Tracking
- **Phase 10 & 11**: Real DDPM 12km→5km Downscaling & Physics Loss
- **Phase 12**: Real Historical Validation
- **Phase 13 & 14**: API & Dashboard Integration
- **Phase 15**: Automated Tests (`pytest`)
- **Phase 16**: Final SIH26078 Compliance Audit (`SIH26078_IMPLEMENTATION_AUDIT.md`)
