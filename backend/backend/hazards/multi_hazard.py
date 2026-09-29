import numpy as np

def detect_heat_dome(t_max_array, hist_95th_percentile, sustained_days):
    """
    Heat dome detection: T_max > historical 95th percentile + sustained for N days.
    """
    is_anomaly = t_max_array > hist_95th_percentile
    # simplified 1D check for consecutive days
    consecutive_days = 0
    max_consecutive = 0
    for day in is_anomaly:
        if day:
            consecutive_days += 1
            max_consecutive = max(max_consecutive, consecutive_days)
        else:
            consecutive_days = 0
            
    hazard_detected = max_consecutive >= sustained_days
    return {
        "hazard": "Heat Dome", 
        "detected": bool(hazard_detected),
        "duration_days": int(max_consecutive), 
        "peak_anomaly_c": float(np.max(t_max_array - hist_95th_percentile)) if hazard_detected else 0.0
    }

def detect_wind_extremes(wind_gust_array):
    """
    Wind extreme detection: wind_gust > 62 kmh.
    """
    max_gust = np.max(wind_gust_array)
    hazard_detected = max_gust > 62.0
    return {
        "hazard": "Wind Extremes", 
        "detected": bool(hazard_detected),
        "max_gust_kmh": float(max_gust)
    }

def track_extreme_rainfall(precip_array_24h):
    """
    Extreme rainfall: > 124.5 mm in 24h (IMD definition for Very Heavy Rain).
    """
    max_rain = np.max(precip_array_24h)
    hazard_detected = max_rain > 124.5
    return {
        "hazard": "Extreme Rainfall", 
        "detected": bool(hazard_detected),
        "peak_mm_24h": float(max_rain)
    }

def detect_orographic_landslide(precip_array_24h, dem_slope_array):
    """
    Landslide risk: Rain > 50mm AND Slope > 30 degrees.
    """
    risk_mask = (precip_array_24h > 50.0) & (dem_slope_array > 30.0)
    hazard_detected = np.any(risk_mask)
    return {
        "hazard": "Landslide Risk", 
        "detected": bool(hazard_detected),
        "risk_level": "High" if hazard_detected else "Low"
    }
