"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawLandmarks } from "@/utils/drawing_utils";

const INDEX_TIP = 8;
const MIDDLE_TIP = 12;

const DRUM_ANCHOR_X = 0.5;
const DRUM_ANCHOR_Y = 0.86;

/** Right (ku): lower thresholds + faster smoothing so quick strikes register; left stays slightly damped. */
const RATE_RIGHT = 0.00018;
/** Slightly less sensitive than right so small mirror jitter doesn’t block fast ku. */
const RATE_LEFT = 0.00026;
const MIN_DIST_STEP = 0.0011;
const MIN_DIST_RIGHT = 0.00082;
const STRONG_DIST_MULT = 2.15;
const STRONG_RATE_MULT = 1.42;
const DOMINANCE_RATIO = 1.72;
const SMOOTH_L = 0.4;
const SMOOTH_R = 0.64;
const BOTH_RESOLVE_MS = 64;
/** Short enough for fast ku-ku; still blocks double-fire from one swing. */
const COOLDOWN_MS = 108;

function assignHandsFromResults(results) {
  let leftHand;
  let rightHand;
  const n = results.landmarks?.length || 0;
  if (n === 0) return { leftHand, rightHand };

  if (results.handedness?.length === n) {
    for (let i = 0; i < n; i++) {
      const label = results.handedness[i]?.[0]?.displayName;
      if (label === "Left") leftHand = results.landmarks[i];
      else if (label === "Right") rightHand = results.landmarks[i];
    }
  }

  if (n === 2 && (!leftHand || !rightHand)) {
    const hand1 = results.landmarks[0];
    const hand2 = results.landmarks[1];
    if (hand1[0].x < hand2[0].x) {
      leftHand = hand1;
      rightHand = hand2;
    } else {
      leftHand = hand2;
      rightHand = hand1;
    }
  } else if (!leftHand && !rightHand && n === 1) {
    const label = results.handedness?.[0]?.[0]?.displayName;
    if (label === "Left") leftHand = results.landmarks[0];
    else rightHand = results.landmarks[0];
  }

  return { leftHand, rightHand };
}

function normX(lm, mirror) {
  return mirror ? 1 - lm.x : lm.x;
}

function normY(lm) {
  return lm.y;
}

/** Closest fingertip to the drum anchor + its position (for “toward body only” gating). */
function closestTipToAnchor(hand, mirror) {
  if (!hand?.[INDEX_TIP]) return null;
  const tips = [INDEX_TIP, MIDDLE_TIP].filter((i) => hand[i]);
  let best = null;
  let bestD = Infinity;
  for (const idx of tips) {
    const lm = hand[idx];
    const tipX = normX(lm, mirror);
    const tipY = normY(lm);
    const d = Math.hypot(tipX - DRUM_ANCHOR_X, tipY - DRUM_ANCHOR_Y);
    if (d < bestD) {
      bestD = d;
      best = { tipX, tipY, dist: d };
    }
  }
  return best;
}

/** Only count a hit near the ring; rejects wind-up while still far away. */
const MAX_DIST_FOR_HIT = 0.265;
/** Raw distance must shrink frame-to-frame (actually approaching). */
const MIN_RAW_CLOSURE = 0.00042;
/**
 * Tip velocity projected toward the drum (anchor − tip) · velocity — must be > 0 so outward
 * motion / rebound does not register (fixes early theem / ku).
 */
const MIN_TOWARD_VEL = 0.000085;

/**
 * Index + middle tip toward drum; short window merges two strikes into theem.
 * @param {{ running?: boolean, mirror?: boolean, onGestureDetected?: (p: { gesture: string, timestampMs: number }) => void }} props
 */
