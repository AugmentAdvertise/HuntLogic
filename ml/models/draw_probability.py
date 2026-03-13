"""
Draw Probability Model
Uses XGBoost binary classification to predict draw probability.
Falls back to statistical estimation when insufficient training data.
"""

import logging
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)


class DrawProbabilityModel:
    """XGBoost-based draw probability prediction."""

    def __init__(self):
        self._xgb_available = False
        self._model = None
        try:
            import xgboost as xgb
            self._xgb_available = True
            logger.info("XGBoost loaded successfully")
        except ImportError:
            logger.warning("XGBoost not available, using statistical fallback")

    def predict(
        self,
        state_code: str,
        species_slug: str,
        unit_code: str,
        current_points: int,
        point_type: str = "preference",
    ) -> dict:
        """Predict draw probability for given parameters."""
        from data.loader import load_draw_history

        history = load_draw_history(state_code, species_slug, unit_code)

        if len(history) < 5 or not self._xgb_available:
            return self._statistical_fallback(
                history, current_points, point_type
            )

        return self._xgb_predict(history, current_points, point_type)

    def _xgb_predict(
        self,
        history: list[dict],
        current_points: int,
        point_type: str,
    ) -> dict:
        """Train and predict using XGBoost."""
        import xgboost as xgb
        from sklearn.model_selection import train_test_split

        # Build feature matrix
        features = []
        targets = []

        for record in history:
            point_type_encoded = {
                "preference": 0,
                "bonus": 1,
                "hybrid": 2,
            }.get(record.get("point_type", "preference"), 0)

            total_applicants = record.get("total_applicants", 100)
            total_tags = record.get("total_tags", 10)
            draw_rate = total_tags / max(total_applicants, 1)
            min_points = record.get("min_points_drawn", 0)

            features.append([
                record.get("points_at_draw", 0),
                total_applicants,
                total_tags,
                point_type_encoded,
                draw_rate,
                record.get("point_creep_slope", 0),
                record.get("year", 2024),
            ])
            targets.append(1 if record.get("drawn", False) else 0)

        X = np.array(features)
        y = np.array(targets)

        # Train model
        model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            eval_metric="logloss",
            use_label_encoder=False,
        )

        if len(X) > 10:
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            model.fit(X_train, y_train)
        else:
            model.fit(X, y)

        # Predict for current scenario
        point_type_encoded = {
            "preference": 0,
            "bonus": 1,
            "hybrid": 2,
        }.get(point_type, 0)

        # Use latest year's stats as baseline
        latest = history[-1]
        predict_features = np.array([[
            current_points,
            latest.get("total_applicants", 100),
            latest.get("total_tags", 10),
            point_type_encoded,
            latest.get("total_tags", 10) / max(latest.get("total_applicants", 100), 1),
            latest.get("point_creep_slope", 0),
            latest.get("year", 2024) + 1,
        ]])

        probability = float(model.predict_proba(predict_features)[0][1])

        # Feature importance
        importance = model.feature_importances_
        feature_names = [
            "points", "applicants", "tags", "point_type",
            "draw_rate", "point_creep", "year",
        ]
        feature_importance = {
            name: round(float(imp), 3)
            for name, imp in zip(feature_names, importance)
        }

        return {
            "probability": round(probability, 4),
            "confidence": round(min(0.95, 0.5 + len(history) * 0.03), 2),
            "feature_importance": feature_importance,
            "model": "xgboost",
        }

    def _statistical_fallback(
        self,
        history: list[dict],
        current_points: int,
        point_type: str,
    ) -> dict:
        """Simple statistical estimation when ML is unavailable."""
        if len(history) == 0:
            return {
                "probability": 0.1,
                "confidence": 0.2,
                "feature_importance": {},
                "model": "no_data",
            }

        # Calculate based on historical draw rates and point thresholds
        recent = history[-3:] if len(history) >= 3 else history
        avg_min_points = np.mean([r.get("min_points_drawn", 0) for r in recent])
        avg_draw_rate = np.mean([
            r.get("total_tags", 10) / max(r.get("total_applicants", 100), 1)
            for r in recent
        ])

        # Probability scales with points relative to threshold
        if avg_min_points > 0:
            point_ratio = current_points / avg_min_points
            if point_ratio >= 1.0:
                probability = min(0.95, avg_draw_rate + (point_ratio - 1.0) * 0.3)
            else:
                probability = max(0.01, avg_draw_rate * point_ratio * 0.5)
        else:
            probability = min(0.8, avg_draw_rate)

        # Bonus points are random, so cap probability
        if point_type == "bonus":
            probability = min(probability, avg_draw_rate * 1.5)

        return {
            "probability": round(float(probability), 4),
            "confidence": round(min(0.7, 0.3 + len(history) * 0.05), 2),
            "feature_importance": {
                "points": 0.4,
                "applicants": 0.3,
                "draw_rate": 0.2,
                "year": 0.1,
            },
            "model": "statistical",
        }
