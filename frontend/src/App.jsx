import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, Camera, Home as HomeIcon } from 'lucide-react';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
        {/* Navbar */}
        <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <Activity className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold heading-gradient tracking-tight">SkinSight AI</span>
              </div>
              <div className="flex space-x-6">
                <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <HomeIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link to="/scan" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <Camera className="h-5 w-5" />
                  <span className="hidden sm:inline">Scan</span>
                </Link>
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <Activity className="h-5 w-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
