import { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import FaceMeshOverlay from '../components/FaceMeshOverlay';
import AnalysisResults from '../components/AnalysisResults';
import { Loader2, Activity } from 'lucide-react';

export default function Scan() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleImageSelect = (file, url) => {
    setImageFile(file);
    setImageUrl(url);
    setAnalysisResult(null);
  };

  const analyzeImage = async () => {
    // ✅ Prevent duplicate / invalid calls
    if (!imageFile || isAnalyzing || analysisResult) return;

    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API error");
      }

      if (data.analysis) {
        setAnalysisResult(data.analysis);

        // ✅ Save scan
        await fetch('http://localhost:5000/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user_123',
            imageUrl: data.imageUrl || imageUrl,
            acneSeverity: data.analysis.acneSeverity,
            lesionCount: data.analysis.estimatedLesionCount,
            pigmentationLevel: data.analysis.pigmentationLevel,
            zones: data.analysis.affectedZones,
            recommendations: data.analysis.skincareRecommendations
          })
        });
      }
    } catch (error) {
      console.log('Analysis failed:', error);
      alert('Analysis failed. Did you configure the .env API keys properly?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-6 animate-fade-in relative">
      <div className="absolute top-0 right-[20%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Skin Scan</h2>
        <p className="text-slate-400">Upload a front-facing image of your face for AI analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <div className="flex flex-col gap-6">
          {!imageUrl ? (
            <ImageUploader onImageSelect={handleImageSelect} />
          ) : (
            <div className="glass-panel p-6 flex flex-col gap-4">
              <div className="relative rounded-xl overflow-hidden aspect-square max-h-[500px] flex items-center justify-center bg-slate-900 border border-slate-700">
                
                {/* ✅ Force re-render when analysis changes */}
                <FaceMeshOverlay 
                  key={analysisResult ? JSON.stringify(analysisResult) : imageUrl}
                  imageUrl={imageUrl} 
                  analysisResult={analysisResult} 
                />

              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImageUrl(null);
                    setAnalysisResult(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 transition-colors flex-1"
                >
                  Upload New
                </button>

                <button
                  onClick={() => {
                    if (!isAnalyzing) analyzeImage();
                  }}
                  disabled={isAnalyzing}
                  className="glass-button shrink-0 px-6 py-2 grow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAnalyzing
                    ? 'Analyzing...'
                    : analysisResult
                    ? 'Analyzed'
                    : 'Run AI Analysis'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {isAnalyzing ? (
            <div className="glass-panel grow flex flex-col items-center justify-center p-12 text-center border-blue-500/30">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-indigo-400 animate-spin-reverse delay-150"></div>
                <Activity className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-blue-300">
                Google Gemini running analysis...
              </h3>
              <p className="text-slate-400 text-sm">
                Identifying lesions and pigmentation maps.
              </p>
            </div>
          ) : analysisResult ? (
            <AnalysisResults result={analysisResult} />
          ) : (
            <div className="glass-panel grow flex items-center justify-center p-12 text-slate-500 border-dashed border-2 border-slate-700/50 bg-slate-800/20">
              Analysis details will appear here after scanning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}