## MedClear Exhaustive Codebase Audit (Architecture, Quality, OCR/AI, Data, Security, Performance, Product)

Version context: This audit is derived strictly from the current repository contents in:
- `backend/` (Node/Express + Mongo/Mongoose)
- `ocr-service/` (Python/FastAPI OCR microservice using OpenCV + EasyOCR + Tesseract)
- `frontend/` (React/Vite UI)

### Executive framing (no hand-waving)
MedClear’s implemented “AI” behavior is **not** an LLM-based extraction or “Gemini Vision prompt” pipeline. It is:
- deterministic OCR extraction + validation in `ocr-service/`
- deterministic fuzzy name matching + audit math in `backend/`
The app’s “legal dispute letter”, “IRDAI 199”, “WhatsApp bot”, “PDF report export”, “state-level pricing beyond central schemes”, “multi-language”, etc. are **mostly marketing/UI claims** without corresponding production backend implementations.

---

## SECTION 1 — Codebase Architecture Audit

### 1.1 System architecture (as implemented)

**Components**
1. **Frontend (React/Vite)**
   - Upload UI sends `multipart/form-data` to Node backend.
   - Uses **SSE** (`EventSource`) to receive job status and final results.
   - Reads billing history from Mongo via Node backend.
   - Displays audit items and savings analytics.
   - Provides “Gov schemes” eligibility UI and “Jan Aushadhi” store finder UI.

2. **Backend API (Node.js + Express 5 + Mongoose)**
   - Routes:
     - `POST /api/v1/bills/upload` → queue OCR job and return `jobId`
     - `GET /api/v1/bills/job/:jobId/stream` → SSE stream of job status + result
     - `GET /api/v1/bills/history` → last 50 completed bills
     - `GET /api/v1/bills/job/:jobId` → bill detail
     - `GET /api/v1/schemes` → schemes matching income/state
     - `GET /api/v1/stores/nearby` → geospatial nearby stores
     - `POST /api/v1/auth/google` → Google token verification → JWT issuance
   - Middlewares:
     - `helmet()`, `compression()`, global `express-rate-limit`, CORS, JSON parsing.
   - **In-process job queue**: `AsyncQueue` with `concurrency = 2`.

3. **OCR Microservice (Python/FastAPI)**
   - Endpoint: `POST /ocr/extract`
   - Pipeline:
     - read/validate uploaded file
     - `asyncio.to_thread(process_bill_image, ...)` to avoid blocking the event loop
     - engine selection: EasyOCR first, fallback to Tesseract
     - layout parsing and line-item extraction
     - cleaning/deduplication
     - confidence scoring + structured JSON response

4. **Government pricing/reference data layer (implemented as local Mongo “reference items”)**
   - There is no live NPPA/CGHS/IRDAI ingestion pipeline.
   - “Government sync” is represented by:
     - Mongo collection `ReferenceItem`
     - seeded by `backend/src/seed.js` with a hardcoded `referenceData` array
   - `ReferenceItem` holds:
     - `standardPrice` (used as “government ceiling” in audit math)
     - `maxAllowedPrice` computed as `standardPrice * 1.5` (not actually used in audit math)

5. **Data persistence (MongoDB)**
   - `Bill` documents store extracted & matched line items + totals + timing + status.
   - `FileCache` documents cache OCR results keyed by SHA-256 of uploaded file content.
   - `ReferenceItem`, `Scheme`, `Store` provide lookup datasets.

### 1.2 Complete data flow mapping (bill upload → OCR → matching → audit → UI)

#### Step A: Bill image upload
- **Frontend → Backend**
  - Frontend uploads to Node backend via `axios.post(.../bills/upload, formData)`:
    - `frontend/src/utils/api.js` → `uploadBill()` lines 12-26
  - UI then opens SSE stream:
    - `frontend/src/utils/api.js` → `getSSEUrl()` line 58
    - SSE subscription occurs in `frontend/src/pages/UploadPage.jsx` lines ~124-161 or `frontend/src/components/UploadBill.jsx` lines 184-215 (two UI variants exist)

- **Backend handling**
  - `backend/src/middlewares/upload.js`:
    - stores uploaded files in `os.tmpdir()` via `multer.diskStorage` lines 5-11
    - accepts file if mimetype matches `image/*` or `application/pdf` lines 13-23
    - enforces max file size `10 * 1024 * 1024` bytes line 15
  - `backend/src/controllers/bill.controller.js`:
    - creates `jobId = uuidv4()` lines 42-43
    - computes `fileHash` using `cacheService.getFileHash(req.file.path)` lines 43-44
    - creates a `Bill` document with `status: 'QUEUED'` lines 46-51
    - pushes an OCR job into in-process queue `ocrQueue.push(...)` lines 58-60
    - returns HTTP 202 with `{ jobId }` lines 53-56

#### Step B: OCR extraction
- **Cache check**
  - `processJob(...)` in `backend/src/controllers/bill.controller.js`:
    - tries `cacheService.getCachedOCR(fileHash)` lines 110-114
    - if cache hit: `ocrData = cached`
    - else: calls `processOCR(file.path, file.originalname)` lines 115-118
    - stores OCR output with `cacheService.setCachedOCR(fileHash, ocrData)` lines 118-119

- **OCR service call**
  - `backend/src/services/ocr.service.js`:
    - `callOCRService(...)` posts `formData.append('file', fs.createReadStream(filePath), filename)` lines 21-23
    - sends request to `OCR_SERVICE_URL` env or default `http://localhost:8000/ocr/extract` line 24
    - sets axios timeout `Number(process.env.OCR_TIMEOUT_MS || TIMEOUT)` line 34
    - retries up to `MAX_RETRIES = 3` on network/server failures lines 7-8 and 44-50

- **OCR service internal pipeline**
  - `ocr-service/app/routers/ocr_router.py.extract_bill_data`:
    - validates `file.content_type` against allowed set lines 9-11
    - reads the entire file `contents = await file.read()` lines 26-27
    - runs `process_bill_image(contents, file.filename)` in a thread via `asyncio.to_thread` lines 33-35
    - returns `{ success: True, data: result }` lines 44-45

  - `ocr-service/app/services/ocr_service.py.process_bill_image` (core):
    - decodes image or converts PDF via `convert_pdf_to_images` lines 592-654
    - chooses engine:
      - tries `engine = "easyocr"` first; `boxes = extract_with_easyocr(img)` lines 621-624
      - if `boxes is None`: uses Tesseract fallback `boxes = extract_with_tesseract(img)` lines 625-628
    - clusters OCR boxes into rows via `cluster_into_rows(boxes)` lines 636-639
    - parses items and totals via `parse_line_items(rows)` lines 640-645
    - sanitizes items with `sanitize_items(items)` lines 643-645
    - picks best total with `pick_best_total(total_candidates, item_sum)` lines 648-654
    - validates sum vs total with `validate_sum_against_total(clean_items, parsed_total)` lines 655-657
    - computes reliability via `compute_confidence_score(...)` lines 658-663
    - returns structured JSON with:
      - `items` (list of `{ rawName, price, quantity, confidence }`)
      - `parsedTotal`, `itemSum`
      - `confidence` object including `overall_confidence` and `reliable` boolean

