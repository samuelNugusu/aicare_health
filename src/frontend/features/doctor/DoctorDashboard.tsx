import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { collection, query, onSnapshot, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Search, Clipboard, Calendar, MessageSquare, ExternalLink, Activity, Users, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PatientDashboard from '../patient/PatientDashboard';
import { cn } from '../../utils/utils';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [stats, setStats] = useState({ active: 0, pending: 0 });

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'client'), limit(20));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(list);
      setStats({ active: list.length, pending: 2 });
    });
    return () => unsubscribe();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedPatientId) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-all">
        <div className="max-w-7xl mx-auto py-8">
           <button 
            onClick={() => setSelectedPatientId(null)}
            className="mb-8 ml-8 flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:-translate-x-1 transition-transform"
           >
            ← Physician Dashboard
           </button>
           <PatientDashboard patientId={selectedPatientId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-10 px-2">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">CLINICAL OPS</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-tight">Active patient monitoring and diagnostic review.</p>
          </div>
          
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by identity or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-sm transition-all dark:text-white"
            />
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <DocStat icon={<Users className="w-6 h-6" />} label="Patient Load" value={stats.active.toString()} color="blue" />
          <DocStat icon={<Activity className="w-6 h-6" />} label="System Sync" value="Live" color="emerald" />
          <DocStat icon={<Clipboard className="w-6 h-6" />} label="Reports" value="14" color="orange" />
          <DocStat icon={<AlertCircle className="w-6 h-6" />} label="Anomalies" value={stats.pending.toString()} color="red" />
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between px-4">
              <h3 className="font-black text-2xl text-gray-900 dark:text-white tracking-tighter uppercase">Registry</h3>
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-800/30">
                Sorted by Activity
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredPatients.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={p.id} 
                  onClick={() => setSelectedPatientId(p.id)}
                  className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner overflow-hidden border border-gray-100 dark:border-gray-700">
                        {p.photoURL ? <img src={p.photoURL} alt="" className="w-full h-full object-cover" /> : <Clipboard className="w-7 h-7" />}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 bg-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">{p.displayName || 'Anonymous'}</h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</span>
                      <span className="text-sm font-black text-emerald-500 italic">OPTIMAL</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/30 rounded-[3rem] border-4 border-dotted border-gray-200 dark:border-gray-800">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No matching assets found</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-10">
            <h3 className="font-black text-2xl text-gray-900 dark:text-white tracking-tighter uppercase px-4">Priority Alerts</h3>
            <div className="p-10 bg-red-50 dark:bg-red-900/10 rounded-[3rem] border border-red-100 dark:border-red-900/30 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 blur-3xl animate-pulse" />
               <div className="flex items-start gap-6 relative z-10">
                  <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="text-red-600 w-7 h-7" />
                  </div>
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-red-600 uppercase tracking-widest">Immediate Review Required</div>
                    <p className="text-sm font-black text-red-950 dark:text-red-200 leading-snug tracking-tight">
                      System detected critical highs in Glucometrics for asset "John Doe".
                    </p>
                    <button className="text-xs font-black text-red-600 dark:text-red-400 hover:tracking-[0.2em] transition-all uppercase tracking-widest">Calibrate Action →</button>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-gray-900 rounded-[3rem] text-white space-y-6 shadow-2xl">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Clinical Schedule</span>
               </div>
               <h4 className="text-xl font-bold italic tracking-tighter">Next Sync: 14:00 Today</h4>
               <p className="text-sm text-gray-400 font-medium">Virtual rounds for cardiac patients are scheduled in 2 hours.</p>
               <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  Join Room
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocStat = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => {
  const colors: any = {
    blue: 'bg-blue-600 text-white',
    purple: 'bg-purple-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    orange: 'bg-orange-600 text-white',
    red: 'bg-red-600 text-white'
  };
  return (
    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm group hover:scale-[1.02] transition-all">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-gray-900 dark:text-white italic tracking-tighter mb-1 uppercase">{value}</div>
      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</div>
    </div>
  );
};

export default DoctorDashboard;
