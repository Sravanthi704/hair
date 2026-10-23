import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ScissorsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (path, label) => (
    <Link
      to={path}
      onClick={() => setOpen(false)}
      className={`text-sm font-medium transition-colors duration-200 ${
        isActive(path) ? 'text-brand-400' : 'text-slate-400 hover:text-slate-100'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-slate-100 hover:text-brand-400 transition-colors">
          <span className="text-brand-400"><ScissorsIcon /></span>
          <span>HairMatch</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {/* Trending is always visible */}
          {navLink('/trending', 'Trending')}

          {user ? (
            <>
              {navLink('/analyze', 'Analyze')}
              {navLink('/quiz', 'Style Quiz')}
              {navLink('/history', 'History')}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 bg-brand-600/20 border border-brand-500/30 text-brand-400 hover:bg-brand-600/30 text-xs font-semibold rounded-full transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/profile') ? 'text-brand-400' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-brand-600 overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : user.name.charAt(0).toUpperCase()
                  }
                </span>
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {navLink('/login', 'Login')}
              <Link
                to="/register"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-dark-800 border-t border-dark-500 px-4 py-4 flex flex-col gap-4 animate-fade-in">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-dark-500">
                <span className="w-9 h-9 rounded-full bg-brand-600 overflow-hidden flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : user.name.charAt(0).toUpperCase()
                  }
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              {navLink('/trending', 'Trending')}
              {navLink('/analyze', 'Analyze')}
              {navLink('/quiz', 'Style Quiz')}
              {navLink('/history', 'History')}
              {navLink('/profile', 'Profile')}
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setOpen(false)} className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
                  Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="text-left text-sm text-red-400 font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              {navLink('/trending', 'Trending')}
              {navLink('/login', 'Login')}
              {navLink('/register', 'Register')}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
