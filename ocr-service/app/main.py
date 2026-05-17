import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ocr_router

# ─── Logging Configuration ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-25s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("medclear")


# ─── Lifespan (replaces deprecated @app.on_event) ─────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown lifecycle."""
    # Startup
    from app.services.ocr_service import EASY_AVAILABLE, TESSERACT_AVAILABLE
    logger.info("MedClear OCR Service starting up...")
    logger.info(f"  EasyOCR:   {'✓ available' if EASY_AVAILABLE else '✗ NOT available'}")
    logger.info(f"  Tesseract: {'✓ available' if TESSERACT_AVAILABLE else '✗ NOT available'}")

    if not EASY_AVAILABLE and not TESSERACT_AVAILABLE:
        logger.critical("NO OCR ENGINE AVAILABLE — service will not be able to process images!")
    
    yield

    # Shutdown
    logger.info("MedClear OCR Service shutting down.")


# ─── App ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="MedClear OCR Service",
    description="Production-grade OCR extraction for medical and financial bills",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ocr/health")
def health_check():
    """Health check endpoint — verifies OCR engine availability."""
    from app.services.ocr_service import EASY_AVAILABLE, TESSERACT_AVAILABLE
    return {
        "success": True,
        "status": "OCR Service is running",
        "engines": {
            "easyocr": EASY_AVAILABLE,
            "tesseract": TESSERACT_AVAILABLE,
        },
    }


app.include_router(ocr_router.router, prefix="/ocr", tags=["OCR"])