#### Step C: Fuzzy matching against government/reference pricing
- **Backend audit math**
  - `backend/src/services/audit.service.js.computeAudit(billId, ocrData)`:
    - iterates OCR items sequentially in a `for (const item of items)` loop lines 18-59
    - for each item:
      - calls `findBestMatch(rawName)` sequentially lines 27-28
      - if match found:
        - `expectedPrice = match.standardPrice * quantity` line 35
        - flags overcharge if `totalPrice > expectedPrice` lines 38-42
      - if match not found:
        - adds charged value to reference totals (`totalReference += totalPrice`) lines 43-45
        - does **not** flag “unmatched” items separately
    - writes updated Bill to Mongo via `Bill.findByIdAndUpdate(... { items, totalCharged, calculatedTotal, totalOvercharge, status:'COMPLETED' } ...)` lines 63-72

- **Matching algorithm**
  - `backend/src/utils/matcher.js.findBestMatch(rawName)`:
    - normalizes text via `normalizeText()` (lowercase, remove non `[a-z0-9\s]`) lines 4-6
    - initial candidates via Mongo `$text` search and sorts by `textScore` and limits to 20 lines 54-58
    - fallback regex search using normalized words and `$regex` with multiple lookaheads lines 61-66
    - worst-case fallback: `candidates = await ReferenceItem.find({}).lean();` lines 68-70
    - for each candidate:
      - computes composite confidence from:
        - Jaccard token similarity (60%)
        - Levenshtein condensed distance (40%)
      - optional alias match returns 1.0 or 0.9 based on include/contain logic lines 39-47 and 76-93
    - rejects matches if `bestConfidence < 0.5` lines 97-99

#### Step D: Violation flagging
- Implemented as boolean `isOvercharged` per item in `backend/src/services/audit.service.js`:
  - set `isOvercharged = true` when billed total exceeds expected reference total lines 38-42
  - stored in `BillItemSchema.isOvercharged` (default `false`) in `backend/src/models/bill.model.js` lines 3-14

#### Step E: Report generation & PDF output
- **Report generation**
  - Node returns full Bill document via SSE `sendSSE(jobId, { status:'COMPLETED', result: bill, summary: auditResult.summary })`:
    - `backend/src/controllers/bill.controller.js` lines 131-135
  - Frontend renders “Analysis Summary” + itemized table from `bill.items`:
    - `frontend/src/components/upload/CurrentBillCard.jsx` renders item table based on `bill.items` lines 30-225

- **PDF output**
  - There is **no implemented PDF generation pipeline** in backend or frontend.
  - “Export” buttons exist in UI but have no functional handler wired to generate/download PDF:
    - `frontend/src/components/ActionPanel.jsx` lines 39-51 (`onClick={() => {}}`)
    - `frontend/src/components/reports/ReportsPage.jsx` lines 113-125 shows Export UI but no implementation for file generation/export

### 1.3 External APIs being called & environment variables required

#### External APIs called at runtime
1. **OCR microservice**
   - backend → `POST ${OCR_SERVICE_URL}/ocr/extract`
   - `backend/src/services/ocr.service.js` line 24
2. **Google OAuth / Userinfo**
   - Frontend calls Google userinfo endpoint:
     - `frontend/src/components/LoginPage.jsx` lines 107-111 → `https://www.googleapis.com/oauth2/v3/userinfo`
   - Backend verifies Google ID token:
     - `backend/src/services/auth.service.js` lines 6-23 uses `OAuth2Client.verifyIdToken`
3. **Mappls (optional)**
   - Frontend loads Mappls SDK + uses OAuth token endpoint via Vite proxy:
     - `frontend/src/services/mappls.service.js`:
       - uses client credentials from `import.meta.env` lines 11-13
       - calls `/mappls-auth/api/security/oauth/token` via `fetch` line 99-103
       - calls Mappls place APIs via `fetch` lines 165-190
4. **Google Analytics**
   - injected in frontend:
     - `frontend/src/utils/analytics.js` initGA lines 4-20

#### Environment variables required (from code)
**Backend (`backend/`)**
- `PORT` used in `backend/server.js` line 8
- `MONGODB_URI` used in:
  - `backend/src/config/db.js` line 6
  - `backend/src/seed.js` line 184
  - `backend/src/seedStores.js` line 60
- `JWT_SECRET` used in `backend/src/services/auth.service.js` line 26
- `GOOGLE_CLIENT_ID` used in `backend/src/services/auth.service.js` line 4 and `verifyIdToken({ audience: ... })` line 10
- `OCR_SERVICE_URL` used in `backend/src/services/ocr.service.js` line 24
- `OCR_TIMEOUT_MS` used in `backend/src/services/ocr.service.js` line 34
- `USE_MOCK_OCR` used in `backend/src/services/ocr.service.js` line 16
- `FRONTEND_URL` used in `backend/src/app.js` lines 17-22 (CORS in production)

**Frontend (`frontend/`)**
- `VITE_API_URL` used in:
  - `frontend/src/utils/api.js` line 4
  - `frontend/src/services/mappls.service.js` and others
- `VITE_GOOGLE_CLIENT_ID` used in `frontend/src/main.jsx` line 13
- `VITE_GA_ID` used in `frontend/src/main.jsx` line 11
- `VITE_MAPPLS_API_KEY` used in `frontend/src/services/mappls.service.js` line 11
- `VITE_MAPPLS_CLIENT_ID` used in `frontend/src/services/mappls.service.js` line 12
- `VITE_MAPPLS_CLIENT_SECRET` used in `frontend/src/services/mappls.service.js` line 13

### 1.4 Architectural anti-patterns / risks

1. **In-process job queue (not durable, not horizontally scalable)**
   - `backend/src/utils/queue.service.js` sets `ocrQueue = new AsyncQueue(2)` line 59
   - If you run multiple Node instances (Kubernetes, autoscaling), each instance has its own queue and jobs won’t be shared.

2. **SSE uses in-memory connection map**
   - `backend/src/controllers/bill.controller.js` uses `const sseClients = new Map();` line 11
   - Works only within a single Node process and doesn’t survive restarts or multi-node deployments.

3. **Matching fallback loads entire reference collection**
   - `backend/src/utils/matcher.js` worst-case:
     - `candidates = await ReferenceItem.find({}).lean();` lines 68-70
   - This can create O(N) scanning per item when search fails.

4. **N+1 sequential matching queries**
   - `backend/src/services/audit.service.js`:
     - `for (const item of items) { await findBestMatch(rawName); ... }` lines 18-28
   - Each line-item triggers DB search, so extraction with many items scales poorly.

5. **JWT authentication exists but is not enforced on sensitive endpoints**
   - JWT issuance exists:
     - `backend/src/controllers/auth.controller.js` lines 3-19
   - But bill routes do not use auth middleware:
     - `backend/src/routes/bill.routes.js` lines 6-9
     - `backend/src/app.js` mounts billRoutes without auth middleware lines 50-53

### 1.5 Architecture quality rating (1–10)
**Architecture quality: 4/10**
Justification:
- Strong separation of OCR logic into a microservice (`ocr-service/`) and business audit logic into Node services.
- But production architecture is missing durability and scalability:
  - in-process queue (`AsyncQueue`) and in-memory SSE map
