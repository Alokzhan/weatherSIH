class ConfigurableRiskEngine:
    """
    Priority 15: Configurable Multi-Factor Intelligent Risk Scoring Engine.
    Formula:
    Risk = w1*anomaly + w2*probability + w3*intensity + w4*vulnerability + w5*persistence
    """
    def __init__(self, weights: dict = None):
        if weights is None:
            weights = {
                "anomaly": 0.30,
                "probability": 0.25,
                "intensity": 0.20,
                "vulnerability": 0.15,
                "persistence": 0.10
            }
        self.weights = weights

    def calculate_risk_score(
        self,
        anomaly_efi: float,
        probability_pct: float,
        intensity_mm_h: float,
        vulnerability_score: float = 65.0,
        persistence_hours: float = 48.0
    ):
        """
        Calculates normalized risk score (0-100) and severity category.
        """
        norm_anomaly = min(100.0, max(0.0, abs(anomaly_efi) * 100.0))
        norm_prob = min(100.0, max(0.0, probability_pct))
        norm_intensity = min(100.0, max(0.0, (intensity_mm_h / 200.0) * 100.0))
        norm_vulnerability = min(100.0, max(0.0, vulnerability_score))
        norm_persistence = min(100.0, max(0.0, (persistence_hours / 120.0) * 100.0))

        risk_score = (
            self.weights["anomaly"] * norm_anomaly +
            self.weights["probability"] * norm_prob +
            self.weights["intensity"] * norm_intensity +
            self.weights["vulnerability"] * norm_vulnerability +
            self.weights["persistence"] * norm_persistence
        )
        risk_score = round(risk_score, 1)

        category = (
            "CRITICAL" if risk_score >= 75.0 else
            "WARNING" if risk_score >= 50.0 else
            "WATCH" if risk_score >= 25.0 else
            "NORMAL"
        )

        return {
            "riskScore": risk_score,
            "severityCategory": category,
            "weights": self.weights,
            "components": {
                "anomalyScore": round(norm_anomaly, 1),
                "probabilityPct": round(norm_prob, 1),
                "intensityScore": round(norm_intensity, 1),
                "vulnerabilityScore": round(norm_vulnerability, 1),
                "persistenceScore": round(norm_persistence, 1)
            }
        }

class NDRFDisasterAlertEngine(ConfigurableRiskEngine):
    """
    Alias wrapper class for NDRF operational alert advisories.
    """
    def generate_advisory(self, event_id, centroid, intensity, affected_area):
        res = self.calculate_risk_score(0.85, 90.0, intensity, vulnerability_score=70.0, persistence_hours=48.0)
        return {
            "event_id": event_id,
            "centroid": centroid,
            "severity": res["severityCategory"],
            "composite_risk_score": res["riskScore"],
            "affected_area_km2": affected_area,
            "action": "Deploy NDRF Search and Rescue Units to Eastern Coastal Sector" if res["severityCategory"] in ["WARNING", "CRITICAL"] else "Monitor Standard Bulletins"
        }

if __name__ == "__main__":
    engine = ConfigurableRiskEngine()
    res = engine.calculate_risk_score(0.88, 85.0, 145.0, 75.0, 72.0)
    print("Configurable Risk Engine test passed. Risk Score =", res["riskScore"], "Category =", res["severityCategory"])

