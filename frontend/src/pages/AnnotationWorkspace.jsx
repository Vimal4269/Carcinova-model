import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import useImage from 'use-image';
import api from '../api';

const AnnotationWorkspace = () => {
  const { slideId } = useParams();
  const navigate = useNavigate();

  const baseHost = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://127.0.0.1:5000';
  const imageUrl = `${baseHost}/api/doi/slide_image/${slideId}`;
  const [image] = useImage(imageUrl, 'anonymous');

  // Canvas state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [magnification, setMagnification] = useState(localStorage.getItem('setting_mag') || '10x');
  const units = localStorage.getItem('setting_units') || 'mm';

  // 2-click measurement state
  const [pointA, setPointA] = useState(null); // Surface point (green)
  const [pointB, setPointB] = useState(null); // Deepest invasion point (red)
  const [clickStep, setClickStep] = useState(0); // 0 = waiting for A, 1 = waiting for B, 2 = done

  // Result state
  const [doiResult, setDoiResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  // Case context (to show classification in header)
  const [caseInfo, setCaseInfo] = useState(null);

  const stageRef = useRef(null);

  // Fetch slide → case info for the header
  useEffect(() => {
    // We'll try to get the classification from the parent case via a case lookup
    // For now we load it lazily when needed; the slideId is enough for the API call.
  }, [slideId]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.03; // reduced from 1.1 for smoother zooming
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleStageClick = (e) => {
    const pos = e.target.getStage().getRelativePointerPosition();
    if (clickStep === 0) {
      setPointA({ x: pos.x, y: pos.y });
      setClickStep(1);
      setDoiResult(null);
      setError('');
    } else if (clickStep === 1) {
      setPointB({ x: pos.x, y: pos.y });
      setClickStep(2);
    }
  };

  const handleClear = () => {
    setPointA(null);
    setPointB(null);
    setClickStep(0);
    setDoiResult(null);
    setError('');
  };

  const handleCalculate = async () => {
    if (!pointA || !pointB) {
      setError('Please click two points on the image first.');
      return;
    }

    setCalculating(true);
    setError('');

    try {
      const response = await api.post('/doi/calculate', {
        slide_id: parseInt(slideId),
        surface_points: [pointA.x, pointA.y],
        tumour_points: [pointB.x, pointB.y],
        magnification: magnification,
      });

      if (response.data.success) {
        setDoiResult(response.data);
      } else {
        setError(response.data.message || 'Calculation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate DOI.');
    } finally {
      setCalculating(false);
    }
  };

  const pixelDistance = pointA && pointB
    ? Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)).toFixed(1)
    : null;

  const CALIBRATION_FACTORS = { '4x': 0.0025, '10x': 0.0010, '20x': 0.0005, '40x': 0.00025 };
  const estimatedMm = pixelDistance
    ? (parseFloat(pixelDistance) * (CALIBRATION_FACTORS[magnification] || 0.001))
    : null;
    
  const estimatedDisplay = estimatedMm 
    ? (units === 'um' ? (estimatedMm * 1000).toFixed(0) + ' µm' : estimatedMm.toFixed(3) + ' mm')
    : null;

  const stageWidth = window.innerWidth - 240;
  const stageHeight = window.innerHeight - 48 - 72; // subtract header and toolbar

  return (
    <div className="flex flex-col h-full bg-surface-container">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-4 px-4 py-3 bg-surface border-b border-outline-variant flex-wrap">
        <div className="flex flex-col">
          <h2 className="font-title-md text-on-surface">DOI Measurement</h2>
          <p className="text-xs text-on-surface-variant">Slide #{slideId}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant text-sm">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            clickStep >= 1 ? 'bg-success text-white' : 'bg-surface-container-high text-on-surface-variant'
          }`}>A</span>
          <span className="text-on-surface-variant">→</span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            clickStep >= 2 ? 'bg-danger text-white' : 'bg-surface-container-high text-on-surface-variant'
          }`}>B</span>
          <span className="text-on-surface-variant ml-1 text-xs">
            {clickStep === 0 && 'Click surface point (A)'}
            {clickStep === 1 && 'Click invasion point (B)'}
            {clickStep === 2 && 'Ready to calculate'}
          </span>
        </div>

        {/* Magnification */}
        <div className="flex items-center gap-2">
          <label className="font-label-md text-on-surface text-sm">Mag:</label>
          <select
            value={magnification}
            onChange={(e) => setMagnification(e.target.value)}
            className="p-1.5 border border-outline-variant rounded bg-surface text-sm text-on-surface"
          >
            <option value="4x">4×</option>
            <option value="10x">10×</option>
            <option value="20x">20×</option>
            <option value="40x">40×</option>
          </select>
        </div>

        {/* Live estimate */}
        {pixelDistance && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
            <span className="material-symbols-outlined text-[16px]">straighten</span>
            ~{estimatedDisplay} (est.)
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-on-surface-variant hover:text-danger transition-colors text-sm"
          >
            Clear
          </button>
          <button
            onClick={handleCalculate}
            disabled={clickStep < 2 || calculating}
            className="px-4 py-1.5 bg-primary text-on-primary font-label-large rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5 text-sm"
          >
            {calculating ? (
              <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Calculating...</>
            ) : (
              <><span className="material-symbols-outlined text-[16px]">calculate</span> Calculate DOI</>
            )}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 border border-outline-variant text-on-surface-variant hover:text-on-surface rounded-lg text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* ── Result & Error Banner ── */}
      {(doiResult || error) && (
        <div className={`px-6 py-3 flex items-center gap-4 flex-wrap ${
          doiResult ? 'bg-success/10 border-b border-success/30' : 'bg-danger/10 border-b border-danger/30'
        }`}>
          {doiResult && (
            <>
              <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <div className="flex gap-6 text-sm">
                <span><span className="text-on-surface-variant">DOI: </span><strong className="text-on-surface">
                  {units === 'um' ? (doiResult.doi_mm * 1000).toFixed(0) + ' µm' : doiResult.doi_mm?.toFixed(3) + ' mm'}
                </strong></span>
                <span><span className="text-on-surface-variant">T-Stage: </span><strong className="text-on-surface">{doiResult.t_stage}</strong></span>
                <span><span className="text-on-surface-variant">Risk: </span><strong className={
                  doiResult.risk === 'High' ? 'text-danger' :
                  doiResult.risk === 'Moderate' ? 'text-warning' : 'text-success'
                }>{doiResult.risk}</strong></span>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="ml-auto px-4 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-medium"
              >
                Back to Case →
              </button>
            </>
          )}
          {error && (
            <>
              <span className="material-symbols-outlined text-danger">error</span>
              <span className="text-danger text-sm">{error}</span>
            </>
          )}
        </div>
      )}

      {/* ── Canvas ── */}
      <div
        className="flex-1 overflow-hidden bg-[#1a1a2e]"
        style={{ cursor: clickStep < 2 ? 'crosshair' : 'default' }}
      >
        <Stage
          width={stageWidth}
          height={stageHeight}
          onWheel={handleWheel}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={true}
          onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
          onClick={clickStep < 2 ? handleStageClick : undefined}
          ref={stageRef}
        >
          <Layer>
            {/* Slide image */}
            {image && <KonvaImage image={image} />}

            {/* Line between A and B */}
            {pointA && pointB && (
              <Line
                points={[pointA.x, pointA.y, pointB.x, pointB.y]}
                stroke="#facc15"
                strokeWidth={2.5 / scale}
                dash={[8 / scale, 4 / scale]}
                lineCap="round"
              />
            )}

            {/* Point A — Surface (green) */}
            {pointA && (
              <>
                <Circle
                  x={pointA.x}
                  y={pointA.y}
                  radius={8 / scale}
                  fill="#22c55e"
                  stroke="#fff"
                  strokeWidth={1.5 / scale}
                />
              </>
            )}

            {/* Point B — Deepest invasion (red) */}
            {pointB && (
              <>
                <Circle
                  x={pointB.x}
                  y={pointB.y}
                  radius={8 / scale}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={1.5 / scale}
                />
              </>
            )}
          </Layer>
        </Stage>
      </div>

      {/* ── Instructions overlay (shown when no points placed) ── */}
      {!pointA && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-sm border border-outline-variant rounded-xl px-6 py-3 flex items-center gap-3 text-sm pointer-events-none">
          <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-white text-xs font-bold">A</span>
          <span className="text-on-surface">Click the <strong>surface epithelium</strong> point on the image</span>
        </div>
      )}
      {pointA && !pointB && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-sm border border-outline-variant rounded-xl px-6 py-3 flex items-center gap-3 text-sm pointer-events-none">
          <span className="w-5 h-5 rounded-full bg-danger flex items-center justify-center text-white text-xs font-bold">B</span>
          <span className="text-on-surface">Click the <strong>deepest invasion</strong> point on the image</span>
        </div>
      )}
    </div>
  );
};

export default AnnotationWorkspace;
