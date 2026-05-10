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
      const userList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      
      const counts = userList.reduce((acc, u) => {
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">ADMIN OPS</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-tight">Real-time system monitoring and user governance.</p>
          </div>
          
          <div className="flex p-1.5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all h-fit">
            <button 
              onClick={() => setView('admin')}
              className={cn(
                "flex items-center gap-3 px-8 py-3 rounded-[1.25rem] text-sm font-black uppercase tracking-widest transition-all",
                view === 'admin' ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Intelligence
            </button>
            <button 
              onClick={() => setView('patient')}
              className={cn(
                "flex items-center gap-3 px-8 py-3 rounded-[1.25rem] text-sm font-black uppercase tracking-widest transition-all",
                view === 'patient' ? "bg-rose-600 text-white shadow-xl shadow-rose-500/20" : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard icon={<Users className="w-6 h-6 text-blue-600" />} label="Total Assets" value={stats.total.toString()} trend="+2 today" />
                <StatCard icon={<Shield className="w-6 h-6 text-emerald-600" />} label="Medical Staff" value={stats.doctors.toString()} trend="Verified" />
                <StatCard icon={<Activity className="w-6 h-6 text-orange-600" />} label="Live Traffic" value="Active" trend="Real-time" />
                <StatCard icon={<Settings className="w-6 h-6 text-purple-600" />} label="Core System" value="v1.1" trend="Stable" />
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden transition-all">
                <div className="p-10 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter">Identity Registry</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Manage network participants and access tiers.</p>
                  </div>
                  <button className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">
                        <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-800">Entity</th>
                        <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-800">Access Tier</th>
                        <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-800">Health Status</th>
                        <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-800 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {users.map((u, i) => (
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          key={u.id} 
                          className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all"
                        >
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                              <div className="relative">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl uppercase shadow-sm group-hover:scale-110 transition-transform">
                                  {u.displayName?.[0] || u.email?.[0] || '?'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 bg-emerald-500 shadow-sm" />
                              </div>
                              <div>
                                <div className="text-base font-black text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{u.displayName || 'Anonymous'}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <select 
                              value={u.role || 'client'}
                              onChange={(e) => updateUserRole(u.id, e.target.value)}
                              className={cn(
                                "appearance-none bg-transparent font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest border transition-all cursor-pointer outline-none",
                                u.role === 'admin' ? "border-purple-200 text-purple-600 bg-purple-50/50" :
                                u.role === 'doctor' ? "border-blue-200 text-blue-600 bg-blue-50/50" :
                                "border-gray-200 text-gray-600 bg-gray-50/50"
                              )}
                            >
                              <option value="client">Patient</option>
                              <option value="doctor">Doctor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[92%]" />
                              </div>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optimal</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <button className="p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm">
                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PatientDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend?: string }) => (
  <div className="p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30 transition-all group">
    <div className="flex items-center justify-between mb-8">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">{icon}</div>
      {trend && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{trend}</span>}
    </div>
    <div className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter italic">{value}</div>
    <div className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{label}</div>
  </div>
);

export default AdminDashboard;
