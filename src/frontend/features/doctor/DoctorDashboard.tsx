import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { collection, query, onSnapshot, where, limit, orderBy, collectionGroup } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Search, Clipboard, Calendar, MessageSquare, ExternalLink, Activity, Users, AlertCircle, ChevronRight, HeartPulse, BarChart3, PieChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PatientDashboard from '../patient/PatientDashboard';
import { cn } from '../../utils/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [stats, setStats] = useState({ active: 0, performed: 0, verified: 0, failed: 0, completed: 0, helped: 0 });

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'client'), limit(20));
    const unsubscribePatients = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(list);
      setStats(s => ({ ...s, active: list.length }));
    });

    if (user?.uid) {
      const labQ = query(collectionGroup(db, 'lab_results'), where('performedBy', '==', user.uid));
      const unsubscribeLabs = onSnapshot(labQ, (snap) => {
        const labs = snap.docs.map(d => {
          const data = d.data();
          return { ...data, status: data.status, userId: d.ref.parent.parent?.id };
        });
        const helpedIds = new Set(labs.map(l => l.userId).filter(Boolean));
        setStats(s => ({
          ...s,
          performed: labs.length,
          verified: labs.filter((l: any) => l.status === 'verified').length,
          completed: labs.filter((l: any) => l.status === 'completed').length,
          failed: labs.filter((l: any) => l.status === 'failed' || l.status === 'error').length,
          helped: helpedIds.size
        }));
      }, (error) => {
        console.warn("Doctor Labs CollectionGroup Error (check indexes):", error);
      });
      return () => {
        unsubscribePatients();
        unsubscribeLabs();
      };
    }

    return () => unsubscribePatients();
  }, [user?.uid]);

  const chartData = [
    { name: 'Verified', value: stats.verified },
    { name: 'Queue', value: stats.completed },
    { name: 'Anomalies', value: stats.failed },
  ];

  const distributionData = [
    { name: 'Completed', value: stats.performed - stats.failed },
    { name: 'Errors', value: stats.failed },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981'];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-12 sm:mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8 sm:gap-10 px-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">CLINICAL <span className="text-blue-600">OPS</span></h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-tight text-sm sm:text-base">Active patient monitoring and diagnostic review.</p>
          </div>
          
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-4 sm:py-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-[2rem] text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-sm transition-all dark:text-white"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <DocStat icon={<Users className="w-5 h-5" />} label="Patient Load" value={stats.active.toString()} color="blue" />
          <DocStat icon={<Activity className="w-5 h-5" />} label="Verified" value={stats.verified.toString()} color="emerald" />
          <DocStat icon={<Clipboard className="w-5 h-5" />} label="Active Queue" value={stats.completed.toString()} color="blue" />
          <DocStat icon={<AlertCircle className="w-5 h-5" />} label="Failed" value={stats.failed.toString()} color="orange" />
          <DocStat icon={<Clipboard className="w-5 h-5" />} label="Total Diags" value={stats.performed.toString()} color="purple" />
          <DocStat icon={<HeartPulse className="w-5 h-5" />} label="Helped" value={stats.helped.toString()} color="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
           <div className="bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
               <BarChart3 className="w-4 h-4 text-blue-500" />
               Performance Metrics
             </h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                   <XAxis dataKey="name" stroke="#88888880" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                   <YAxis stroke="#88888880" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '1rem', fontSize: '10px' }}
                   />
                   <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
               <PieChartIcon className="w-4 h-4 text-purple-500" />
               Success Rate Distribution
             </h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '1rem', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="lg:col-span-2 space-y-8 sm:space-y-10">
            <div className="flex items-center justify-between px-4">
              <h3 className="font-black text-xl sm:text-2xl text-gray-900 dark:text-white tracking-tighter uppercase whitespace-nowrap">Registry</h3>
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-800/30">
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
                  className="p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group cursor-pointer"
                >
                  <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.25rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner overflow-hidden border border-gray-100 dark:border-gray-700">
                        {p.photoURL ? <img src={p.photoURL} alt="" className="w-full h-full object-cover" /> : <Clipboard className="w-6 h-6 sm:w-7 sm:h-7" />}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white dark:border-gray-900 bg-emerald-500" />
                    </div>
                    <div className="truncate flex-1">
                      <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight truncate">{p.displayName || 'Anonymous'}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5 truncate">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-50 sm:border-0 dark:border-gray-800">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-500 italic uppercase">Optimal</span>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
    <div className="p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm group hover:scale-[1.02] transition-all">
      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg ${colors[color]}`}>
        <div className="scale-75 sm:scale-100">{icon}</div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white italic tracking-tighter mb-1 uppercase">{value}</div>
      <div className="text-[8px] sm:text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</div>
    </div>
  );
};

export default DoctorDashboard;
