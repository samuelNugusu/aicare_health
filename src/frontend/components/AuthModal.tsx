import React, { useState } from 'react';
import { Mail, Lock, User, Chrome, ArrowRight, X, HeartPulse, Stethoscope, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, registerWithEmail, loginWithEmail } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'client' | 'doctor'>('client');
  const [specialty, setSpecialty] = useState('General Practice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password, name, selectedRole, selectedRole === 'doctor' ? specialty : undefined);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `Failed to ${mode}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            <header className="mb-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                {mode === 'login' ? 'Access your clinical health dashboard.' : 'Select your real-world account type to proceed.'}
              </p>
            </header>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-100 dark:border-red-800/30">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Account Classification
                </label>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  <button
                    id="auth-role-client"
                    type="button"
                    onClick={() => setSelectedRole('client')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[64px] active:scale-[0.98] ${
                      selectedRole === 'client'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-500/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                      <HeartPulse className={`w-4 h-4 flex-shrink-0 ${selectedRole === 'client' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                      <span>Patient</span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                      Biometrics & Personal Lab Hub
                    </div>
                  </button>

                  <button
                    id="auth-role-doctor"
                    type="button"
                    onClick={() => setSelectedRole('doctor')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[64px] active:scale-[0.98] ${
                      selectedRole === 'doctor'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                      <Stethoscope className={`w-4 h-4 flex-shrink-0 ${selectedRole === 'doctor' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                      <span>Doctor / MD</span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                      Review & Certify Patient Labs
                    </div>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={selectedRole === 'doctor' ? "Dr. Full Name" : "Full Name"}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900 dark:text-white"
                    />
                  </div>

                  {selectedRole === 'doctor' && (
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white"
                      >
                        <option value="General Practice">General Practice / Family Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Endocrinology">Endocrinology & Metabolism</option>
                        <option value="Pathology & Laboratory">Clinical Pathology</option>
                        <option value="Internal Medicine">Internal Medicine</option>
                        <option value="Hematology">Hematology</option>
                      </select>
                    </div>
                  )}
                </>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900 dark:text-white"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900 dark:text-white"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                className={`w-full py-2.5 text-white rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 shadow-sm ${
                  mode === 'register' && selectedRole === 'doctor'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : `Join as ${selectedRole === 'doctor' ? 'Doctor' : 'Patient'}`)}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                <span className="bg-white dark:bg-gray-900 px-3">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm"
            >
              <Chrome className="w-4 h-4 text-[#4285F4]" />
              Google Account
            </button>

            <p className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-600 dark:text-blue-400 font-semibold uppercase text-xs tracking-wider hover:underline ml-1"
              >
                {mode === 'login' ? 'Join AiCare' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
