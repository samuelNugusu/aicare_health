import { useState, useEffect } from 'react';
import { auth, signInWithGoogle } from '../firebase/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Activity, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-gray-100 italic serif">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-sans font-bold text-xl tracking-tight text-gray-900 not-italic">AiCare</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
          <a href="#assistant" className="hover:text-blue-600 transition-colors">AI Assistant</a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-900">{user.displayName}</span>
                <button 
                  onClick={() => signOut(auth)}
                  className="text-[10px] text-gray-500 hover:text-red-600 uppercase tracking-wider font-bold"
                >
                  Sign Out
                </button>
              </div>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                try {
                  await signInWithGoogle();
                } catch (err) {
                  // Error already handled or logged
                }
              }}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Get Started
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
