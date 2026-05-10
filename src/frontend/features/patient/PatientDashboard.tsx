import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { collection, query, orderBy, onSnapshot, where, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Activity, Clock, FileText, ChevronRight, Zap, UserCheck, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/utils';
import LabUpload from '../lab/LabUpload';
import HealthMetrics from './HealthMetrics';
import AnalysisResults from '../lab/AnalysisResults';

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

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 sm:space-y-12 transition-colors duration-300">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
        <div>
           <div className="flex flex-wrap items-center gap-3 mb-2">
             <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
               {isViewingSelf ? 'Health Hub' : 'Patient Profile'}
             </h1>
             {!isViewingSelf && (
               <span className="px-3 py-1 bg-blue-600 text-white text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest">Read Only</span>
             )}
           </div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
            {isViewingSelf 
              ? `Welcome back, ${user?.displayName?.split(' ')[0] || 'Member'}.`
              : `Reviewing clinical data for ${patientData?.displayName || 'Patient'}.`
            }
          </p>
        </div>
        <div className="flex gap-4">
           <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                {isViewingSelf ? 'Active Monitoring' : 'Live Stream'}
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Clinical Revisions</div>
          <div className="text-2xl font-black text-blue-600 italic tracking-tighter">{diagnosisStats.verified} Verified</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Processing Queue</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">{diagnosisStats.completed} Active</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">System Anomalies</div>
          <div className="text-2xl font-black text-rose-500 italic tracking-tighter">{diagnosisStats.failed} Failed</div>
        </div>
      </div>

      <section>
        <HealthMetrics userId={effectiveUserId} readOnly={!isViewingSelf} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 pt-4">
        <div className="lg:col-span-2 space-y-8 sm:space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6 sm:mb-8 px-2">
              <h2 className="text-lg sm:text-xl font-bold dark:text-white flex items-center gap-2 uppercase tracking-tight">
                Recent Reports
              </h2>
              <button className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:translate-x-1 transition-transform">
                Full Records →
              </button>
            </div>
            
            <div className="grid gap-3 sm:gap-4">
              {results.map((res, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedResult(res)}
                  className="group p-5 sm:p-6 bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight truncate">{res.fileName}</h4>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1 sm:mt-2">
                        <Clock className="w-3 h-3" />
                        <span>{res.uploadDate?.toDate ? new Date(res.uploadDate.toDate()).toLocaleDateString() : 'Processing'}</span>
                        <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <span className={`font-black uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center gap-1 ${res.status === 'verified' ? 'text-emerald-500' : res.status === 'completed' ? 'text-blue-500' : 'text-orange-500'}`}>
                          {res.status === 'verified' && <ShieldCheck className="w-3 h-3" />}
                          {res.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all group-hover:translate-x-1 flex-shrink-0" />
                </div>
              ))}
              
              {results.length === 0 && (
                <div className="py-20 bg-gray-50 dark:bg-gray-900/30 rounded-[3rem] border-4 border-dotted border-gray-200 dark:border-gray-800 text-center">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                       <FileText className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                    </div>
                    <p className="text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest text-xs italic">Awaiting clinical submissions</p>
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

        <div className="space-y-10">
           <section className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600 blur-[80px] opacity-30 animate-pulse" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-3 bg-blue-600 rounded-2xl text-white">
                      <Zap className="w-6 h-6 fill-current" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Gen-AI Health</span>
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter leading-tight">Wellness Pulse</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-10 font-medium">
                  {results.length > 0 
                    ? "Based on your latest labs, we're tracking a positive trend in your lipid profile. Keep it up!"
                    : "Upload your first lab result to unlock personalized AI wellness insights and proactive health alerts."
                  }
                </p>
                <button className="w-full py-5 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-blue-50 transition-all shadow-xl shadow-white/5 active:scale-95">
                   View Full Analysis
                </button>
              </div>
           </section>

           <div className="p-10 bg-blue-50 dark:bg-blue-900/20 rounded-[3rem] border border-blue-100 dark:border-blue-800/30 transition-colors">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest px-2">Medical Network</h4>
                <UserCheck className="w-4 h-4 text-blue-400" />
              </div>
              
              <div className="space-y-4">
                {doctors.map((dr, i) => (
                  <div key={i} className="flex items-center gap-5 bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-blue-100 dark:border-blue-900/30 hover:scale-105 transition-transform cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
                      {dr.displayName?.[0] || 'D'}
                    </div>
                    <div>
                       <div className="text-base font-black text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{dr.displayName || 'Unnamed Dr.'}</div>
                       <div className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">{dr.specialty || 'Health Specialist'}</div>
                    </div>
                  </div>
                ))}
                
                {doctors.length === 0 && (
                  <p className="text-center text-xs font-bold text-gray-400 py-4 italic">No doctors available yet</p>
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
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50 dark:bg-gray-950 rounded-[3rem] p-6 sm:p-10 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedResult(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-10">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">{selectedResult.fileName}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{new Date(selectedResult.uploadDate?.toDate()).toLocaleDateString()}</div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    selectedResult.status === 'verified' ? "bg-emerald-500 text-white" : "bg-blue-100 text-blue-600"
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