- Price data layer is not truly “government database ingestion”; it is seeded static reference data.
- Matching is likely to be slow under real bills due to N+1 DB queries and worst-case full reference scan.

---

## SECTION 2 — Code Quality Audit

### 2.1 Code quality across major modules (scores)

**A) Backend API (Node/Express) — 4/10**
- Good:
  - `helmet()`, `compression()`, `express-rate-limit` are present in `backend/src/app.js` lines 12-32
  - global error handler `backend/src/middlewares/errorHandler.js` returns appropriate status codes lines 3-40
  - retry & timeout handling for OCR call (`axios` timeout + MAX_RETRIES) in `backend/src/services/ocr.service.js` lines 7-55
- Bad:
  - `audit.service.js` does sequential DB matching per item (N+1 queries) lines 18-28
  - matcher can load entire reference collection lines 68-70
  - JWT is not used to protect any bill endpoints
  - no structured validation for OCR response shape (it only checks `result.items` exists)

**B) OCR Microservice (Python/FastAPI) — 7/10**
- Good:
  - engine selection + confidence scoring are robust and deterministic
  - explicit input validation:
    - content-type and size checks in `ocr_router.py` lines 9-33
  - avoids blocking event loop via `asyncio.to_thread` in `ocr_router.py` lines 33-35
  - pre-processing is well structured:
    - EasyOCR path avoids binarization, Tesseract path binarizes for clean text lines
- Bad:
  - no explicit request rate limiting
  - reads entire file contents into memory (`contents = await file.read()`) lines 26-27
  - relies on the `filename` suffix for PDF detection in `process_bill_image` line 608-613
  - confidence gating ultimately may return hard error only when `not confidence['reliable'] and len(clean_items) == 0` lines 666-671 (other failure cases return `_make_error_response` but overall reliability propagation to frontend is incomplete)

**C) Frontend (React/Vite) — 5/10**
- Good:
  - SSE user experience
  - basic UI state management and input validation (client-side file type/size)
- Bad:
  - Export/report generation is not implemented; UI buttons are wired with `onClick={() => {}}`:
    - `frontend/src/components/ActionPanel.jsx` lines 39-58
  - localStorage persists the last bill audit result:
    - `frontend/src/pages/UploadPage.jsx` lines 137-140
    - `frontend/src/components/upload/UploadPage.jsx` lines 141-154
  - “End-to-end encryption” is claimed in UI but no cryptography is implemented in code (only text claims).

### 2.2 Read-every-file quality findings (hardcoded values, debug statements, security/perf risks)

#### Hardcoded values that should be config/env
1. **Backend**
   - rate limit values are hardcoded in `backend/src/app.js` lines 28-32:
     - `windowMs: 15 * 60 * 1000`
     - `max: 100`
   - Async queue concurrency hardcoded:
     - `backend/src/utils/queue.service.js` line 59 sets `concurrency = 2`

2. **OCR service**
   - pre-processing constants hardcoded:
     - `image_preprocess.py`:
       - `MAX_WIDTH = 2000`, `MIN_WIDTH = 600`, `DENOISE_STRENGTH = 10`, `MAX_DESKEW_ANGLE = 15` lines 21-25
   - OCR confidence thresholds and item price validators hardcoded:
     - `validators.py` lines 15-22

3. **Reference pricing layer**
   - “government pricing” is seeded hardcoded arrays:
     - `backend/src/seed.js`:
       - `referenceData` list is static and embedded in the source.

#### TODO/FIXME/print/debug statements
- Python OCR:
  - `ocr-service/app/utils/download_models.py` uses `print()`:
    - lines 4-8
- Frontend:
  - `frontend/src/services/mappls.service.js` includes `console.log` and `console.warn` for token and API calls:
    - token acquired: line 111
    - OAuth failed: line 115
    - searching strategy logs: lines 133-152
- Backend uses Winston logger (`winston`), not raw `console.log`, which is good:
  - `backend/src/utils/logger.js` lines 1-17

#### Commented-out dead code / dead UI claims
- Multiple UI actions are visually present but don’t perform any operation:
  - `frontend/src/components/ActionPanel.jsx`:
    - Saved Reports export/support buttons call `onClick={() => {}}` lines 39-58
  - `frontend/src/components/reports/ReportsPage.jsx` shows Export button UI but does not connect to any handler that generates a PDF:
    - `frontend/src/components/reports/ReportsPage.jsx` lines 113-125

#### Security vulnerabilities (specific)

1. **JWT auth is not enforced**
   - JWT issuance exists in:
     - `backend/src/controllers/auth.controller.js` lines 3-21
   - But upload/history/job endpoints are mounted with no auth middleware:
     - `backend/src/app.js` lines 50-53 mount `billRoutes`
     - `backend/src/routes/bill.routes.js` lines 6-9 has no middleware

2. **Mappls client secret exposed to browser**
   - Frontend imports `VITE_MAPPLS_CLIENT_SECRET` and uses it in an OAuth token request from the browser:
     - `frontend/src/services/mappls.service.js` line 13 defines `MAPPLS_CLIENT_SECRET`
     - `getMapplsToken()` sends `client_secret=${encodeURIComponent(clientSecret)}` in body line 103
   - This is a critical secret leakage risk because Vite exposes `import.meta.env.VITE_*` to the client.

3. **PII redaction/masking absent**
   - The app transmits bill images/PDFs directly to OCR:
     - backend uploads raw file streams from client to OCR service:
       - `backend/src/services/ocr.service.js` lines 21-23
       - then `ocr_router.py` reads the file bytes and sends to `process_bill_image` without any anonymization:
         - `ocr_router.py` lines 26-35
   - No anonymization or redaction layer exists before OCR.

4. **Unprotected bill job visibility**
   - `GET /api/v1/bills/job/:jobId` returns a bill document:
     - `backend/src/controllers/bill.controller.js` lines 159-172
   - No auth checks.

5. **File type validation depends on client/mimetype**
   - `backend/src/middlewares/upload.js` checks `file.mimetype` only:
     - lines 16-22
   - Attackers can potentially spoof mimetype.

#### Performance bottlenecks (specific)

1. **N+1 sequential DB lookups for each OCR item**
   - `backend/src/services/audit.service.js`:
     - sequential loop awaiting `findBestMatch` per item lines 18-28

2. **Worst-case full reference scan**
   - `backend/src/utils/matcher.js` falls back to `ReferenceItem.find({}).lean()` lines 68-70
   - This can explode runtime and memory if the reference collection grows.

3. **SSE memory and connection scaling**
   - `sseClients` map is in-memory (`Map` in `bill.controller.js` line 11)
   - No cleanup on all error paths (partial cleanup on completion/failed states only).

### 2.3 Line-level reasoning: functions doing too many things / complexity

1. **`ocr-service/app/services/ocr_service.py.process_bill_image` is very large**
   - It coordinates decode → OCR engine selection → clustering → extraction → sanitization → total selection → validation → confidence scoring → response building.
   - Complexity is concentrated in one function (`process_bill_image`, lines ~592-680).

