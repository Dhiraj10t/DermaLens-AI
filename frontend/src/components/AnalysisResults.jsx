import { AlertTriangle, CheckCircle, Info, Droplet, ListFilter, Activity } from 'lucide-react';

export default function AnalysisResults({ result }) {
  if (!result) return null;

  const severityColors = {
    clear: 'text-green-400 bg-green-500/10 border-green-500/20',
    mild: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    moderate: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    severe: 'text-red-400 bg-red-500/10 border-red-500/20'
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'clear': return <CheckCircle className="w-5 h-5" />;
      case 'mild': return <Info className="w-5 h-5" />;
      case 'moderate': return <AlertTriangle className="w-5 h-5" />;
      case 'severe': return <Activity className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-6 w-full animate-fade-in relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Activity className="w-48 h-48" />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-1">Analysis Results</h3>
        <p className="text-slate-400 text-sm">Powered by Gemini Vision AI</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border flex flex-col gap-2 ${severityColors[result.acneSeverity] || severityColors.mild}`}>
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium uppercase tracking-wider opacity-80">Acne Severity</span>
            {getSeverityIcon(result.acneSeverity)}
          </div>
          <span className="text-2xl font-bold capitalize">{result.acneSeverity}</span>
        </div>

        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium uppercase tracking-wider opacity-80">Lesion Count</span>
            <ListFilter className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold">{result.estimatedLesionCount}</span>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-300 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium uppercase tracking-wider opacity-80">Pigmentation</span>
            <Droplet className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold capitalize">{result.pigmentationLevel}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-300 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium uppercase tracking-wider opacity-80">Affected Zones</span>
          </div>
          <span className="text-lg font-medium capitalize">
            {result.affectedZones?.length > 0 ? result.affectedZones.join(', ') : 'None'}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-medium mb-3 text-blue-100 flex items-center gap-2">
          <SparkleIcon /> Skincare Recommendations
        </h4>
        <ul className="space-y-3">
          {result.skincareRecommendations?.map((rec, i) => (
            <li key={i} className="flex gap-3 text-slate-300 bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
