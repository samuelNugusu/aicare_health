/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import LabUpload from './features/lab/LabUpload';
import ChatAssistant from './features/chat/ChatAssistant';
import Footer from './components/Footer';
import AdminDashboard from './features/admin/AdminDashboard';
import DoctorDashboard from './features/doctor/DoctorDashboard';
import PatientDashboard from './features/patient/PatientDashboard';
import DashboardLayout from './components/DashboardLayout';
import { useAuth } from './firebase/AuthProvider';
import { signInWithGoogle } from './firebase/firebase';
import { motion, useScroll, useSpring } from 'motion/react';
import { Activity } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, roleData, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/" />;
  if (roleData && !allowedRoles.includes(roleData.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

const DashboardRouter = () => {
  const { user, roleData, loading } = useAuth();
  
  if (loading) return null; // Handled by DashboardLayout wrapper

  if (!user) return <Navigate to="/" />;

  if (!roleData) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl text-center transition-colors">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Syncing Health Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-serif italic">We're calibrating your personalized dashboard. If this takes more than a few seconds, please click initialize below.</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/20"
        >
          Initialize Profile
        </button>
      </div>
    );
  }

  if (roleData.role === 'admin') return <AdminDashboard />;
  if (roleData.role === 'doctor') return <DoctorDashboard />;
  return <PatientDashboard />;
};

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[60]"
        style={{ scaleX }}
      />
      
      <Navbar />
      
      <main className="pt-16">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Features />
              
              <div id="how-it-works" className="py-24 bg-white dark:bg-gray-950/50 border-y border-gray-50 dark:border-gray-900 transition-colors">
                <div className="max-w-7xl mx-auto px-4">
                   <div className="text-center mb-16">
                      <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs">Workflow</span>
                      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-6 tracking-tight">How AiCare Works</h2>
                   </div>
                   
                   <div className="grid md:grid-cols-4 gap-8">
                     {[
                       { step: "01", title: "Upload Results", desc: "Scan or upload your physical lab documents securely." },
                       { step: "02", title: "AI Analysis", desc: "Our engine parses every marker and explains the data." },
                       { step: "03", title: "Get Recommendations", desc: "Receive personalized health advice based on your biology." },
                       { step: "04", title: "Chat with AI", desc: "Ask follow-up questions to your personal assistant." }
                     ].map((item, i) => (
                       <div key={i} className="relative p-8 rounded-[2rem] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all">
                          <span className="text-5xl font-sans font-black text-blue-100 dark:text-blue-900 absolute top-4 right-8 group-hover:text-blue-600/10 dark:group-hover:text-blue-400/10 transition-colors">{item.step}</span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">{item.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed relative z-10">{item.desc}</p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              <div id="assistant">
                <ChatAssistant />
              </div>

              {/* Ready to Take Control Section */}
              <section className="py-24 bg-blue-600 dark:bg-blue-700 relative overflow-hidden transition-colors">
                 <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white blur-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white blur-[100px] translate-x-1/2 translate-y-1/2 rounded-full" />
                 </div>
                 
                 <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-sans font-bold text-white mb-6 tracking-tight">
                      Ready to Take Control of Your Health?
                    </h2>
                    <p className="text-blue-100 mb-10 text-lg opacity-90">
                      Join thousands of users who are making data-driven decisions about their wellness. 
                      Start your free AI health analysis today.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-blue-600 dark:text-blue-700 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:bg-blue-50 transition-all"
                    >
                      Get Started for Free
                    </motion.button>
                 </div>
              </section>
            </>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'client']}>
              <DashboardLayout>
                <DashboardRouter />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