2. **`matcher.js.findBestMatch` has multiple fallback strategies but includes a catastrophic fallback**
   - It tries:
     - text search → regex → full scan.
   - Full scan fallback can turn a “minor mismatch” into an O(N) operation.

### 2.4 Overall architecture quality is separate from code quality
Code quality is degraded primarily by:
- lack of production-safe scalability primitives
- matching performance risks
- missing auth enforcement

---

## SECTION 3 — OCR & AI Pipeline Audit

### 3.1 OCR pipeline: image → structured JSON

Entry point:
- `ocr-service/app/routers/ocr_router.py.extract_bill_data`
  - allowed content types include `image/jpeg`, `image/png`, `image/webp`, `application/pdf` lines 9-11
  - reads whole file bytes (`await file.read()`) lines 26-27
  - calls `process_bill_image(contents, file.filename)` in a thread lines 33-35

Main pipeline:
- `ocr-service/app/services/ocr_service.py.process_bill_image`
  1. Decode:
     - PDF: `convert_pdf_to_images(image_bytes)` lines 610-613 and `convert_pdf_to_images` defined around 114-130
     - image: `cv2.imdecode(...)` lines 613-615
  2. OCR:
     - EasyOCR first: `extract_with_easyocr(img)` lines 621-624
     - fallback to Tesseract: `extract_with_tesseract(img)` lines 625-628
  3. Confidence filtering inside engines:
     - EasyOCR uses `MIN_EASYOCR_CONFIDENCE = 0.4` lines 107-109 and rejects low conf at `if conf < MIN_EASYOCR_CONFIDENCE` lines 150-154
     - Tesseract uses `MIN_TESSERACT_CONFIDENCE = 30` lines 108-110 and rejects low conf at lines 195-196
  4. Layout parsing:
     - rows clustered by `cluster_into_rows(boxes, y_tolerance=35)` lines 226-248; uses average `center_y` for stability
     - header row detected by keyword counts:
       - `is_header_row(row_text)` returns `header_hits >= 2` in noise filter lines 190-199
     - column detection uses header tokens in `detect_column_positions(...)` lines 251-270
  5. Line item extraction:
     - `parse_line_items(rows)`:
       - layer approach:
         - skip noise rows (`is_noise_row`) lines 317-322
         - skip headers but capture columns lines 323-327
         - detect totals and extract numeric candidates lines 329-337
         - else extract items per row with `_extract_item_from_row` lines 339-344
  6. Price/value validation:
     - `validate_item_price(price)` uses min/max constants in `validators.py` lines 15-30
     - quantity validation in `validators.py` lines 39-43
  7. Sanitization:
     - `sanitize_items(items)` validates price/quantity and deduplicates on `(name.lower(), price)` lines 155-189
  8. Total selection & validation:
     - `pick_best_total(total_candidates, item_sum)` lines 193-212
     - `validate_sum_against_total(items, declared_total)` returns `valid`, `difference_pct`, etc lines 46-94
  9. Confidence scoring:
     - `compute_confidence_score(...)` combines:
       - OCR confidence 35%
       - extraction confidence 35%
       - validation confidence 30% lines 139-152
     - returns `reliable: overall >= MIN_CONFIDENCE_THRESHOLD` lines 151-152
  10. Response shaping:
     - Returns `engine`, `items`, `parsedTotal`, `itemSum`, `confidence`, `validation`, `totalCandidates` lines 672-680

Backend expects:
- `backend/src/services/ocr.service.js.processOCR`
  - calls Node to OCR and expects `result.items` lines 61-63
  - computes `ocr_confidence` as average `item.confidence` lines 65-74
  - returns object `{ engine, items, total, ocr_confidence }` lines 69-74

### 3.2 Pre-processing pipeline robustness (OpenCV deskew, crop, denoise)
Implemented:
- `ocr-service/app/utils/image_preprocess.py`:
  - resize: `resize_image` uses MAX_WIDTH/MAX_WIDTH and MIN_WIDTH to scale large/small scans lines 21-52
  - grayscale conversion: `to_grayscale` lines 55-59
  - denoise: `cv2.fastNlMeansDenoising(image, h=DENOISE_STRENGTH)` lines 62-68
  - sharpen: `cv2.filter2D` kernel `SHARPEN_KERNEL` lines 71-78
  - contrast enhancement via CLAHE lines 80-88
  - deskew:
    - uses Canny edges, minAreaRect angle estimation
    - ignores angles beyond `MAX_DESKEW_ANGLE` and tiny angles lines 110-159
  - Tesseract-specific:
    - adaptive binarization `cv2.adaptiveThreshold` lines 161-171
    - remove table lines using morphology open operations lines 90-108

What’s missing:
- No explicit cropping of borders/margins.
- No explicit orientation metadata handling beyond deskew heuristic.

### 3.3 Gemini Vision API usage and prompt optimization
There is **no Gemini Vision API integration** in this codebase.
- Search results showed no `Gemini`, no prompt templates, and no LLM calls.
- OCR is handled purely by:
  - EasyOCR and Tesseract
  - OpenCV preprocessing
  - deterministic parsing/validation logic

Therefore:
- The “exact prompt being used” does not exist in code.
- Any “Gemini Vision” reference in documentation is not reflected in runtime behavior.

### 3.4 Extracted output parsing & validation
There is no “malformed JSON from Gemini” scenario.
Instead:
- OCR service returns a Python dict converted to JSON in FastAPI (standard).
- Validation occurs inside OCR pipeline:
  - price/quantity validators (`validate_item_price`, `validate_quantity`) in `validators.py` lines 24-44
  - sum validation in `validate_sum_against_total` lines 46-94
  - sanitization and dedup in `sanitize_items` lines 155-189

If OCR fails:
- OCR router wraps errors:
  - If Poppler missing for PDF: returns 400 with “Poppler missing” guidance lines 51-56
  - Else returns 500 with “OCR processing failed” lines 48-57

- Backend handles errors:
  - `callOCRService` throws if `!response.data || !response.data.success` lines 37-39
  - `processJob` maps timeouts/refusals to `TIMEOUT` else `FAILED_OCR` lines 140-142

### 3.5 Fuzzy matching engine audit (algorithm & mapping accuracy)

Algorithm implemented:
- `backend/src/utils/matcher.js` uses:
  - Mongo `$text` search against `normalizedName` and `aliases`:
    - `ReferenceItemSchema.index({ normalizedName: 'text', aliases: 'text' })` lines 12-13 in `reference.model.js`
    - and in `findBestMatch` query lines 54-58
  - If no candidates:
    - word-wise lookahead regex based on normalized words lines 61-66
  - If still none:
    - full scan of all `ReferenceItem` documents lines 68-70
  - Confidence scoring:
    - `calculateConfidence()`:
      - Jaccard similarity 0.6 weight lines 12-19 and 28-36
      - Levenshtein condensed distance 0.4 weight:
        - `Levenshtein.get(rawCondensed, refCondensed)` lines 32-35
    - alias logic:
      - exact match → 1.0
      - substring overlap → 0.9
      - else 0 lines 39-48
  - Selection gating:
    - best confidence < 0.5 returns no match lines 97-99

