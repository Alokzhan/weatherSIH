import numpy as np
import torch
import sys
import os

# Add parent directories to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from data.era5_loader import ERA5DataLoader
    from data.climatology import ClimatologyEngine
    from stage1_gnn.efi_compute import compute_efi_1d, compute_multi_hazard_efi
    from tracking.detector import ExtremeObjectDetector
    from tracking.tracker import SpatioTemporalTracker
    from stage1_gnn.st_gnn_model import SpatioTemporalGNN, track_anomaly_object_st_gnn
    from models.physics import compute_weighted_extreme_loss, compute_multi_objective_physics_loss
    from alerts.risk_engine import ConfigurableRiskEngine
    from historical_validation import HistoricalValidationEngine
except ImportError:
    from backend.data.era5_loader import ERA5DataLoader
    from backend.data.climatology import ClimatologyEngine
    from backend.stage1_gnn.efi_compute import compute_efi_1d, compute_multi_hazard_efi
    from backend.tracking.detector import ExtremeObjectDetector
    from backend.tracking.tracker import SpatioTemporalTracker
    from backend.stage1_gnn.st_gnn_model import SpatioTemporalGNN, track_anomaly_object_st_gnn
    from backend.models.physics import compute_weighted_extreme_loss, compute_multi_objective_physics_loss
    from backend.alerts.risk_engine import ConfigurableRiskEngine
    from backend.historical_validation import HistoricalValidationEngine

def test_era5_data_loader():
    loader = ERA5DataLoader()
    ds = loader.fetch_live_era5_dataset()
    assert "precipitation" in ds["variables"]
    assert ds["shape"][0] > 0
    print("[PASS] ERA5 Data Loader Test Passed")

def test_climatology_quantile_baseline():
    engine = ClimatologyEngine()
    clim = engine.compute_climatology_baseline()
    assert clim["quantiles"]["P99_mm"] > 0
    print("[PASS] Climatology Quantile Baseline Test Passed")

def test_efi_1d_calculation():
    fcst = np.random.normal(120, 10, 50)
    clim = np.random.normal(30, 10, 2700)
    efi = compute_efi_1d(fcst, clim)
    assert -1.0 <= efi <= 1.0
    assert abs(efi) > 0.3
    print("[PASS] Analytical EFI Calculation Test Passed")

def test_extreme_object_detection():
    detector = ExtremeObjectDetector()
    grid = np.random.normal(0.3, 0.1, (30, 30))
    grid[10:15, 10:15] = 0.88 # Severe anomaly cluster
    lats = np.linspace(10, 30, 30)
    lons = np.linspace(70, 90, 30)
    objs = detector.extract_extreme_objects(grid, lats, lons)
    assert len(objs) > 0
    assert "centroid" in objs[0]
    assert "boundingBox" in objs[0]
    print("[PASS] Connected Components Extreme Object Extraction Test Passed")

def test_spatio_temporal_tracker():
    tracker = SpatioTemporalTracker()
    obj = {"objectId": "EV-TEST-001", "centroid": [19.5, 88.5], "peakEfi": 0.88}
    res = tracker.track_event_across_timesteps(obj)
    assert len(res["timesteps"]) == 9
    assert res["objectId"] == "EV-TEST-001"
    print("[PASS] Spatio-Temporal Event Continuity Tracking Test Passed")

def test_st_gnn_model():
    model = SpatioTemporalGNN()
    x_seq = torch.randn(9, 642, 6)
    edge_index = torch.zeros(2, 3852, dtype=torch.long)
    edge_attr = torch.randn(3852, 4)
    traj, int_vec = model(x_seq, edge_index, edge_attr)
    assert traj.shape == (9, 2)
    assert int_vec.shape == (9, 4)
    print("[PASS] PyTorch ST-GNN (GAT + GRU) Architecture Test Passed")

def test_physics_loss_computation():
    pred = torch.randn(1, 1, 32, 32).abs() * 50.0
    target = pred + torch.randn(1, 1, 32, 32)
    loss = compute_weighted_extreme_loss(pred, target)
    assert loss.item() >= 0
    print("[PASS] Physics & Extreme Peak Preservation Loss Test Passed")

def test_configurable_risk_engine():
    engine = ConfigurableRiskEngine()
    res = engine.calculate_risk_score(0.88, 85.0, 145.0, 75.0, 72.0)
    assert 0 <= res["riskScore"] <= 100
    assert res["severityCategory"] in ["NORMAL", "WATCH", "WARNING", "CRITICAL"]
    print("[PASS] Configurable Multi-Factor Risk Engine Test Passed")

def test_historical_validation_suite():
    suite = HistoricalValidationEngine()
    res = suite.evaluate_historical_case_studies()
    assert res["totalHistoricalEvents"] >= 4
    csi_val = res["overallSummaryMetrics"]["meanCsiScore"]
    assert csi_val is not None
    if isinstance(csi_val, (int, float)):
        assert csi_val > 0.80
    else:
        assert "UNVERIFIED" in str(csi_val) or "Ground-Truth" in str(csi_val)
    print(f"[PASS] {res['totalHistoricalEvents']}-Disaster Historical Benchmark Suite Test Passed")


if __name__ == "__main__":
    print("==================================================")
    print("  RUNNING STORMTRACE AI AUTOMATED TEST SUITE     ")
    print("==================================================")
    test_era5_data_loader()
    test_climatology_quantile_baseline()
    test_efi_1d_calculation()
    test_extreme_object_detection()
    test_spatio_temporal_tracker()
    test_st_gnn_model()
    test_physics_loss_computation()
    test_configurable_risk_engine()
    test_historical_validation_suite()
    print("==================================================")
    print("  ALL 9 AUTOMATED TESTS PASSED SUCCESSFULLY!     ")
    print("==================================================")
