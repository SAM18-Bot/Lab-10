from io import StringIO
from os import getenv
from typing import Any

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MAX_UPLOAD_SIZE_MB = int(getenv("MAX_UPLOAD_SIZE_MB", "10"))
ALLOWED_ORIGINS = getenv("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(title="InsightFlow API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FilterRequest(BaseModel):
    rows: list[dict[str, Any]]
    column: str = Field(min_length=1)
    operator: str = "equals"
    value: str = ""


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)) -> dict[str, Any]:
    filename = file.filename or ""
    if not filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_SIZE_MB:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_UPLOAD_SIZE_MB} MB limit")

    try:
        dataframe = pd.read_csv(StringIO(content.decode("utf-8")))
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV must be UTF-8 encoded") from exc
    except Exception as exc:  # pylint: disable=broad-exception-caught
        raise HTTPException(status_code=400, detail="Invalid CSV format") from exc

    if dataframe.empty:
        raise HTTPException(status_code=400, detail="CSV does not contain any rows")

    return {
        "columns": list(dataframe.columns),
        "rows": dataframe.fillna("").to_dict(orient="records"),
    }


@app.post("/api/filter")
def filter_rows(payload: FilterRequest) -> dict[str, Any]:
    dataframe = pd.DataFrame(payload.rows)

    if dataframe.empty:
        return {"rows": []}

    if payload.column not in dataframe.columns:
        raise HTTPException(status_code=400, detail=f"Unknown column: {payload.column}")

    column_as_string = dataframe[payload.column].astype(str)

    if payload.operator == "contains":
        filtered = dataframe[column_as_string.str.contains(payload.value, case=False, na=False)]
    elif payload.operator == "greater_than":
        try:
            threshold = float(payload.value)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Filter value must be numeric for greater_than") from exc
        filtered = dataframe[pd.to_numeric(dataframe[payload.column], errors="coerce") > threshold]
    elif payload.operator == "less_than":
        try:
            threshold = float(payload.value)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Filter value must be numeric for less_than") from exc
        filtered = dataframe[pd.to_numeric(dataframe[payload.column], errors="coerce") < threshold]
    else:
        filtered = dataframe[column_as_string == payload.value]

    return {"rows": filtered.fillna("").to_dict(orient="records")}
