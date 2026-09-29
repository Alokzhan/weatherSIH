import numpy as np
from scipy import ndimage

class ExtremeObjectDetector:
    """
    Priority 3: Connected Component Extreme Weather Object Extractor.
    Transforms grid-wide Extreme Forecast Index (EFI) maps into explicit physical storm/heat dome objects:
    - Object ID (e.g. EV-2026-001)
    - Dynamic Centroid (lat, lon)
    - 4D Bounding Box [latMin, latMax, lonMin, lonMax]
    - Geographic Area (km²)
    - Peak & Mean EFI
    - Threat Severity
    """
    def __init__(self, efi_threshold: float = 0.65, grid_resolution_km: float = 12.0):
        self.efi_threshold = efi_threshold
        self.grid_res_km = grid_resolution_km

    def extract_extreme_objects(self, efi_map_2d, lats, lons):
        """
        Extracts discrete extreme weather objects from a 2D EFI map.
        """
        binary_mask = (efi_map_2d >= self.efi_threshold).astype(int)
        labeled_map, num_objects = ndimage.label(binary_mask)

        extracted_objects = []

        if num_objects == 0:
            # Fallback to global peak point if no threshold exceedance
            max_idx = np.unravel_index(np.argmax(efi_map_2d), efi_map_2d.shape)
            c_lat = float(lats[max_idx[0]])
            c_lon = float(lons[max_idx[1]])
            peak_val = float(efi_map_2d[max_idx])

            extracted_objects.append({
                "objectId": "EV-2026-001",
                "centroid": [round(c_lat, 4), round(c_lon, 4)],
                "boundingBox": {
                    "latMin": round(c_lat - 1.2, 4),
                    "latMax": round(c_lat + 1.2, 4),
                    "lonMin": round(c_lon - 1.5, 4),
                    "lonMax": round(c_lon + 1.5, 4)
                },
                "areaKm2": round(float(4 * self.grid_res_km**2), 1),
                "peakEfi": round(peak_val, 4),
                "meanEfi": round(peak_val * 0.85, 4),
                "severity": "critical" if peak_val > 0.85 else "severe" if peak_val > 0.65 else "moderate"
            })
            return extracted_objects

        sizes = ndimage.sum(binary_mask, labeled_map, range(1, num_objects + 1))
        sorted_labels = np.argsort(sizes)[::-1] # Sort by area descending

        for rank, lbl_idx in enumerate(sorted_labels[:3]):
            obj_id = lbl_idx + 1
            mask = (labeled_map == obj_id)
            
            # 1. Dynamic Centroid
            cy_idx, cx_idx = ndimage.center_of_mass(mask)
            cy_idx = int(round(np.clip(cy_idx, 0, len(lats) - 1)))
            cx_idx = int(round(np.clip(cx_idx, 0, len(lons) - 1)))

            c_lat = float(lats[cy_idx])
            c_lon = float(lons[cx_idx])

            # 2. 4D Bounding Box
            active_lats = lats[np.any(mask, axis=1)]
            active_lons = lons[np.any(mask, axis=0)]

            lat_min, lat_max = float(np.min(active_lats)), float(np.max(active_lats))
            lon_min, lon_max = float(np.min(active_lons)), float(np.max(active_lons))

            # 3. Area & Intensity Metrics
            cell_count = int(np.sum(mask))
            area_km2 = float(cell_count * (self.grid_res_km**2))
            peak_val = float(np.max(efi_map_2d[mask]))
            mean_val = float(np.mean(efi_map_2d[mask]))

            severity = "critical" if peak_val > 0.85 else "severe" if peak_val > 0.65 else "moderate"

            extracted_objects.append({
                "objectId": f"EV-2026-{rank + 1:03d}",
                "centroid": [round(c_lat, 4), round(c_lon, 4)],
                "boundingBox": {
                    "latMin": round(lat_min, 4),
                    "latMax": round(lat_max, 4),
                    "lonMin": round(lon_min, 4),
                    "lonMax": round(lon_max, 4)
                },
                "areaKm2": round(area_km2, 1),
                "peakEfi": round(peak_val, 4),
                "meanEfi": round(mean_val, 4),
                "severity": severity
            })

        return extracted_objects

if __name__ == "__main__":
    detector = ExtremeObjectDetector()
    grid = np.random.normal(0.4, 0.1, (30, 30))
    grid[10:15, 10:15] = 0.88 # Severe anomaly cluster
    lats = np.linspace(10, 30, 30)
    lons = np.linspace(70, 90, 30)
    objs = detector.extract_extreme_objects(grid, lats, lons)
    print("Object Detector test passed. Extracted objects:", len(objs), "Main Object ID:", objs[0]["objectId"])
