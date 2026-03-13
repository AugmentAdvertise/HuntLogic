"""
Point Creep Forecasting Model
Uses Facebook Prophet for time-series forecasting of minimum draw points.
Falls back to linear regression for sparse datasets.
"""

import logging
from typing import Optional
import numpy as np

logger = logging.getLogger(__name__)


class PointCreepModel:
    """Prophet-based point creep forecasting."""

    def __init__(self):
        self._prophet_available = False
        try:
            from prophet import Prophet
            self._prophet_available = True
            logger.info("Prophet loaded successfully")
        except ImportError:
            logger.warning("Prophet not available, using linear regression fallback")

    def predict(
        self,
        state_code: str,
        species_slug: str,
        unit_code: str,
        years_forward: int = 5,
    ) -> dict:
        """Generate point creep projections."""
        from data.loader import load_point_history

        history = load_point_history(state_code, species_slug, unit_code)

        if len(history) < 3:
            return self._linear_fallback(history, years_forward)

        if self._prophet_available:
            return self._prophet_forecast(history, years_forward)
        else:
            return self._linear_fallback(history, years_forward)

    def _prophet_forecast(self, history: list[dict], years_forward: int) -> dict:
        """Use Prophet for time-series forecasting."""
        import pandas as pd
        from prophet import Prophet

        df = pd.DataFrame(history)
        df = df.rename(columns={"year": "ds", "min_points": "y"})
        df["ds"] = pd.to_datetime(df["ds"].astype(str) + "-07-01")

        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,
        )
        model.fit(df)

        current_year = int(df["ds"].dt.year.max())
        future_dates = pd.DataFrame({
            "ds": pd.to_datetime([
                f"{current_year + i + 1}-07-01" for i in range(years_forward)
            ])
        })
        forecast = model.predict(future_dates)

        projections = []
        for _, row in forecast.iterrows():
            projections.append({
                "year": int(row["ds"].year),
                "predicted_points": max(0, round(row["yhat"], 1)),
                "confidence_low": max(0, round(row["yhat_lower"], 1)),
                "confidence_high": max(0, round(row["yhat_upper"], 1)),
            })

        changepoints = []
        if hasattr(model, "changepoints") and model.changepoints is not None:
            for cp in model.changepoints:
                changepoints.append(str(cp.date()))

        return {
            "projections": projections,
            "changepoints": changepoints,
            "model": "prophet",
        }

    def _linear_fallback(self, history: list[dict], years_forward: int) -> dict:
        """Simple linear regression fallback for sparse data."""
        if len(history) == 0:
            return {
                "projections": [],
                "changepoints": [],
                "model": "no_data",
            }

        years = np.array([h["year"] for h in history], dtype=float)
        points = np.array([h["min_points"] for h in history], dtype=float)

        if len(history) == 1:
            slope = 0.5  # Default assumption
            intercept = points[0] - slope * years[0]
        else:
            coeffs = np.polyfit(years, points, 1)
            slope, intercept = coeffs[0], coeffs[1]

        current_year = int(max(years))
        projections = []
        for i in range(1, years_forward + 1):
            target_year = current_year + i
            predicted = slope * target_year + intercept
            # Simple confidence interval: widens with distance
            margin = abs(slope) * i * 1.5 + 1.0
            projections.append({
                "year": target_year,
                "predicted_points": max(0, round(predicted, 1)),
                "confidence_low": max(0, round(predicted - margin, 1)),
                "confidence_high": max(0, round(predicted + margin, 1)),
            })

        return {
            "projections": projections,
            "changepoints": [],
            "model": "linear_regression",
        }
