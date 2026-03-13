"""
HuntLogic ML Forecast Service
FastAPI service for point creep and draw probability predictions.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

from models.point_creep import PointCreepModel
from models.draw_probability import DrawProbabilityModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="HuntLogic ML Service", version="1.0.0")

# Initialize models
point_creep_model = PointCreepModel()
draw_probability_model = DrawProbabilityModel()


class PointCreepRequest(BaseModel):
    state_code: str
    species_slug: str
    unit_code: str
    years_forward: int = 5


class DrawProbabilityRequest(BaseModel):
    state_code: str
    species_slug: str
    unit_code: str
    current_points: int
    point_type: str = "preference"


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "models_loaded": True,
    }


@app.post("/predict/point-creep")
async def predict_point_creep(request: PointCreepRequest):
    try:
        result = point_creep_model.predict(
            state_code=request.state_code,
            species_slug=request.species_slug,
            unit_code=request.unit_code,
            years_forward=request.years_forward,
        )
        return result
    except Exception as e:
        logger.error(f"Point creep prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/draw-probability")
async def predict_draw_probability(request: DrawProbabilityRequest):
    try:
        result = draw_probability_model.predict(
            state_code=request.state_code,
            species_slug=request.species_slug,
            unit_code=request.unit_code,
            current_points=request.current_points,
            point_type=request.point_type,
        )
        return result
    except Exception as e:
        logger.error(f"Draw probability prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
