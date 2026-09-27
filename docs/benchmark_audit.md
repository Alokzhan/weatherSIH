# Historical Validation Metric Audit & Traceability Report

**Repository:** `https://github.com/Alokzhan/wheatherSIH`  
** Problem Statement:**  — AI-Driven Spatio-Temporal Tracking of Extreme Weather Anomalies in Medium-Range Forecasts  
**Audit Date:** September 26, 2026  

---

## Executive Summary

This document traces every quantitative metric claimed in the repository README and validation reports back to the exact lines of Python source code that produced them. 

**Scientific Finding:** All reported benchmark numbers (CSI, POD, FAR, Trajectory Error, Peak Preservation, CRPS, Brier Score) are currently generated using synthetic random distribution calls (`np.random.uniform`, `np.random.normal`, `np.random.exponential`) inside simulation loops. No historical event benchmark was produced by running predictions against real Copernicus ERA5 atmospheric reanalysis or IMD ground observations.

All historical metrics are classified as: **UNVERIFIED / INVALID SCIENTIFIC BENCHMARK**.

---

## Metric Traceability Matrix

| README / Report Metric | Claimed Value | Source Python File | Source Code Line / Expression | Audit Classification |
| :--- | :--- | :--- | :--- | :--- |
| **Probability of Detection (POD)** | `0.982` (or 97-99%) | `backend/historical_validation.py` | `line 143`: `pod = round(float(0.97 + np.random.uniform(0.005, 0.02)), 3)` | ❌ Synthetic (Random Generator) |
| **False Alarm Ratio (FAR)** | `0.013` (0.8-1.6%) | `backend/historical_validation.py` | `line 144`: `far = round(float(0.008 + np.random.uniform(0.002, 0.008)), 3)` | ❌ Synthetic (Random Generator) |
| **Critical Success Index (CSI)** | `0.976` (96.5-98.5%) | `backend/historical_validation.py` | `line 145`: `csi = round(float(0.965 + np.random.uniform(0.005, 0.02)), 3)` | ❌ Synthetic (Random Generator) |
| **Peak Preservation Pct** | `99.9%` (99.8-99.95%) | `backend/historical_validation.py` | `line 150`: `peak_retention_pct = round(float(99.8 + np.random.uniform(0.02, 0.15)), 1)` | ❌ Synthetic (Random Generator) |
| **RMSE (Precipitation)** | `0.9-1.1 mm` | `backend/historical_validation.py` | `line 151`: `rmse = round(float(0.9 + np.random.uniform(0.05, 0.2)), 2)` | ❌ Synthetic (Random Generator) |
| **MAE (Precipitation)** | `0.65-0.80 mm` | `backend/historical_validation.py` | `line 152`: `mae = round(float(0.65 + np.random.uniform(0.05, 0.15)), 2)` | ❌ Synthetic (Random Generator) |
| **Trajectory Position Error** | `1.96 km` | `backend/historical_validation.py` | `line 138-141`: `pred_lat = obs_lat + np.random.normal(0, 0.015)` | ❌ Synthetic (Perturbing Obs Centroid) |
| **Trajectory IoU** | `0.95-0.98` | `backend/historical_validation.py` | `line 164`: `"trajectoryIoU": round(float(0.95 + np.random.uniform(0.005, 0.03)), 3)` | ❌ Synthetic (Random Generator) |
| **Track Direction Error** | `0.8-1.2°` | `backend/historical_validation.py` | `line 165`: `"trackDirectionErrorDeg": round(float(0.8 + np.random.uniform(0.1, 0.4)), 1)` | ❌ Synthetic (Random Generator) |
| **CRPS Score** | `45.91` | `backend/ensemble_engine.py` | `line 57-58`: Evaluated on single-grid perturbations (`coarse_grid * np.random.normal(1.0, 0.18)`) | ❌ Unverified (Synthetic Ensemble) |
| **Brier Score** | `0.0208` | `backend/ensemble_engine.py` | `line 59`: Evaluated on single-grid perturbations | ❌ Unverified (Synthetic Ensemble) |

---

## Detailed Audit of Historical Events (2014–2024)

The validation script `backend/historical_validation.py` defines 10 case studies:
1. `cyclone_hudhud_2014`
2. `chennai_floods_2015`
3. `cyclone_ockhi_2017`
4. `kerala_floods_2018`
5. `cyclone_fani_2019`
6. `cyclone_amphan_2020`
7. `cyclone_tautae_2021`
8. `mumbai_cloudburst_2023`
9. `heatdome_2024`
10. `kosi_flashflood_2024`

### Execution Pattern Identified in Code:
```python
# From backend/historical_validation.py: lines 135-153
for event_key, meta in self.events_10y.items():
    np.random.seed(abs(hash(event_key)) % (2**32))

    obs_lat, obs_lon = meta["observedCentroid"]
    pred_lat = obs_lat + np.random.normal(0, 0.015)
    pred_lon = obs_lon + np.random.normal(0, 0.015)

    pod = round(float(0.97 + np.random.uniform(0.005, 0.02)), 3)
    far = round(float(0.008 + np.random.uniform(0.002, 0.008)), 3)
    csi = round(float(0.965 + np.random.uniform(0.005, 0.02)), 3)
```

**Conclusion:** The code iterates over event names, sets a seed based on the string hash, and samples metric values directly from uniform distributions tightly constrained near perfect scores (POD ~0.98, CSI ~0.97, FAR ~0.01). Real historical reanalysis data for these 10 events is never downloaded, compared, or evaluated.

---

## Required Remediation Steps

1. Replace synthetic score generators in `backend/historical_validation.py` with true ERA5 historical NetCDF / GRIB slice loader.
2. Calculate spatial contingency tables (TP, FP, FN, TN) against actual IMD rain gauge or ERA5 grid observations.
3. Compute trajectory displacement errors between actual IMD cyclone track best-track coordinates and ST-GNN output centroids.
4. Regenerate `backend/data/historical_validation_10y_report.json` using reproducible, un-seeded real observation evaluation.
