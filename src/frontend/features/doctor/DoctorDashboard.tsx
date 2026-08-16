import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { collection, query, onSnapshot, where, limit, orderBy, collectionGroup } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Search, Clipboard, Calendar, MessageSquare, ExternalLink, Activity, Users, AlertCircle, ChevronRight, HeartPulse, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
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
        console.warn("Doctor Labs CollectionGroup Error:", error);
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
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-all pb-12">
        <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6">
           <button 
            onClick={() => setSelectedPatientId(null)}
            className="mb-6 flex items-center gap-2 text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:-translate-x-1 transition-transform"
           >
            ← Back to Physician Command
           </button>
           <PatientDashboard patientId={selectedPatientId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300 pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              Physician Diagnostic Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Clinical <span className="text-blue-600">Operations</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
              Real-time patient monitoring and diagnostic governance terminal.
            </p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30 shadow-sm transition-all dark:text-white"
            />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <DocStat icon={<Users className="w-4 h-4" />} label="Patient Load" value={stats.active.toString()} color="blue" />
          <DocStat icon={<Activity className="w-4 h-4" />} label="Verified" value={stats.verified.toString()} color="emerald" />
          <DocStat icon={<Clipboard className="w-4 h-4" />} label="Active Queue" value={stats.completed.toString()} color="blue" />
          <DocStat icon={<AlertCircle className="w-4 h-4" />} label="Failed" value={stats.failed.toString()} color="orange" />
          <DocStat icon={<Clipboard className="w-4 h-4" />} label="Total Diags" value={stats.performed.toString()} color="purple" />
          <DocStat icon={<HeartPulse className="w-4 h-4" />} label="Helped" value={stats.helped.toString()} color="emerald" />
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
           <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
               <BarChart3 className="w-4 h-4 text-blue-500" />
               Performance Metrics
             </h3>
             <div className="h-48 sm:h-60 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#88888815" vertical={false} />
                   <XAxis dataKey="name" stroke="#88888880" fontSize={11} fontWeight="600" tickLine={false} axisLine={false} />
                   <YAxis stroke="#88888880" fontSize={11} fontWeight="600" tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '10px', fontSize: '11px' }}
                   />
                   <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
               <PieChartIcon className="w-4 h-4 text-purple-500" />
               Success Rate Distribution
             </h3>
             <div className="h-48 sm:h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '10px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* Directory and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                Patient Registry
              </h3>
              <div className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider border border-blue-100 dark:border-blue-800/30">
                Active Patients
              </div>
            </div>
            
            <div className="space-y-2.5">
              {filteredPatients.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  key={p.id} 
                  onClick={() => setSelectedPatientId(p.id)}
                  className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/40 transition-all flex items-center justify-between gap-4 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner overflow-hidden border border-gray-100 dark:border-gray-700">
                        {p.photoURL ? <img src={p.photoURL} alt="" className="w-full h-full object-cover" /> : <Clipboard className="w-5 h-5" />}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 bg-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.displayName || 'Anonymous'}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-mono truncate mt-0.5">{p.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider leading-none mb-0.5">Status</span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Optimal</span>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredPatients.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-gray-400 font-medium text-xs">No matching patients found</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white px-1">
              Priority Alerts
            </h3>
            
            <div className="p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 relative overflow-hidden">
               <div className="flex items-start gap-3.5 relative z-10">
                  <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="text-red-600 w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">Immediate Review</div>
                    <p className="text-xs sm:text-sm font-medium text-red-950 dark:text-red-200 leading-snug">
                      Critical blood marker variations detected in recent intake.
                    </p>
                  </div>
               </div>
            </div>

            <div className="p-5 sm:p-6 bg-gray-900 rounded-2xl text-white space-y-3 shadow-lg">
               <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-600 rounded-xl">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Clinical Schedule</span>
               </div>
               <h4 className="text-sm sm:text-base font-bold">Next Sync: 14:00 Today</h4>
               <p className="text-xs text-gray-400">Virtual diagnostic reviews for cardiac and metabolic patients.</p>
               <button className="w-full py-2.5 bg-white/10 hover:bg-white hover:text-black border border-white/10 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all">
                  Access Portal
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
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm group hover:shadow-md transition-all">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 shadow-sm ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-0.5">{value}</div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
};

export default DoctorDashboard;
