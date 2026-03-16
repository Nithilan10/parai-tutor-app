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
  const [velocities, setVelocities] = useState({ Left: 0, Right: 0 });
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
          delegate: "GPU",
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

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      if (results.landmarks) {
        let gesture = "";
        let leftHandFast = false;
        let rightHandFast = false;
        const newVelocities = { Left: 0, Right: 0 };

        for (let i = 0; i < results.landmarks.length; i++) {
          const landmarks = results.landmarks[i];
          const handedness = results.handedness[i] && results.handedness[i][0].displayName;
          const wrist = landmarks[0];

          if (lastHandPositions[handedness]) {
            const lastWrist = lastHandPositions[handedness];
            const velocity = Math.sqrt(Math.pow(wrist.x - lastWrist.x, 2) + Math.pow(wrist.y - lastWrist.y, 2)) / deltaTime;
            newVelocities[handedness] = velocity;
            if (velocity > 0.015) { // Velocity threshold
              if (handedness === "Left") leftHandFast = true;
              if (handedness === "Right") rightHandFast = true;
            }
          }
          lastHandPositions[handedness] = wrist;
          
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 8,
          });
          drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2, radius: 8 });
        }
        setVelocities(newVelocities);

        if (leftHandFast && rightHandFast) {
          gesture = "theem";
        } else if (rightHandFast) {
          gesture = "ku";
        } else if (leftHandFast) {
          gesture = "tha";
        }

        if (gesture && gesture !== lastGesture.current) {
          onGestureDetected(gesture);
          lastGesture.current = gesture;
          setTimeout(() => {
            lastGesture.current = "";
          }, 500); // Reset after 0.5 second to allow detecting the same gesture again
        }

        setDetectedGesture(gesture);
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
        <p>Left Velocity: {velocities.Left.toFixed(4)}</p>
        <p>Right Velocity: {velocities.Right.toFixed(4)}</p>
      </div>
      {detectedGesture && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-2xl font-bold p-2 rounded">
          {detectedGesture}
        </div>
      )}
    </div>
  );
}
