# TrackSense

**Live Track Condition & Strategy Intelligence**

PS2 — "Weather Whiplash" | Plaksha DS Brar Center Hackathon

---

## Overview

TrackSense turns ordinary trackside camera footage into a live, spatial model of the racing surface — not just a single wet/dry classification, but a zone-by-zone read (racing line, apex, outer edge) fused from two independent signals, tracked over time, and translated into an actual tyre strategy call with a confidence score attached.

Most surface-detection approaches answer "is the track wet right now?" from a single frame. TrackSense answers the question race engineers actually care about: which zone, how wet, trending which way, how fast, and what should we do about it.

## Core Pipeline

Live camera feed
  -> Zone segmentation (racing line / apex / outer edge)
  -> Two independent wetness signals per zone
       Vision: brightness drop + specular highlights + texture variance
       Reflectance proxy: HSV saturation/desaturation (independent channel)
  -> Per-signal EMA smoothing (kills frame-to-frame camera/lighting noise)
  -> Signal fusion (agreement -> high confidence, disagreement -> flagged + lower confidence)
  -> Temporal trend engine (direction + velocity per zone)
  -> Confidence-aware tyre strategy recommendation

Every derived value (zone label, tyre pick, strategy message) is computed from a single shared upstream number rather than independently, so the label on screen can never contradict the percentage next to it, and the recommended tyre can never contradict its own explanation.

## Tech Stack

Backend
- FastAPI + Uvicorn
- OpenCV (frame decoding, HSV/grayscale analysis, zone cropping)
- NumPy

Frontend
- React + Vite
- Tailwind CSS
- Motion (formerly Framer Motion) for UI/component animation
- GSAP for the boot sequence cinematics
- Recharts for the wetness trend graph
- Axios as the API client

## Features

- Zone-based reading: racing line, apex, and outer edge tracked independently, not a single overall number
- Dual-signal fusion: two genuinely independent wetness cues cross-checked against each other; disagreement is surfaced as lower confidence, not hidden
- Temporal smoothing: EMA on both raw signals before fusion, so the UI reflects real surface change rather than sensor/lighting jitter
- Trend-aware strategy engine: recommendation considers not just current wetness but direction and speed of change
- Confidence-scaled messaging: low-confidence calls are explicitly hedged in the UI copy rather than stated with false certainty
- Live mission-control dashboard: animated number tick-ups, zone glow-on-update, strategy snap-in transitions, scanning-line camera overlay, live clock readout
- Cinematic boot sequence: F1-style lights-out start into a track-draw/zone-illumination intro
- Graceful degradation: visible backend-unreachable banner with last-known-data fallback, loading skeletons before first frame lands

## Setup

### Backend

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Runs on http://localhost:8000

### Frontend

cd frontend
npm install
npm run dev

Runs on http://localhost:5174 (or whatever port Vite reports). Open /dashboard and allow camera access when prompted.

### Running Both

Two terminals: backend (uvicorn) and frontend (npm run dev) need to be running simultaneously for the live pipeline to work end to end.

## Project Structure

tracksense/
  backend/app/
    routers/analyze.py       - /analyze-frame endpoint, orchestrates the pipeline
    services/
      wetness.py             - vision-based wetness scoring + labeling
      thermal_sim.py         - saturation-based reflectance proxy (2nd signal)
      fusion.py               - cross-checks the two signals, computes confidence
      smoothing.py            - per-zone-per-signal EMA
      trend.py                 - temporal direction/velocity tracking
      zones.py                 - frame to zone crops
      strategy.py              - tyre recommendation + confidence-aware messaging
  frontend/src/
    components/
      boot/BootSequence.jsx           - GSAP intro sequence
      dashboard/                      - LiveFeed, ZoneMap, TrendGraph, StrategyCard
      shared/                          - AnimatedNumber, Skeleton, Panel, Badge, etc.
    pages/Dashboard.jsx
    lib/api.js

## Team

Team OMEGA 404 - Shravan Khanal, Rithwik, Kirthik
Affiliated with OWASP Sri Sairam

## License

Built for Plaksha DS Brar Center Hackathon 2026. Not currently licensed for reuse.