Matching accuracy:
- There is no evaluation dataset or metrics computed.
- Frontend displays hardcoded “System Accuracy 98%” in `frontend/src/components/upload/AnalyticsCharts.jsx` lines 285-290.
- No runtime calculation validates “98%”; it is not derived from `matchConfidence` or OCR confidence.

Therefore current matching “accuracy” is unknown beyond:
- `matchConfidence` stored per item is computed from `score` in matcher.js lines 76-93 and passed into audit as `matchConfidence: Math.round(score * 100) / 100` in `audit.service.js` lines 56-58.

### 3.6 Canonical drug name mapping strategy
- Canonical mapping is implemented as a seeded Mongo collection:
  - `backend/src/models/reference.model.js` defines:
    - `normalizedName`, `aliases`, `standardPrice`, `maxAllowedPrice`
  - seed script `backend/src/seed.js`:
    - hardcodes `referenceData` array (example: `Paracetamol 500mg`, multiple medicines, procedures, room charges, surgeries) lines 5-172
    - computes `maxAllowedPrice = Math.round(item.standardPrice * 1.5)` lines 175-180
    - seeds to `ReferenceItem` with `insertMany` lines 190-192

Cache:
- OCR results are cached:
  - `backend/src/utils/cache.service.js` uses FileCache with TTL to store `ocrData` keyed by fileHash.
  - There is **no matching lookup cache** (reference match candidates are queried on every item, unless OCR caching hits).

### 3.7 What happens when a drug name cannot be matched?
In `backend/src/services/audit.service.js`:
- When `findBestMatch(rawName)` returns `match: null`:
  - it adds `totalReference += totalPrice` lines 43-45
  - leaves `isOvercharged` false and `overchargeAmount` 0
- That means unmatched items are treated as “reference equals charged” and silently considered compliant.
- There is no user-facing “unmatched / needs review” signal.

### 3.8 OCR & audit pipeline robustness rating
**OCR & matching robustness: 6/10**
Justification:
- Strong OCR parsing architecture with noise filtering and confidence scoring.
- Good pre-processing split between EasyOCR and Tesseract.
- But audit robustness is weak because:
  - reference pricing layer is not truly government-based
  - unmatched items are treated as compliant instead of flagged
  - matching performance can degrade severely (full scan fallback)

---

## SECTION 4 — Database Audit

### 4.1 Current MongoDB schema (collections/fields/indexes)

1. **`Bill`** (`backend/src/models/bill.model.js`)
   - Primary fields:
     - `jobId`: string, `unique`, indexed lines 17-22
     - `status`: enum `['QUEUED','PROCESSING','COMPLETED','FAILED_OCR','FAILED_MATCH','TIMEOUT']` lines 23-27
     - `hospitalName`: string (but not set during upload flow) line 28
     - `items`: array of `BillItemSchema` lines 29
     - totals: `totalCharged`, `calculatedTotal`, `totalOvercharge` lines 30-33
     - `auditDate` lines 33-34
     - `error` string line 34
     - `timings` object: `uploadMs`, `queueWaitMs`, `ocrMs`, `matchMs` lines 35-40

   - `BillItemSchema` fields:
     - `rawName`, `matchedReference` ref to `ReferenceItem` lines 4-6
     - `quantity`, `unitPrice`, `totalPrice` lines 6-8
     - `isOvercharged`, `overchargeAmount` lines 9-11
     - `matchMethod` enum lines 11-12
     - `ocrConfidence`, `matchConfidence` lines 12-13

2. **`ReferenceItem`** (`backend/src/models/reference.model.js`)
   - fields: `name`, `normalizedName`, `aliases`, `category`, `standardPrice`, `maxAllowedPrice` lines 3-10
   - indexes:
     - `ReferenceItemSchema.index({ normalizedName: 'text', aliases: 'text' });` line 12

3. **`FileCache`** (`backend/src/models/fileCache.model.js`)
   - fields:
     - `fileHash` unique index lines 4-5
     - `ocrData` mixed required lines 5-6
     - `createdAt` with TTL: `expires: 2592000` (~30 days) lines 6-7

4. **`Store`** (`backend/src/models/store.model.js`)
   - geospatial:
     - `location` is `Point` with `coordinates: [longitude, latitude]` lines 29-39
     - index: `storeSchema.index({ location: '2dsphere' });` line 44

5. **`Scheme`** (`backend/src/models/Scheme.js`)
   - fields:
     - `name`, `minIncome`, `maxIncome`, `states` array, `benefits`, `coverageAmount`, `description` lines 3-34
   - index on `name` line 8-9

### 4.2 Government pricing data: stored locally vs fetched live
Stored locally:
- Reference pricing data is in Mongo via `ReferenceItem`.
- It is seeded from `backend/src/seed.js` using static `referenceData` list.
- There is no external NPPA/CGHS download code, no scheduled job, no “update mechanism”.

### 4.3 Data freshness & update mechanism
No freshness mechanism exists.
- `backend/src/seed.js` clears ReferenceItem and reinserts on `npm run seed` only.
- Therefore any “government schedule update” claim is not implemented in code.

### 4.4 Caching layer
- OCR caching exists:
  - `backend/src/utils/cache.service.js`:
    - reads from `FileCache.findOne({ fileHash })` lines 16-23
    - writes via `FileCache.create({ fileHash, ocrData })` lines 26-33
    - TTL is enforced via schema `expires: 2592000` line 6-7 in `fileCache.model.js`
- No caching for pricing reference lookups beyond Mongo indexes.

### 4.5 Query optimization & indexes
What exists:
- `Bill.jobId` has `unique` + `index` lines 17-22
- `ReferenceItem` has `text` index on `normalizedName` and `aliases` lines 12-13
- `Store.location` has `2dsphere` index line 45

Potential missing optimization:
- `findBestMatch` worst-case full scan (`ReferenceItem.find({}).lean()`) lines 68-70
  - this bypasses indexes and will get slower as dataset grows.

### 4.6 Audit results data model & user history storage
No per-user model:
- There is no `User` collection.
- `Bill` is keyed only by `jobId`, with no `userId` or owner reference.
- Bill history is fetched by status only:
  - `backend/src/controllers/bill.controller.js` `getHistory()`:
    - `Bill.find({ status:'COMPLETED' }).sort({ createdAt:-1 }).limit(50)` lines 148-151
- SSE stream and job retrieval are also open:
  - `streamJobStatus` and `getJob` find `Bill` by `jobId` only lines 68-172

### 4.7 Database design quality rating (1–10)
**Database design quality: 5/10**
Justification:
- Good: TTL for OCR cache (`FileCache.createdAt.expires`) and text/geospatial indexes exist.
- Bad:
  - no audit ownership model
  - no indexing strategy for matching performance besides text index
  - unmatched audit items are not tracked explicitly, so confidence and audit completeness is limited.

---

## SECTION 5 — Missing Features Audit (Production readiness gaps)

Below are **critically missing** features for production readiness, grounded in what the code actually does.

### 5.1 PII masking before sending images to external APIs
What it is:
- Redact/blur patient identifiers before OCR/external processing.
Why it matters:
- Patient bill images can include names, phone numbers, addresses, IDs.
Complexity: High (needs OCR-safe redaction strategy)
Priority:
- P0
Code evidence:
- Backend sends file bytes directly:
  - `backend/src/services/ocr.service.js` lines 21-23
