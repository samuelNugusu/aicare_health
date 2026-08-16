import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { collection, query, orderBy, onSnapshot, where, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Activity, Clock, FileText, ChevronRight, Zap, UserCheck, X, ShieldCheck, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/utils';
import LabUpload from '../lab/LabUpload';
import HealthMetrics from './HealthMetrics';
import AnalysisResults from '../lab/AnalysisResults';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PatientDashboardProps {
  patientId?: string;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patientId }) => {
  const { user, roleData } = useAuth();
  const effectiveUserId = patientId || user?.uid;
  const isViewingSelf = !patientId || patientId === user?.uid;
  const isDoctor = roleData?.role === 'doctor';
  
  const [results, setResults] = useState<any[]>([]);
  const [diagnosisStats, setDiagnosisStats] = useState({ completed: 0, verified: 0, failed: 0 });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patientData, setPatientData] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (resultId: string) => {
    if (!user || !effectiveUserId) return;
    setIsVerifying(true);
    try {
      await updateDoc(doc(db, `users/${effectiveUserId}/lab_results`, resultId), {
        status: 'verified',
        verifiedBy: user.uid,
        performedBy: user.uid
      });
      setSelectedResult(null);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!effectiveUserId) return;

    // If viewing someone else, fetch their profile info
    if (!isViewingSelf) {
      const unsub = onSnapshot(doc(db, 'users', effectiveUserId), (snap) => {
        setPatientData(snap.data());
      });
      return unsub;
    }
  }, [effectiveUserId, isViewingSelf]);

  useEffect(() => {
    if (!effectiveUserId) return;
    
    // Fetch all results for stats (maybe limit to a reasonable number for performance)
    const qStats = query(collection(db, `users/${effectiveUserId}/lab_results`));
    const unsubStats = onSnapshot(qStats, (snap) => {
      const stats = snap.docs.reduce((acc, doc) => {
        const s = doc.data().status;
        if (s === 'completed') acc.completed++;
        else if (s === 'verified') acc.verified++;
        else if (s === 'failed' || s === 'error') acc.failed++;
        return acc;
      }, { completed: 0, verified: 0, failed: 0 });
      setDiagnosisStats(stats);
    });

    const q = query(
      collection(db, `users/${effectiveUserId}/lab_results`),
      orderBy('uploadDate', 'desc'),
      limit(5)
    );
    const unsubResults = onSnapshot(q, (snap) => {
      setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubStats();
      unsubResults();
    };
  }, [effectiveUserId]);

  useEffect(() => {
    // Find all doctors in the system
    const q = query(collection(db, 'users'), where('role', '==', 'doctor'), limit(3));
    return onSnapshot(q, (snap) => {
      setDoctors(snap.docs.map(doc => doc.data()));
    });
  }, []);

  const chartData = [
    { name: 'Verified', value: diagnosisStats.verified, color: '#10b981' },
    { name: 'Pending', value: diagnosisStats.completed, color: '#3b82f6' },
    { name: 'Failed', value: diagnosisStats.failed, color: '#ef4444' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 transition-colors duration-300">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div>
           <div className="flex flex-wrap items-center gap-3 mb-1.5">
             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
               {isViewingSelf ? 'Health Hub' : 'Patient Profile'}
             </h1>
             {!isViewingSelf && (
               <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-semibold rounded-full uppercase tracking-wider">Read Only</span>
             )}
           </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {isViewingSelf 
              ? `Welcome back, ${user?.displayName?.split(' ')[0] || 'Member'}.`
              : `Reviewing clinical data for ${patientData?.displayName || 'Patient'}.`
            }
          </p>
        </div>
        <div className="flex gap-3">
           <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {isViewingSelf ? 'Active Monitoring' : 'Live Stream'}
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-1">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Clinical Verified</div>
          <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{diagnosisStats.verified} Records</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Active Analysis</div>
          <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{diagnosisStats.completed} Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="text-xs font-medium text-rose-500 uppercase tracking-wider mb-1">System Failures</div>
          <div className="text-lg sm:text-xl font-bold text-rose-500">{diagnosisStats.failed} Failed</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Total Reports</div>
          <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{diagnosisStats.verified + diagnosisStats.completed + diagnosisStats.failed} Total</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          Health Analytics Summary
        </h3>
        <div className="h-48 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888810" vertical={false} />
              <XAxis dataKey="name" stroke="#88888880" fontSize={11} fontWeight="600" tickLine={false} axisLine={false} />
              <YAxis stroke="#88888880" fontSize={11} fontWeight="600" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '10px', fontSize: '11px' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <section>
        <HealthMetrics userId={effectiveUserId} readOnly={!isViewingSelf} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 pt-2">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Recent Reports
              </h2>
              <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                Full Records →
              </button>
            </div>
            
            <div className="grid gap-3">
              {results.map((res, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedResult(res)}
                  className="group p-4 sm:p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/30 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{res.fileName}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{res.uploadDate?.toDate ? new Date(res.uploadDate.toDate()).toLocaleDateString() : 'Processing'}</span>
                        <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <span className={`font-semibold uppercase tracking-wider text-[10px] sm:text-xs flex items-center gap-1 ${res.status === 'verified' ? 'text-emerald-600 dark:text-emerald-400' : res.status === 'completed' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'}`}>
                          {res.status === 'verified' && <ShieldCheck className="w-3.5 h-3.5" />}
                          {res.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all group-hover:translate-x-0.5 flex-shrink-0" />
                </div>
              ))}
              
              {results.length === 0 && (
                <div className="py-14 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl mx-auto flex items-center justify-center mb-3 shadow-sm">
                       <FileText className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 font-medium text-xs">Awaiting clinical submissions</p>
                </div>
              )}
            </div>
          </section>

          {isViewingSelf && (
            <section>
               <LabUpload />
            </section>
          )}
        </div>

        <div className="space-y-6">
           <section className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600 blur-[70px] opacity-25" />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-5">
                   <div className="p-2 bg-blue-600 rounded-xl text-white">
                      <Zap className="w-4 h-4 fill-current" />
                   </div>
                   <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">AI Health Insights</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2.5 tracking-tight">Wellness Pulse</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {results.length > 0 
                    ? "Based on your latest labs, we're tracking a positive trend in your biomarkers. Keep up your healthy routines!"
                    : "Upload your first lab result to unlock personalized AI wellness insights and proactive health alerts."
                  }
                </p>
                <button 
                  onClick={() => {
                    const el = document.getElementById('how-it-works') || document.querySelector('section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3 bg-white text-gray-900 rounded-xl font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-all active:scale-[0.99]"
                >
                   View Full Analysis
                </button>
              </div>
           </section>

           <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl sm:rounded-3xl border border-blue-100 dark:border-blue-800/30 transition-colors">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider">Medical Network</h4>
                <UserCheck className="w-4 h-4 text-blue-500" />
              </div>
              
              <div className="space-y-3">
                {doctors.map((dr, i) => (
                  <div key={i} className="flex items-center gap-3.5 bg-white dark:bg-gray-800 p-3.5 rounded-xl sm:rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 flex-shrink-0">
                      {dr.displayName?.[0] || 'D'}
                    </div>
                    <div className="min-w-0">
                       <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{dr.displayName || 'Unnamed Dr.'}</div>
                       <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{dr.specialty || 'Health Specialist'}</div>
                    </div>
                  </div>
                ))}
                
                {doctors.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-3">No doctors available yet</p>
                )}
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResult(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50 dark:bg-gray-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedResult(null)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{selectedResult.fileName}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(selectedResult.uploadDate?.toDate()).toLocaleDateString()}</div>
                  <div className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                    selectedResult.status === 'verified' ? "bg-emerald-500 text-white" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  )}>
                    {selectedResult.status}
                  </div>
                </div>
              </div>

              <AnalysisResults 
                data={selectedResult.analysis} 
                isDoctor={isDoctor}
                status={selectedResult.status}
                onVerify={() => handleVerify(selectedResult.id)}
                isVerifying={isVerifying}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PatientDashboard;

