import { useEffect, useRef, useState } from 'react';

export default function FaceMeshOverlay({ imageUrl, analysisResult }) {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl || !isLoaded) return;

    // ✅ Initialize FaceMesh only once
    if (!faceMeshRef.current) {
      faceMeshRef.current = new window.FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMeshRef.current.onResults(handleResults);
    }

    setTimeout(() => {
      faceMeshRef.current.send({ image: imageRef.current });
    }, 100);

    return () => {
      faceMeshRef.current?.close();
      faceMeshRef.current = null;
    };
  }, [imageUrl, isLoaded, analysisResult]);

  // =========================
  // 🎯 DRAW FUNCTION
  // =========================
  const handleResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !img) return;

    // ✅ Match resolution
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.style.width = img.width + 'px';
    canvas.style.height = img.height + 'px';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const drawConnectors = window.drawConnectors;
    const FACEMESH_TESSELATION = window.FACEMESH_TESSELATION;

    // =========================
    // 🔷 FACE MESH + HEATMAP
    // =========================
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        // Mesh
        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
          color: 'rgba(59,130,246,0.8)',
          lineWidth: 0.6,
        });

        // Heatmap
        if (analysisResult?.affectedZones?.includes('cheeks')) {
          const color =
            analysisResult.acneSeverity === 'severe'
              ? 'rgba(255,0,0,0.8)'
              : analysisResult.acneSeverity === 'moderate'
              ? 'rgba(255,165,0,0.8)'
              : 'rgba(0,255,128,0.8)';

          const drawPolygon = (indices) => {
            ctx.beginPath();
            indices.forEach((i, idx) => {
              const x = landmarks[i].x * canvas.width;
              const y = landmarks[i].y * canvas.height;
              idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.closePath();

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.3;
            ctx.fill();
          };

          const LEFT_CHEEK = [116, 117, 101, 36, 206, 207, 147, 137];
          const RIGHT_CHEEK = [347, 346, 366, 378, 427, 426, 266, 330];

          drawPolygon(LEFT_CHEEK);
          drawPolygon(RIGHT_CHEEK);

          ctx.globalAlpha = 1;
        }
      }
    }

    // =========================
    // 🎯 YOLO BOXES (FINAL FIXED)
    // =========================
    if (analysisResult?.boundingBoxes?.length) {
      const scaleX = canvas.width / img.naturalWidth;
      const scaleY = canvas.height / img.naturalHeight;

      ctx.lineWidth = 2.5;
      ctx.font = "bold 13px Arial";

      analysisResult.boundingBoxes.forEach((box) => {
        // ✅ TOP-LEFT coords (NO center conversion)
        const x = box.x * scaleX;
        const y = box.y * scaleY;
        const w = box.w * scaleX;
        const h = box.h * scaleY;

        // Glow
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 12;

        ctx.strokeStyle = 'rgba(255,0,0,0.95)';
        ctx.strokeRect(x, y, w, h);

        // Label
        const conf = box.confidence
          ? Math.round(box.confidence * 100) + '%'
          : '';
        const text = `Acne ${conf}`;
        const textWidth = ctx.measureText(text).width;

        ctx.fillStyle = 'rgba(255,0,0,0.95)';
        ctx.fillRect(x, y - 18, textWidth + 8, 18);

        ctx.fillStyle = 'white';
        ctx.fillText(text, x + 4, y - 5);

        ctx.shadowBlur = 0;
      });
    }

    ctx.restore();
  };

  return (
    <div className="flex justify-center items-center">
      <div className="relative inline-block">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Scan subject"
          className="max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl"
          crossOrigin="anonymous"
          onLoad={() => setIsLoaded(true)}
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
        />
      </div>
    </div>
  );
}