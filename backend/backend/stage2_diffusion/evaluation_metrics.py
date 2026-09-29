import numpy as np

def compute_power_spectral_density_2d(image_2d):
    """
    Computes 1D Radially Averaged 2D FFT Power Spectral Density (PSD).
    Evaluates spatial wavenumber power spectrum retention (verifying zero spectral smoothing).
    """
    np_img = np.array(image_2d, dtype=np.float64)
    fft2d = np.fft.fft2(np_img)
    fft_shift = np.fft.fftshift(fft2d)
    psd2d = np.abs(fft_shift) ** 2

    ny, nx = psd2d.shape
    cy, cx = ny // 2, nx // 2
    
    y, x = np.ogrid[-cy:ny-cy, -cx:nx-cx]
    r = np.sqrt(x**2 + y**2).astype(int)

    radial_psd = np.bincount(r.ravel(), psd2d.ravel()) / (np.bincount(r.ravel()) + 1e-8)
    return radial_psd[:min(cy, cx)]

def compute_quantitative_metrics(ground_truth_5km, coarse_12km, standard_unet_5km, stormtrace_ddpm_5km, threshold_mm=50.0):
    """
    Computes rigorous verification metrics against Ground-Truth Observations:
    1. Coarse 12km NWP Input
    2. Standard Bilinear Interpolation
    3. Standard U-Net (destroys extreme upper-quantile peaks via spatial smoothing)
    4. StormTrace 2-Stage Physics-Informed GNN+DDPM
    """
    gt = np.array(ground_truth_5km, dtype=np.float64)
    coarse = np.array(coarse_12km, dtype=np.float64)
    unet = np.array(standard_unet_5km, dtype=np.float64)
    ddpm = np.array(stormtrace_ddpm_5km, dtype=np.float64)

    # 1. Extreme Value Quantiles (Max, P95, P99)
    gt_max, coarse_max, unet_max, ddpm_max = np.max(gt), np.max(coarse), np.max(unet), np.max(ddpm)
    gt_p99, unet_p99, ddpm_p99 = np.percentile(gt, 99), np.percentile(unet, 99), np.percentile(ddpm, 99)

    # 2. Categorical Contingency Scores (CSI, POD, FAR, ETS) at heavy threshold (e.g., 50 mm/24h)
    def compute_scores(pred, target, thresh):
        p_event = pred >= thresh
        t_event = target >= thresh
        
        hits = float(np.sum(p_event & t_event))
        misses = float(np.sum((~p_event) & t_event))
        false_alarms = float(np.sum(p_event & (~t_event)))
        correct_negs = float(np.sum((~p_event) & (~t_event)))
        
        total = hits + misses + false_alarms + correct_negs
        pod = hits / (hits + misses + 1e-6)
        far = false_alarms / (hits + false_alarms + 1e-6)
        csi = hits / (hits + misses + false_alarms + 1e-6)
        
        # Equitable Threat Score (ETS)
        hits_random = ((hits + misses) * (hits + false_alarms)) / (total + 1e-6)
        ets = (hits - hits_random) / (hits + misses + false_alarms - hits_random + 1e-6)

        return {
            "POD": round(pod, 3),
            "FAR": round(far, 3),
            "CSI": round(csi, 3),
            "ETS": round(max(0.0, ets), 3)
        }

    unet_scores = compute_scores(unet, gt, threshold_mm)
    ddpm_scores = compute_scores(ddpm, gt, threshold_mm)

    # 3. Spectral Energy Density & High Frequency Power Retention
    psd_gt = compute_power_spectral_density_2d(gt)
    psd_unet = compute_power_spectral_density_2d(unet)
    psd_ddpm = compute_power_spectral_density_2d(ddpm)

    high_freq_power_loss_unet = float(np.mean(np.abs(psd_gt[-10:] - psd_unet[-10:]) / (psd_gt[-10:] + 1e-6))) * 100.0
    high_freq_power_loss_ddpm = float(np.mean(np.abs(psd_gt[-10:] - psd_ddpm[-10:]) / (psd_gt[-10:] + 1e-6))) * 100.0

    # 4. Mass Conservation Error
    mass_err_unet = float(np.abs(np.mean(unet) - np.mean(gt)) / (np.mean(gt) + 1e-6)) * 100.0
    mass_err_ddpm = float(np.abs(np.mean(ddpm) - np.mean(gt)) / (np.mean(gt) + 1e-6)) * 100.0

    return {
        "groundTruthValidation": {
            "evaluationThresholdMm": threshold_mm,
            "extremeValuePreservation": {
                "groundTruthMaxMm": round(float(gt_max), 1),
                "coarse12kmMaxMm": round(float(coarse_max), 1),
                "standardUnet5kmMaxMm": round(float(unet_max), 1),
                "stormTraceDdpm5kmMaxMm": round(float(ddpm_max), 1),
                "groundTruthP99Mm": round(float(gt_p99), 1),
                "standardUnetP99Mm": round(float(unet_p99), 1),
                "stormTraceDdpmP99Mm": round(float(ddpm_p99), 1),
                "extremePeakPreservationPct": round((float(ddpm_max) / (float(gt_max) + 1e-6)) * 100.0, 1),
                "standardUnetSmoothingLossPct": round((1.0 - (float(unet_max) / (float(gt_max) + 1e-6))) * 100.0, 1)
            },
            "verificationScores50mm": {
                "standardUnet": unet_scores,
                "stormTraceDdpm": ddpm_scores
            },
            "spectralAnalysis": {
                "highFreqSpectralSmoothingLossUnetPct": round(high_freq_power_loss_unet, 1),
                "highFreqSpectralSmoothingLossDdpmPct": round(high_freq_power_loss_ddpm, 1),
                "spectralEnergyPreserved": high_freq_power_loss_ddpm < 15.0
            },
            "physicsConservation": {
                "massConservationErrorUnetPct": round(mass_err_unet, 2),
                "massConservationErrorDdpmPct": round(mass_err_ddpm, 2)
            }
        }
    }

if __name__ == "__main__":
    np.random.seed(42)
    gt = np.random.exponential(scale=30, size=(64, 64))
    gt[25:35, 25:35] += 120.0 # Heavy rain cell
    
    coarse = gt[::2, ::2]
    unet = np.repeat(np.repeat(coarse, 2, axis=0), 2, axis=1) * 0.7 # Smoothed out
    ddpm = gt + np.random.normal(0, 2, size=(64, 64)) # High-fidelity downscaled
    
    metrics = compute_quantitative_metrics(gt, coarse, unet, ddpm, threshold_mm=50.0)
    print("Ground-Truth Verification Engine output:", metrics)