- OCR service accepts and processes without masking:
  - `ocr-service/app/routers/ocr_router.py` lines 26-35
- No redaction utilities exist in OCR service (`ocr-service/app/utils/*` are only preprocessing/validators/noise_filter/download_models).

### 5.2 Grievance letter PDF generator (formal dispute letter)
What it is:
- Generate a legal-grade dispute letter citing NPPA/CGHS violations, include itemized evidence and complaint text.
Why it matters:
- MedClear’s marketing positions it as “legal-grade dispute report / letter”.
Complexity: Medium
Priority: P0
Code evidence:
- Landing UI includes “Generate Legal Letter” button, but it’s not wired to any generator:
  - `frontend/src/components/LandingPage.jsx` line 242: `<button ...>Generate Legal Letter</button>` with no handler.
- Export UI exists but has no implementation:
  - `frontend/src/components/ActionPanel.jsx` export button `onClick={() => {}}` lines 46-51
- No PDF libs in dependencies (backend has no pdf generation library; frontend has no `jspdf`/`pdfmake` imports).

### 5.3 WhatsApp bot integration (Twilio)
What it is:
- WhatsApp engagement, sending dispute letters/status updates.
Why it matters:
- Required for operational scalability and user notifications.
Complexity: Medium
Priority: P2
Code evidence:
- No Twilio integration exists; search finds no `twilio` and no WhatsApp endpoints.

### 5.4 IRDAI 199 non-payable items checker
What it is:
- Detect non-payable items under IRDAI guidelines.
Why it matters:
- Fraud detection beyond NPPA/CGHS ceilings.
Complexity: High (needs real rule engine/dataset)
Priority: P1
Code evidence:
- No IRDAI dataset, no rule logic, no endpoint.
- OCR noise filter focuses on GSTIN/phone/ID, not insurance non-payable items.

### 5.5 State-level pricing database (beyond central CGHS)
What it is:
- Use state-specific ceiling schedules where applicable.
Why it matters:
- Real India pricing varies; scheme eligibility and price ceilings differ by state/program.
Complexity: High
Priority: P1/P2
Code evidence:
- “State” exists only in schemes eligibility:
  - `backend/src/controllers/schemeController.js` uses `states` array filter lines 19-33
- Pricing/reference items are seeded without state dimension:
  - `ReferenceItem` schema has no state field (only `category`, `standardPrice`).

### 5.6 Mobile PWA capability
What it is:
- offline usage, installable app, caching, background sync.
Why it matters:
- improves mobile trust and resilience.
Complexity: Medium
Priority: P2
Code evidence:
- No service worker / manifest / workbox:
  - no `manifest.json`, no `serviceWorker` or `workbox` references in `frontend/src`

### 5.7 Rate limiting on API endpoints
What it is:
- per-endpoint throttling for upload/ocr to prevent abuse.
Why it matters:
- OCR is expensive; attackers can exhaust CPU/memory.
Complexity: Low/Medium
Priority: P0
Code evidence:
- Backend has global rate limit in `backend/src/app.js` lines 28-32 (good baseline).
- OCR service has **no** visible rate limiting logic:
  - only FastAPI router exists; no middleware shown in OCR code.

### 5.8 User authentication and audit history
What it is:
- Auth required to view own bills; store bills per user; protect SSE streams.
Why it matters:
- without it, any jobId can expose user data.
Complexity: High
Priority: P0
Code evidence:
- JWT issuance exists (`backend/src/services/auth.service.js` lines 25-28)
- But audit endpoints ignore auth:
  - `backend/src/routes/bill.routes.js` has no auth middleware.
  - Frontend sends `Authorization` header, but backend never validates.
- Bill history is global:
  - `backend/src/controllers/bill.controller.js` `getHistory()` returns latest 50 completed bills without filtering by user lines 148-151.

### 5.9 Bill storage and retrieval
What it is:
- store original bill files encrypted; allow retrieval by user.
Why it matters:
- audit disputes require evidence re-download and legal referencing.
Complexity: Medium
Priority: P1
Code evidence:
- Uploaded files go into `os.tmpdir()` and are cleaned up after OCR:
  - `cleanupFile(file.path)` in `backend/src/controllers/bill.controller.js` lines 121-122 and 138
- No bill image/PDF blob storage in Mongo or object store.
- Bill documents store only extracted items and totals.

### 5.10 Audit confidence scoring surfaced to users
What it is:
- show overall reliability score and highlight low-confidence matches.
Why it matters:
- user trust + dispute quality.
Complexity: Low/Medium
Priority: P1
Code evidence:
- OCR service computes `confidence.reliable` and `overall_confidence` lines 139-152 and `_make_error_response` usage.
- Backend discards OCR confidence object:
  - `backend/src/services/ocr.service.js.processOCR` returns `ocr_confidence` but `audit.service.js` never stores/use it for summary.
- Frontend only uses per-item fields: `matchMethod`, `overchargeAmount`, etc.

### 5.11 Multi-language support (Hindi, Gujarati, Tamil, Bengali)
What it is:
- OCR extraction in multiple Indian languages and UI localization.
Why it matters:
- India scale requires multilingual.
Complexity: High
Priority: P2
Code evidence:
- EasyOCR is initialized with only `['en']`:
  - `ocr-service/app/services/ocr_service.py` line 67
- Frontend is hardcoded English UI (no i18n library usage).

### 5.12 Offline fallback mode
What it is:
- allow UI usage if OCR service fails (queued upload, retry, offline cache).
Why it matters:
- improves reliability.
Complexity: Medium
Priority: P2
Code evidence:
- No offline queueing; SSE errors show alert and abort processing.

### Summary of missing features priorities
Most critical (P0): PII masking, auth enforcement, PDF/legal letters, durable storage & per-user history, better rate limiting for OCR endpoints.

---

## SECTION 6 — Security & Compliance Audit

### 6.1 Data storage: patient data (images/extracted text)
What is stored?
1. **Images/PDF files**
   - stored temporarily in OS tmp directory:
     - `backend/src/middlewares/upload.js` destination `os.tmpdir()` lines 5-6
   - deleted after OCR:
     - `cleanupFile(file.path)` at `bill.controller.js` lines 121-122 and 138
2. **Extracted text / OCR outputs**
   - stored in `FileCache` (TTL ~30 days) as `ocrData: Mixed`:
     - `backend/src/models/fileCache.model.js` lines 3-7
   - stored in `Bill.items` as:
     - `rawName`, `ocrConfidence`, `matchConfidence`, and audit outcomes.
     - `backend/src/models/bill.model.js` lines 3-14
3. **Bill history**
   - no explicit deletion; `Bill` has `timestamps: true` and no TTL.

Where stored:
- Mongo collections: `Bill`, `FileCache`.

Retention:
- `FileCache` TTL: `expires: 2592000` (~30 days) in `fileCache.model.js` line 6-7
- `Bill` retention: unbounded (no TTL indexes).

