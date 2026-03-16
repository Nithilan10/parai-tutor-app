"use client";

import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks, HAND_CONNECTIONS } from "@/utils/drawing_utils";

export default function HandGestureRecognition({ onGestureDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState("");
  const [debugInfo, setDebugInfo] = useState({});
  const lastHandPositions = useRef({}).current;
  const lastGesture = useRef("");

  useEffect(() => {
    async function createHandLandmarker() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      setHandLandmarker(landmarker);
    }
    createHandLandmarker();
  }, []);

  useEffect(() => {
    if (handLandmarker && !webcamRunning) {
      enableCam();
    }
  }, [handLandmarker]);

  const enableCam = () => {
    if (!handLandmarker) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
    }

    setWebcamRunning(true);

    const constraints = {
      video: true,
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }
    });
  };

  let lastVideoTime = -1;
  const predictWebcam = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      window.requestAnimationFrame(predictWebcam);
      return;
    }

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const videoHeight = "360px";
    const videoWidth = "480px";

    canvas.style.height = videoHeight;
    video.style.height = videoHeight;
    canvas.style.width = videoWidth;
    video.style.width = videoWidth;

    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
      const deltaTime = performance.now() - (lastHandPositions.time || performance.now());
      lastHandPositions.time = performance.now();

      lastVideoTime = video.currentTime;
      const results = handLandmarker.detectForVideo(video, startTimeMs);
      console.log("MediaPipe results:", results);

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      if (results.landmarks && results.landmarks.length > 0) {
        const newDebugInfo = {};
        let leftHand, rightHand;

        if (results.landmarks.length === 2) {
          const hand1 = results.landmarks[0];
          const hand2 = results.landmarks[1];
          if (hand1[0].x < hand2[0].x) {
            leftHand = hand1;
            rightHand = hand2;
          } else {
            leftHand = hand2;
            rightHand = hand1;
          }
        } else if (results.handedness[0][0].displayName === 'Left') {
          leftHand = results.landmarks[0];
        } else {
          rightHand = results.landmarks[0];
        }

        const processHand = (hand, handName) => {
          if (!hand) return;

          const wrist = hand[0];
          let velocity = 0;

          if (lastHandPositions[handName]) {
            const lastWrist = lastHandPositions[handName];
            velocity = Math.sqrt(Math.pow(wrist.x - lastWrist.x, 2) + Math.pow(wrist.y - lastWrist.y, 2)) / deltaTime;
          }

          newDebugInfo[handName] = { x: wrist.x, y: wrist.y, velocity };
          lastHandPositions[handName] = wrist;
        };

        processHand(leftHand, "Left");
        processHand(rightHand, "Right");

        let gesture = "";
        const leftVelocity = newDebugInfo["Left"]?.velocity || 0;
        const rightVelocity = newDebugInfo["Right"]?.velocity || 0;

        if (leftVelocity > 0.015 && rightVelocity > 0.015) {
          gesture = "theem";
        } else if (rightVelocity > 0.015) {
          gesture = "ku";
        } else if (leftVelocity > 0.015) {
          gesture = "tha";
        }

        if (gesture && gesture !== lastGesture.current) {
          onGestureDetected(gesture);
          lastGesture.current = gesture;
          setTimeout(() => {
            lastGesture.current = "";
          }, 500);
        }

        setDetectedGesture(gesture);
        setDebugInfo(newDebugInfo);

        for (const landmarks of results.landmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 8,
          });
          drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2, radius: 8 });
        }
      }
      canvasCtx.restore();
    }

    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full h-auto" autoPlay playsInline />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute top-4 right-4 bg-black/50 text-white text-lg p-2 rounded">
        <p>Left Hand: {debugInfo.Left ? `x: ${debugInfo.Left.x.toFixed(2)}, y: ${debugInfo.Left.y.toFixed(2)}, v: ${debugInfo.Left.velocity.toFixed(4)}` : "Not detected"}</p>
        <p>Right Hand: {debugInfo.Right ? `x: ${debugInfo.Right.x.toFixed(2)}, y: ${debugInfo.Right.y.toFixed(2)}, v: ${debugInfo.Right.velocity.toFixed(4)}` : "Not detected"}</p>
      </div>
      {detectedGesture && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-2xl font-bold p-2 rounded">
          {detectedGesture}
        </div>
      )}
    </div>
  );
}
