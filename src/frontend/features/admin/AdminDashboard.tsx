import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { Users, Shield, Settings, Activity, LayoutGrid, HeartPulse, MoreHorizontal, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PatientDashboard from '../patient/PatientDashboard';
import { cn } from '../../utils/utils';
import { db } from '../../firebase/firebase';
import { collection, query, onSnapshot, doc, updateDoc, getCountFromServer } from 'firebase/firestore';

const AdminDashboard: React.FC = () => {
  const { user, roleData } = useAuth();
  const [view, setView] = useState<'admin' | 'patient'>('admin');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, doctors: 0, clients: 0 });

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const userList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setUsers(userList);
      
      const counts = userList.reduce((acc, u: any) => {
        if (u.role === 'doctor') acc.doctors++;
        else if (u.role === 'client') acc.clients++;
        acc.total++;
        return acc;
      }, { total: 0, doctors: 0, clients: 0 });
      setStats(counts);
    });

    return () => unsubscribe();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-500 relative overflow-hidden">
      {/* Immersive Background Atmos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-1 bg-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">System Command</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter italic leading-none">
              ADMIN <span className="text-blue-600">OPS</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-md leading-relaxed">
              Global intelligence oversight and clinical governance terminal. <span className="text-blue-500/50">Core Version 1.1.2</span>
            </p>
          </div>
          
          <div className="flex p-1.5 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl">
            <button 
              onClick={() => setView('admin')}
              className={cn(
                "flex items-center gap-3 px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500",
                view === 'admin' 
                  ? "bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)] scale-105" 
                  : "text-gray-500 hover:text-white"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Intelligence
            </button>
            <button 
              onClick={() => setView('patient')}
              className={cn(
                "flex items-center gap-3 px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500",
                view === 'patient' 
                  ? "bg-rose-600 text-white shadow-[0_0_40px_rgba(225,29,72,0.3)] scale-105" 
                  : "text-gray-500 hover:text-white"
              )}
            >
              <HeartPulse className="w-4 h-4" />
              Simulator
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard icon={<Users className="w-6 h-6" />} label="Total Nodes" value={stats.total.toString()} trend="+24% Capacity" color="blue" />
                <StatCard icon={<Shield className="w-6 h-6" />} label="Clinical verified" value={stats.doctors.toString()} trend="Operational" color="emerald" />
                <StatCard icon={<Activity className="w-6 h-6" />} label="Network Latency" value="12ms" trend="Optimal" color="orange" />
                <StatCard icon={<Settings className="w-6 h-6" />} label="System Kernel" value="Stable" trend="No Anomalies" color="purple" />
              </div>

              <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[4rem] border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden transition-all">
                <div className="p-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                      Identity Registry 
                      <span className="font-serif italic text-blue-500 opacity-50 text-xl font-normal lowercase">governance</span>
                    </h2>
                    <p className="text-gray-500 font-medium mt-2">Managing access hierarchy across decentralized nodes.</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-5 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-600/20 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest"
                  >
                    <UserPlus className="w-5 h-5" />
                    Provision Entity
                  </motion.button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">
                        <th className="px-12 py-8 border-b border-white/5">Entity (UID)</th>
                        <th className="px-12 py-8 border-b border-white/5">Access Tier</th>
                        <th className="px-12 py-8 border-b border-white/5">Bio-Status</th>
                        <th className="px-12 py-8 border-b border-white/5 text-right">Options</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u, i) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={u.id} 
                          className="group hover:bg-white/[0.03] transition-all"
                        >
                          <td className="px-12 py-10">
                            <div className="flex items-center gap-6">
                              <div className="relative">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-white font-black text-2xl uppercase group-hover:scale-110 transition-transform duration-500">
                                  {u.displayName?.[0] || u.email?.[0] || '?'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#050505] bg-emerald-500 group-hover:scale-125 transition-transform" />
                              </div>
                              <div>
                                <div className="text-xl font-black tracking-tight group-hover:text-blue-400 transition-colors">{u.displayName || 'Anonymous'}</div>
                                <div className="text-xs text-gray-500 font-mono mt-1 opacity-60 tracking-tighter">{u.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-12 py-10">
                            <div className="relative inline-block group/select">
                              <select 
                                value={u.role || 'client'}
                                onChange={(e) => updateUserRole(u.id, e.target.value)}
                                className={cn(
                                  "appearance-none bg-white/[0.03] font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-[0.2em] border border-white/10 transition-all cursor-pointer outline-none focus:ring-4 focus:ring-blue-500/20 pr-12",
                                  u.role === 'admin' ? "text-purple-400 border-purple-500/30" :
                                  u.role === 'doctor' ? "text-blue-400 border-blue-500/30" :
                                  "text-gray-400"
                                )}
                              >
                                <option value="client" className="bg-[#050505]">Patient Node</option>
                                <option value="doctor" className="bg-[#050505]">Clinical Node</option>
                                <option value="admin" className="bg-[#050505]">Superuser</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <Shield className="w-3 h-3" />
                              </div>
                            </div>
                          </td>
                          <td className="px-12 py-10">
                            <div className="flex items-center gap-4">
                              <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '92%' }}
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                />
                              </div>
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse italic">Optimal</span>
                            </div>
                          </td>
                          <td className="px-12 py-10 text-right">
                             <button className="p-4 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10 text-gray-500 hover:text-white">
                                <MoreHorizontal className="w-5 h-5" />
                             </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="patient"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/5 p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8 px-4 text-rose-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest italic font-serif">Simulating asset perspective...</span>
              </div>
              <PatientDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string, trend?: string, color: string }) => {
  const colorMap: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 shadow-xl hover:shadow-[0_0_50px_rgba(59,130,246,0.1)] hover:border-white/10 transition-all group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-colors" />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className={cn("p-5 rounded-2xl transition-all shadow-lg", colorMap[color])}>
          {icon}
        </div>
        {trend && (
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Status</span>
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">{trend}</span>
          </div>
        )}
      </div>
      <div className="text-5xl font-black text-white mb-3 tracking-tighter italic leading-none group-hover:translate-x-1 transition-transform">{value}</div>
      <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">{label}</div>
    </div>
  );
};

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default AdminDashboard;
