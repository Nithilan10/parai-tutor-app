export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle finger
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring finger
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
];

export function drawConnectors(ctx, landmarks, connections, { color, lineWidth }) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  for (const connection of connections) {
    const [startIdx, endIdx] = connection;
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    ctx.beginPath();
    ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
    ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
    ctx.stroke();
  }
}

export function drawLandmarks(ctx, landmarks, { color, lineWidth, radius }) {
  ctx.fillStyle = color;
  for (const landmark of landmarks) {
    ctx.beginPath();
    ctx.arc(
      landmark.x * ctx.canvas.width,
      landmark.y * ctx.canvas.height,
      radius || 5,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}