export default function HandGestureRecognition({
  running = true,
  mirror = true,
  onGestureDetected,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [active, setActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState("");
  const [debugInfo, setDebugInfo] = useState({});

  const smoothRef = useRef({ L: null, R: null });
  const prevSampleRef = useRef({ L: null, R: null });
  const lastGestureTime = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef(null);
  const bothTimerRef = useRef(null);
  const armedRef = useRef({ L: false, R: false, sL: false, sR: false, peakL: 0, peakR: 0 });

  const clearBothTimer = useCallback(() => {
    if (bothTimerRef.current) {
      clearTimeout(bothTimerRef.current);
      bothTimerRef.current = null;
    }
  }, []);

  const fireGesture = useCallback(
    (gesture, now) => {
      if (now - lastGestureTime.current < COOLDOWN_MS) return;
      clearBothTimer();
      armedRef.current = { L: false, R: false, sL: false, sR: false, peakL: 0, peakR: 0 };
      lastGestureTime.current = now;
      if (running) {
        onGestureDetected?.({ gesture, timestampMs: Math.round(now) });
      }
      setDetectedGesture(gesture);
      setTimeout(() => setDetectedGesture(""), 480);
      smoothRef.current = { L: null, R: null };
      prevSampleRef.current = { L: null, R: null };
    },
    [running, onGestureDetected, clearBothTimer]
  );

  const fireGestureRef = useRef(fireGesture);
  fireGestureRef.current = fireGesture;

  const scheduleResolveBoth = useCallback(() => {
    if (bothTimerRef.current) return;
    bothTimerRef.current = setTimeout(() => {
      const t = performance.now();
      const a = armedRef.current;
      const fg = fireGestureRef.current;
      const pl = a.peakL || 0;
      const pr = a.peakR || 0;
      if (a.sL && a.sR) fg("theem", t);
      else if (a.sL && !a.sR) fg("tha", t);
      else if (a.sR && !a.sL) fg("ku", t);
      else if (a.L && a.R) {
        if (pl >= pr * DOMINANCE_RATIO) fg("tha", t);
        else if (pr >= pl * DOMINANCE_RATIO) fg("ku", t);
        else if (pl > pr) fg("tha", t);
        else fg("ku", t);
      } else if (a.L) fg("tha", t);
      else if (a.R) fg("ku", t);
      armedRef.current = { L: false, R: false, sL: false, sR: false, peakL: 0, peakR: 0 };
      bothTimerRef.current = null;
    }, BOTH_RESOLVE_MS);
  }, []);

  const handLandmarkerRef = useRef(null);
  const scheduleResolveRef = useRef(scheduleResolveBoth);
  const mirrorRef = useRef(mirror);

  useEffect(() => {
    handLandmarkerRef.current = handLandmarker;
  }, [handLandmarker]);
  scheduleResolveRef.current = scheduleResolveBoth;
  useEffect(() => {
    mirrorRef.current = mirror;
  }, [mirror]);

  useEffect(() => {
    let cancelled = false;
    async function initMediapipe() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const make = async (delegate) =>
        HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate,
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.38,
          minHandPresenceConfidence: 0.35,
          minTrackingConfidence: 0.35,
        });

      try {
        const lm = await make("GPU");
        if (!cancelled) setHandLandmarker(lm);
      } catch {
        try {
          const lm = await make("CPU");
          if (!cancelled) setHandLandmarker(lm);
        } catch (e) {
          console.error("HandLandmarker init failed:", e);
        }
      }
    }
    initMediapipe();
    return () => {
      cancelled = true;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      clearBothTimer();
    };
  }, [clearBothTimer]);

  const stopCam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    lastVideoTimeRef.current = -1;
    setActive(false);
  };

  const startCam = async () => {
    if (!handLandmarker) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setActive(true);
          requestRef.current = requestAnimationFrame(predictWebcam);
        };
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  useEffect(() => {
    if (running && handLandmarker) {
      startCam();
    } else {
      stopCam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, handLandmarker]);

  function predictWebcam() {
    const landmarker = handLandmarkerRef.current;
    if (!videoRef.current || !canvasRef.current || !landmarker || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    const mirror = mirrorRef.current;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== video.currentTime) {
      const now = performance.now();
      lastVideoTimeRef.current = video.currentTime;
      const results = landmarker.detectForVideo(video, startTimeMs);

      canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      canvasCtx.save();
      if (mirror) {
        canvasCtx.translate(canvas.width, 0);
        canvasCtx.scale(-1, 1);
      }

      if (results.landmarks && results.landmarks.length > 0) {
        const { leftHand, rightHand } = assignHandsFromResults(results);
        const dbg = {};

        const sampleSide = (hand, key, rateMin, smoothK, minDist) => {
          const tip = closestTipToAnchor(hand, mirror);
          if (!tip) {
            smoothRef.current[key] = null;
            prevSampleRef.current[key] = null;
            return { hit: false, rate: 0, strong: false };
          }

          const distRaw = tip.dist;
          const { tipX, tipY } = tip;

          const prevSm = smoothRef.current[key];
          const dist =
            prevSm == null ? distRaw : smoothK * distRaw + (1 - smoothK) * prevSm;
          smoothRef.current[key] = dist;

          const prev = prevSampleRef.current[key];
          prevSampleRef.current[key] = { dist, distRaw, tipX, tipY, t: now };

          if (
            !prev ||
            typeof prev.dist !== "number" ||
            typeof prev.distRaw !== "number" ||
            typeof prev.tipX !== "number" ||
            typeof prev.tipY !== "number"
          ) {
            dbg[key] = { dist, rate: 0 };
            return { hit: false, rate: 0, strong: false };
          }

          const dt = Math.max(now - prev.t, 1);
          const distDelta = prev.dist - dist;
          const rate = distDelta / dt;

          const vx = (tipX - prev.tipX) / dt;
          const vy = (tipY - prev.tipY) / dt;
          const toAx = DRUM_ANCHOR_X - tipX;
          const toAy = DRUM_ANCHOR_Y - tipY;
          const towardVel = toAx * vx + toAy * vy;

          const rawClosure = prev.distRaw - distRaw;
          const inStrikeZone = distRaw < MAX_DIST_FOR_HIT;
          const actuallyApproaching =
            rawClosure >= MIN_RAW_CLOSURE && towardVel >= MIN_TOWARD_VEL;

          dbg[key] = { dist, rate, towardVel, rawClosure };

          const hit =
            rate > rateMin &&
            distDelta > minDist &&
            inStrikeZone &&
            actuallyApproaching;

          const strong =
            hit &&
            distDelta > minDist * STRONG_DIST_MULT &&
            rate > rateMin * STRONG_RATE_MULT;

          return { hit, rate, strong };
        };

        const leftS = sampleSide(leftHand, "L", RATE_LEFT, SMOOTH_L, MIN_DIST_STEP);
        const rightS = sampleSide(rightHand, "R", RATE_RIGHT, SMOOTH_R, MIN_DIST_RIGHT);
        setDebugInfo(dbg);

        const leftHit = leftS.hit;
        const rightHit = rightS.hit;

        if (leftHit) {
          armedRef.current.L = true;
          if (leftS.strong) armedRef.current.sL = true;
          armedRef.current.peakL = Math.max(armedRef.current.peakL || 0, leftS.rate);
        }
        if (rightHit) {
          armedRef.current.R = true;
          if (rightS.strong) armedRef.current.sR = true;
          armedRef.current.peakR = Math.max(armedRef.current.peakR || 0, rightS.rate);
        }

        if (leftHit && rightHit && leftS.strong && rightS.strong) {
          fireGestureRef.current("theem", now);
        } else if (rightHit && !leftHit) {
          fireGestureRef.current("ku", now);
        } else if (leftHit && !rightHit) {
          fireGestureRef.current("tha", now);
        } else if (leftHit || rightHit) {
          scheduleResolveRef.current();
        }

        const toDraw = [];
        if (leftHand?.[INDEX_TIP]) toDraw.push(leftHand[INDEX_TIP]);
        if (rightHand?.[INDEX_TIP]) toDraw.push(rightHand[INDEX_TIP]);
        if (toDraw.length) {
          drawLandmarks(canvasCtx, toDraw, {
            color: "#f87171",
            lineWidth: 1,
            radius: 12,
          });
        }

        const ax = (mirror ? 1 - DRUM_ANCHOR_X : DRUM_ANCHOR_X) * canvas.width;
        const ay = DRUM_ANCHOR_Y * canvas.height;
        canvasCtx.strokeStyle = "rgba(34,211,238,0.4)";
        canvasCtx.lineWidth = 2;
        canvasCtx.beginPath();
        canvasCtx.arc(ax, ay, 24, 0, 2 * Math.PI);
        canvasCtx.stroke();
      }

      canvasCtx.restore();
    }

    if (streamRef.current) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black aspect-video border-2 border-red-500/20 shadow-2xl shadow-red-500/10">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-85"
        style={{ transform: mirror ? "scaleX(-1)" : undefined }}
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,128,0.03))] z-10 bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none border-[1px] border-red-500/10 z-20" />

      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-red-500/50 z-20" />
      <div className="absolute top-12 left-4 z-30 max-w-[230px] rounded-lg border border-cyan-500/30 bg-black/50 px-2 py-1.5 text-[9px] font-mono text-cyan-200/90">
        <p className="text-cyan-400/80">
          Hits register only when tips move <strong>toward</strong> the ring (inward strike), not on the
          wind-up away from the body. Theem needs both hands clearly together in that motion.
        </p>
        <p className="mt-0.5">Left uses index+middle (easier when gripping the stick).</p>
      </div>

      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-red-500/50 z-20" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-red-500/50 z-20" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-red-500/50 z-20" />

      {!active && running && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-red-400 font-mono text-sm tracking-widest animate-pulse">
              INITIALIZING VISION...
            </p>
          </div>
        </div>
      )}

      {active && (
        <div className="absolute top-16 right-4 z-30 flex flex-col gap-2">
          <div className="glass-panel-strong px-3 py-1.5 rounded-lg border-red-500/20 text-[10px] font-mono text-white/70">
            <p>L→: {(debugInfo.L?.rate || 0).toFixed(5)}</p>
            <p>R→: {(debugInfo.R?.rate || 0).toFixed(5)}</p>
          </div>
        </div>
      )}

      {detectedGesture && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="px-8 py-4 bg-red-600/20 backdrop-blur-md border-2 border-red-500 rounded-2xl animate-ping-once">
            <span className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
              {detectedGesture}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
        <div className="flex items-center gap-2 px-2 py-1 bg-red-950/40 backdrop-blur-sm rounded border border-red-500/30">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-wider">
            Live Stream
          </span>
        </div>
      </div>
    </div>
  );
}
