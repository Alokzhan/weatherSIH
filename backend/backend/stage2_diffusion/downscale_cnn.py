import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from scipy.ndimage import zoom

class ResidualCNN(nn.Module):
    """
    Lightweight Residual CNN for Statistical Downscaling.
    Refines a bicubic-upsampled coarse grid to add high-frequency details.
    """
    def __init__(self):
        super(ResidualCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 16, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(16, 1, kernel_size=3, padding=1)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        # x is the bicubic upsampled coarse grid
        residual = self.relu(self.conv1(x))
        residual = self.relu(self.conv2(residual))
        residual = self.conv3(residual)
        # Add residual and ensure non-negative precipitation
        out = F.relu(x + residual)
        return out

def mass_conservation_loss(coarse_grid, fine_grid, scale_factor=2.4):
    """
    Physics-informed loss: Mass Conservation.
    Total precipitation in coarse grid cell should equal sum of downscaled cells.
    scale_factor: e.g. 12km to 5km = 12/5 = 2.4. 
    Here we use average pooling to approximate the downsampling.
    """
    # Average pool the fine grid to match coarse resolution approximately
    pooled_fine = F.adaptive_avg_pool2d(fine_grid, output_size=coarse_grid.shape[-2:])
    # MSE between coarse grid and pooled fine grid
    return F.mse_loss(pooled_fine, coarse_grid)

def calculate_metrics(true_grid, pred_grid, threshold=10.0):
    """
    Calculate validation metrics: RMSE, POD, FAR, CSI.
    threshold: mm of rain to define an 'event' (default 10mm).
    """
    true_flat = true_grid.flatten()
    pred_flat = pred_grid.flatten()
    
    # RMSE
    rmse = np.sqrt(np.mean((true_flat - pred_flat)**2))
    
    # MAE
    mae = np.mean(np.abs(true_flat - pred_flat))
    
    # Contingency table elements
    hits = np.sum((true_flat > threshold) & (pred_flat > threshold))
    misses = np.sum((true_flat > threshold) & (pred_flat <= threshold))
    false_alarms = np.sum((true_flat <= threshold) & (pred_flat > threshold))
    
    # POD (Probability of Detection)
    pod = hits / (hits + misses) if (hits + misses) > 0 else 0.0
    
    # FAR (False Alarm Ratio)
    far = false_alarms / (hits + false_alarms) if (hits + false_alarms) > 0 else 0.0
    
    # CSI (Critical Success Index)
    csi = hits / (hits + misses + false_alarms) if (hits + misses + false_alarms) > 0 else 0.0
    
    return {
        "rmseMm": float(rmse),
        "maeMm": float(mae),
        "podScore": float(pod),
        "farScore": float(far),
        "csiScore": float(csi)
    }

def run_inference_pipeline(coarse_array_2d, model=None):
    """
    Executes the realistic downscaling pipeline.
    """
    if model is None:
        model = ResidualCNN()
        model.eval()
        
    # 1. Bicubic Interpolation (Scale by 2.4 to go from 12km to 5km)
    bicubic_grid = zoom(coarse_array_2d, 2.4, order=3)
    
    # 2. Convert to tensor
    input_tensor = torch.tensor(bicubic_grid, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
    
    # 3. Apply Residual CNN
    with torch.no_grad():
        fine_tensor = model(input_tensor)
        
    return fine_tensor.squeeze().numpy()
