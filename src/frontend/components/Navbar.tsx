import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthProvider';
import { useTheme } from '../utils/ThemeContext';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { Activity, LogIn, User as UserIcon, LayoutDashboard, Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, roleData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut(auth);
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 italic serif">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 not-italic">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-sans font-bold text-xl tracking-tight text-gray-900 dark:text-white">AiCare</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <a href="/#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="/#assistant" className="hover:text-blue-600 transition-colors">AI Assistant</a>
          {user && (
            <Link to="/dashboard" className="flex items-center gap-1.5 text-blue-600 font-bold">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Desktop User Info / CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate max-w-[100px]">{user.displayName || user.email?.split('@')[0]}</span>
                    {roleData && (
                      <span className="text-[8px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md font-black uppercase tracking-tighter">
                        {roleData.role}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="text-[10px] text-gray-500 hover:text-red-600 uppercase tracking-wider font-bold"
                  >
                    Sign Out
                  </button>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 bg-gray-900 dark:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Get Started
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            className="md:hidden p-2 text-gray-600 dark:text-gray-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-8 space-y-6 flex flex-col items-center text-center">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-900 dark:text-white">Home</Link>
              <a href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-900 dark:text-white">Features</a>
              <a href="/#assistant" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-900 dark:text-white">AI Assistant</a>
              
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-blue-600">Dashboard</Link>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 w-full flex flex-col items-center gap-4">
                     <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{user.displayName || user.email}</p>
                          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{roleData?.role}</p>
                        </div>
                     </div>
                     <button 
                       onClick={handleSignOut}
                       className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold rounded-2xl"
                     >
                       Sign Out
                     </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20"
                >
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}
