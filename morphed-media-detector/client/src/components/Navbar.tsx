import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-brand-accent transition-colors">
          <ShieldAlert className="w-8 h-8 text-brand-primary" />
          <span>Morphed Media Detector</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
              <div className="flex items-center gap-4 border-l border-slate-600 pl-4">
                <span className="flex items-center gap-2 text-brand-accent">
                  <User className="w-4 h-4" />
                  {user.name}
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-slate-400 hover:text-brand-danger transition-colors">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 border-l border-slate-600 pl-4">
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="bg-brand-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-brand-primary/20">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
