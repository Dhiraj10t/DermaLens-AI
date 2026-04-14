import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, Camera, Home as HomeIcon, LogOut, User } from 'lucide-react';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import { useContext } from 'react';

function AppContent() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
        {/* Navbar */}
        <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <Activity className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold heading-gradient tracking-tight">DermaLens AI</span>
              </div>
              <div className="flex space-x-6 items-center">
                <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <HomeIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link to="/scan" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <Camera className="h-5 w-5" />
                  <span className="hidden sm:inline">Scan</span>
                </Link>
                
                {user ? (
                  <>
                    <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                      <Activity className="h-5 w-5" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors bg-transparent border-0 cursor-pointer">
                      <LogOut className="h-5 w-5" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                    <span className="text-sm border ml-2 border-green-500/30 bg-green-500/10 text-green-400 px-2 py-1 rounded">
                       {user.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                      <User className="h-5 w-5" />
                      <span className="hidden sm:inline">Login</span>
                    </Link>
                  </>
                )}
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