### 6.2 PII sent to external APIs without masking
External/internal APIs used:
- OCR microservice is a separate service endpoint.
No masking:
- backend forwards the raw file stream to OCR service directly:
  - `backend/src/services/ocr.service.js` lines 21-23
- OCR service extracts raw fields and stores them.

Additionally:
- Frontend stores the final audit result in `localStorage`:
  - `frontend/src/pages/UploadPage.jsx` lines 137-140
  - `frontend/src/components/upload/UploadPage.jsx` lines 141-154

### 6.3 API keys & secrets handling
Keys exposure:
1. Mappls OAuth secret is exposed in browser:
   - `frontend/src/services/mappls.service.js` line 13 includes `VITE_MAPPLS_CLIENT_SECRET`
   - request includes `client_secret=` in request body line 103
2. GA ID is fine (not a secret):
   - `frontend/src/utils/analytics.js` uses `VITE_GA_ID`

Backend keys:
- JWT secret uses `process.env.JWT_SECRET` line 26 in auth.service.js.

### 6.4 Input validation on file uploads
Backend validation:
- mimetype allow list:
  - `backend/src/middlewares/upload.js` lines 16-22
- size limit 10MB:
  - `backend/src/middlewares/upload.js` line 15

OCR service validation:
- content_type and size validations:
  - `ocr_router.py` lines 9-33

Missing:
- no file signature (“magic bytes”) verification.
- no virus/malware scanning.

### 6.5 Endpoint protection & rate limiting
Backend:
- global rate limiting exists:
  - `backend/src/app.js` lines 28-32
But:
- no auth middleware for bills endpoints.
- SSE endpoints are open to any caller with jobId.

OCR service:
- no rate limiting in OCR router.

### 6.6 DISHA compliance gap
DISHA (India health data law) compliance requires strong controls around:
- data minimization,
- purpose limitation,
- retention,
- access controls,
- patient rights (consent, deletion, export),
- security controls and audit logs.

Current gaps in code:
1. **No patient consent capture** in code
2. **No access control** for bill/job viewing:
   - bill routes are open (`backend/src/routes/bill.routes.js` lines 6-9)
3. **Unbounded retention** for `Bill` collection.
4. **No deletion/export mechanisms** for patient rights.
5. **No encryption at rest** shown (Mongo config not provided; code does not explicitly encrypt fields).
6. **No legal disclaimers** besides UI claims:
   - Upload pages say “Your data is encrypted and secure” but no encryption is implemented:
     - `frontend/src/pages/UploadPage.jsx` lines 570-580
     - `frontend/src/components/upload/InsightsPanel.jsx` lines 187-190

### 6.7 Security vulnerability score (1–10)
**Security vulnerability score: 6/10**
Key critical issues:
- JWT auth not enforced on sensitive endpoints
- Mappls client secret exposed to browser
- bill audit history not per user, jobId not protected

---

## SECTION 7 — Performance Audit

### 7.1 End-to-end latency estimate (from code)
Evidence in frontend:
- `frontend/src/components/UploadBill.jsx` shows “Processing typically takes 30-60 seconds” at ~637-639.

Backend behavior:
- OCR axios timeout default:
  - `backend/src/services/ocr.service.js` TIMEOUT = 60000ms line 9
  - supports retries up to `MAX_RETRIES = 3` lines 7-8, 44-50

If OCR times out:
- backend sets status `TIMEOUT` when `err.message includes 'timeout'` or `err.code === 'ECONNREFUSED'` lines 140-142 in `bill.controller.js`.

Match latency:
- `backend/src/services/audit.service.js` sequential matching:
  - N+1 sequential DB lookups lines 18-28

### 7.2 Bottlenecks
1. **OCR engine compute**:
   - EasyOCR + preprocessing are CPU-heavy on CPU-only environments.
2. **Sequential fuzzy matching & DB queries**:
   - `computeAudit` loops items and awaits `findBestMatch` for each line item.
3. **Potential catastrophic matcher fallback**:
   - when regex/text fails, it loads full `ReferenceItem` dataset (lines 68-70).
4. **No batching / preloading of reference data**

### 7.3 Async vs sync correctness
- OCR call is async and runs in thread via `asyncio.to_thread` in `ocr_router.py` lines 33-35 (good).
- Backend job queue is async but in-process.

### 7.4 Caching
- OCR output caching by file hash:
  - `FileCache` with TTL.
- No caching for matcher results or reference candidates.

### 7.5 Maximum concurrent users (current architecture)
Hard limit:
- `ocrQueue` concurrency:
  - `backend/src/utils/queue.service.js` line 59 sets concurrency = 2.
Implication:
- At most 2 OCR jobs processed simultaneously per Node instance.
- Under load, jobs queue in memory and SSE responses will wait.

### 7.6 What breaks first under load
1. Queue backlog grows unbounded in-memory (`AsyncQueue.queue`).
2. DB load spikes due to N+1 matching queries per bill.
3. Worst-case full reference scan per item causes CPU + DB thrash.
4. SSE connection map grows if clients never close.

### 7.7 Performance score (1–10)
**Performance score: 4/10**
Justification:
- Concurrency bottleneck fixed at 2
- N+1 matching and full-scan fallback can dominate runtime
- No caching at matching layer

---

## SECTION 8 — Market & Competitive Position Audit

### 8.1 Actual vs claimed features (code vs marketing)
Claims in `README.md` and UI:
- “Generate downloadable PDF reports” (README line ~71 and UI export sections)
- “Legal dispute letters”
- “Government sync real-time NPPA/CGHS”

Actual code:
1. **Government sync**
   - Implemented as seeded `ReferenceItem` in Mongo, not live NPPA/CGHS:
     - `backend/src/seed.js` seeds `ReferenceItem` with static sample costs.
2. **PDF reports**
   - No PDF generator exists. Export buttons have no handler.
3. **Legal letters**
   - “Generate Legal Letter” exists only as a UI button with no handler.

Therefore “actual vs claimed” mismatch is severe.

### 8.2 Competitive differentiation vs mentioned competitors
Compared to:
- Health Samadhan / manual consultancy:
  - MedClear *does* automate extraction and matching (core value), but lacks production legal letter/dispute workflows.
- ClaimBuddy (B2B insurance focus):
  - MedClear lacks insurance integration endpoints; no claim filing logic.
- Evaakil (IRDAI-focused):
  - No IRDAI 199 non-payable checker exists.
- HealthScan AI:
  - MedClear has deterministic matching but no evidence of LLM reasoning or validated government dataset coverage.

### 8.3 “Discharge Counter” test (<30 seconds mobile browser)
Can it run end-to-end in under 30 seconds?
**Unlikely consistently**, because:
1. OCR calls are heavy:
   - EasyOCR on CPU for multi-page documents
2. Sequential matching:
   - per line item it awaits DB queries (`computeAudit` lines 18-28)
3. Concurrency limit:
   - `AsyncQueue` concurrency = 2 means queueing delays under concurrent users.

What must change to hit benchmark:
- Replace in-process queue with distributed job workers and scale-out OCR/matching.
- Batch reference matching or preload reference mapping in memory.
- Remove catastrophic full-scan fallback in matcher.
- Optimize OCR runtime via:
  - better caching
  - limiting OCR scope by table extraction and pre-detection

