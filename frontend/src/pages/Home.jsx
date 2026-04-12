import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl w-full flex flex-col items-center text-center z-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Next-Gen Dermatological AI</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Understand Your Skin with <br className="hidden md:block"/>
          <span className="heading-gradient">Clinical Precision</span>
        </h1>
        
        <p className="text-lg text-slate-400 mb-10 max-w-2xl">
          Upload a selfie and let our advanced Gemini Vision API and MediaPipe models analyze your skin health. Discover acne severity, pigmentation levels, and receive personalized skincare routines.
        </p>
        
        <Link to="/scan" className="glass-button px-8 py-4 text-lg inline-flex items-center gap-2">
          Start Skin Scan <ArrowRight className="w-5 h-5" />
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
          <div className="glass-panel p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Analysis</h3>
            <p className="text-slate-400 text-sm">Real-time facial mesh overlay and instant deep skin metric extraction.</p>
          </div>
          
          <div className="glass-panel p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Medical Grade AI</h3>
            <p className="text-slate-400 text-sm">Powered by Google Gemini Vision, identifying conditions across severity tiers.</p>
          </div>
          
          <div className="glass-panel p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-slate-400 text-sm">Keep history of your scans and track longitudinal improvements.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
