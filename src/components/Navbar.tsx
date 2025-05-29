import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, LogOut, Bus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  return (
    <header 
      className={`sticky top-0 z-40 w-full ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-white/95 backdrop-blur-sm'
      } transition-all duration-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section with logo and menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-slate-700 lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center ml-2 lg:ml-0">
              <Bus className="h-8 w-8 text-blue-800" />
              <span className="ml-2 text-xl font-bold text-blue-800 hidden sm:block">Bus Fleet System</span>
            </Link>
          </div>

          {/* Right section with user profile */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center text-sm p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <User className="h-5 w-5 text-slate-700" />
              <span className="ml-2 mr-1 font-medium hidden sm:block">
                {user?.email?.split('@')[0] || 'User'}
              </span>
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in">
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;