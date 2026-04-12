import { useEffect, useRef, useState } from 'react';

export default function FaceMeshOverlay({ imageUrl, analysisResult }) {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl || !isLoaded) return;

    const faceMesh = new window.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    const FACEMESH_TESSELATION = window.FACEMESH_TESSELATION;
    const drawConnectors = window.drawConnectors;

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');
      const img = imageRef.current;

      if (!canvas || !img) return;

      // ✅ FIX 1: use natural size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // ✅ FIX 2: match display size
      canvas.style.width = img.width + 'px';
      canvas.style.height = img.height + 'px';

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          // ✅ draw mesh correctly
          drawConnectors(
            canvasCtx,
            landmarks,
            FACEMESH_TESSELATION,
            { color: 'rgba(59, 130, 246, 1)', lineWidth: 0.7 }
          );

          // ✅ heatmap
          if (analysisResult) {
            const heatmapColor =
              analysisResult.acneSeverity === 'severe'
                ? 'rgba(239, 68, 68, 1)'
                : analysisResult.acneSeverity === 'moderate'
                  ? 'rgba(245, 158, 11, 1)'
                  : 'rgba(16, 185, 129, 1)';

            if (analysisResult?.affectedZones?.includes('cheeks')) {
              // LEFT CHEEK POLYGON
              const LEFT_CHEEK = [116, 117,101,36,206,207,147,137];

              canvasCtx.beginPath();
              LEFT_CHEEK.forEach((idx, i) => {
                const x = landmarks[idx].x * canvas.width;
                const y = landmarks[idx].y * canvas.height;

                if (i === 0) canvasCtx.moveTo(x, y);
                else canvasCtx.lineTo(x, y);
              });
              canvasCtx.closePath();

              canvasCtx.fillStyle = heatmapColor;
              canvasCtx.globalAlpha = 0.35;
              canvasCtx.fill();

              // RIGHT CHEEK POLYGON
              const RIGHT_CHEEK = [347,346,366,378,427,426,266,330];

              canvasCtx.beginPath();
              RIGHT_CHEEK.forEach((idx, i) => {
                const x = landmarks[idx].x * canvas.width;
                const y = landmarks[idx].y * canvas.height;

                if (i === 0) canvasCtx.moveTo(x, y);
                else canvasCtx.lineTo(x, y);
              });
              canvasCtx.closePath();

              canvasCtx.fillStyle = heatmapColor;
              canvasCtx.globalAlpha = 0.35;
              canvasCtx.fill();

              canvasCtx.globalAlpha = 1; // reset
            }
          }
        }
      }

      canvasCtx.restore();
    });

    // ✅ FIX 3: delay execution (important)
    setTimeout(() => {
      faceMesh.send({ image: imageRef.current });
    }, 100);

    return () => {
      faceMesh.close();
    };
  }, [imageUrl, isLoaded, analysisResult]);

  return (
    <div className="flex justify-center items-center">
      {/* ✅ FIX 4: proper wrapper */}
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