### 8.4 Market readiness score
**Market readiness: 2/10 (demo/pilot-level only)**
Reason:
- The core audit computation runs, but:
  - missing legal/PDF/dispute flows
  - missing real government dataset integration/update
  - weak security model (open bill access + secret exposure)
  - poor scaling performance

### 8.5 Biggest gap for serving 1 million Indian patients
**Biggest gap**:
- Move from “prototype with local seeded reference data” to “production-grade regulated pricing + privacy architecture”.
Concretely:
- Real government schedule ingestion + versioning + audit trail
- Per-user encryption, access control, retention policies
- Durable background jobs and scalable matching

---

## SECTION 9 — Scaling Roadmap (based on actual code)

### Week 1–2 (Immediate fixes)
Goal: make it safe enough to put in limited pilot with basic reliability and security.

1. **Enforce authentication and attach ownership to bills**
   - Add auth middleware and require JWT for:
     - `POST /api/v1/bills/upload`
     - `GET /api/v1/bills/history`
     - `GET /api/v1/bills/job/:jobId/...`
   - Implement `userId` field in `backend/src/models/bill.model.js`:
     - add `userId: { type: ObjectId, ref: 'User', index: true }`
   - Update `backend/src/controllers/bill.controller.js`:
     - in `uploadBill`, store `userId` from verified token
     - in `getHistory` and `getJob` filter by `userId`
   - Add JWT verify middleware:
     - create new middleware file `backend/src/middlewares/auth.js` (not present currently)

2. **Fix catastrophic matcher fallback**
   - In `backend/src/utils/matcher.js`, remove or cap:
     - `candidates = await ReferenceItem.find({}).lean();` lines 68-70
   - Replace with:
     - preloaded in-memory reference index (built at startup)
     - or cap full scan to a small subset (by category or prefix)

3. **Remove N+1 sequential matching bottleneck**
   - In `backend/src/services/audit.service.js`:
     - replace per-item sequential awaits with batching:
       - build candidate pools per normalized name in parallel (`Promise.all`) with a concurrency limit
       - or precompute match results for repeated names

4. **Protect Mappls secrets**
   - In `frontend/src/services/mappls.service.js`:
     - stop using `VITE_MAPPLS_CLIENT_SECRET` in browser.
   - Move OAuth token flow to backend:
     - create backend endpoint `/api/v1/mappls-auth/token` that returns short-lived token
     - store Mappls client secret server-side only.

5. **Add OCR service rate limiting**
   - In `ocr-service/app/main.py` or router, add middleware for request throttling.
   - Add request concurrency limits, especially for CPU-only extraction.

### Month 1 (Foundation)
Goal: data correctness, legal evidence readiness, and robust job orchestration.

1. **Persist original bill securely**
   - Add object storage (S3/MinIO) for uploads; encrypt at rest.
   - Update backend to store a reference in `Bill`.

2. **Implement durable job queue**
   - Replace `AsyncQueue` in `backend/src/utils/queue.service.js` with a real job system (BullMQ/Redis-backed).
   - SSE: either poll job status or provide websocket with external pub/sub.

3. **Introduce reference dataset versioning**
   - Extend schema:
     - `ReferenceItem` add `pricingVersion` and `source` fields.
   - Add update mechanism for schedules (run ingest job nightly).

4. **Wire audit confidence into summary**
   - In OCR response, use:
     - `confidence.reliable` and `overall_confidence`
   - Store in Mongo:
     - `Bill.extractionReliability = ...`

### Month 2–3 (Growth infrastructure)
Goal: scale to 1,000 daily active users reliably.

1. **Preload reference index in matcher**
   - Build in-memory mapping from normalized names/aliases at service startup.
2. **Optimize matching pipeline**
   - Avoid repeated DB queries per item.
3. **Observability**
   - Add structured tracing IDs from upload → job → OCR call → matching → DB writes.

### Month 6+ (Scale to 100,000 users)
Goal: rebuild for scale.

Likely rebuild from scratch / major refactor:
1. **OCR extraction service**
   - Horizontal autoscaling of OCR workers.
2. **Audit engine**
   - Precomputed pricing index + caching.
3. **Pricing data service**
   - Externalized government schedule ingestion with version and governance.
4. **Security model**
   - Zero-trust access to bill artifacts; encrypted storage; strict retention policies.

---

## SECTION 10 — The Brutal Honest Summary

### Top 3 things done exceptionally well
1. **Deterministic OCR robustness architecture**
   - Dual engine selection + engine-specific preprocessing:
     - `ocr-service/app/utils/image_preprocess.py` `preprocess_for_easyocr()` vs `preprocess_for_tesseract()`
   - Noise filtering and confidence scoring are structured and centralized:
     - `ocr-service/app/utils/noise_filter.py` + `ocr-service/app/utils/validators.py`

2. **Practical async non-blocking design at the OCR endpoint**
   - OCR call uses `asyncio.to_thread` to avoid blocking FastAPI event loop:
     - `ocr-service/app/routers/ocr_router.py` lines 33-35

3. **Clear end-to-end orchestration loop exists**
   - Upload middleware → queue → OCR call → audit compute → SSE results:
     - `backend/src/controllers/bill.controller.js` lines 35-135

### Top 3 critical problems that will kill this project if not fixed in next 2 weeks
1. **No auth enforcement for bill endpoints**
   - Any client can access job results by `jobId`:
     - `backend/src/controllers/bill.controller.js` lines 159-172 and `streamJobStatus` lines 68-97
   - JWT is issued but unused for protection:
     - bill routes have no middleware (`backend/src/routes/bill.routes.js` lines 6-9)

2. **Matching performance can catastrophically degrade**
   - Worst-case full reference scan per item:
     - `backend/src/utils/matcher.js` lines 68-70
   - N+1 sequential DB lookups:
     - `backend/src/services/audit.service.js` lines 18-28

3. **“Government sync” is not actually government pricing data**
   - Pricing is hardcoded seeded sample reference values:
     - `backend/src/seed.js` referenceData array.
   - This destroys credibility for real legal disputes.

### Single most impressive thing about this codebase (solo, 3 weeks)
The fastest high-leverage part was **integrating a real OCR engine pipeline** (EasyOCR + Tesseract + OpenCV preprocessing) and building a full structured extraction → validation → itemization → audit calculation loop end-to-end.

### One architectural decision I would completely reverse (and why)
Reverse:
- Keep “in-process AsyncQueue + in-memory SSE map” as the core job orchestration mechanism.

Instead:
- Use a durable job system + worker pool.

Why:
- It blocks horizontal scaling and creates operational failure modes:
  - scaling to multiple instances breaks job processing
  - SSE streams break on restart
  - unbounded in-memory queue can crash the server under load.

### Overall project score: 4/10
This is a genuine working prototype for extracting and auditing line items using OCR and fuzzy matching, and the OCR microservice itself shows solid engineering discipline. However, production viability fails on core pillars: security/auth is effectively absent for sensitive endpoints, government pricing is not truly ingested/maintained, and matching is likely to become prohibitively slow due to N+1 sequential DB queries and full-scan fallback. Until those are fixed, MedClear is best treated as a demo system, not a production-grade medical billing dispute platform.

