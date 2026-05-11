import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { 
  Users, Shield, Settings, Activity, LayoutGrid, HeartPulse, 
  MoreHorizontal, UserPlus, Trash2, X, BarChart3, PieChartIcon, 
  AlertCircle, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PatientDashboard from '../patient/PatientDashboard';
import { cn } from '../../utils/utils';
import { db } from '../../firebase/firebase';
import { 
  collection, query, onSnapshot, doc, updateDoc, 
  deleteDoc, setDoc, collectionGroup, orderBy 
} from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'admin' | 'patient'>('admin');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, doctors: 0, patients: 0 });
  const [diagnosisStats, setDiagnosisStats] = useState({ completed: 0, verified: 0, failed: 0, total: 0 });
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', displayName: '', role: 'client' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(q, (snap) => {
      const userList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setUsers(userList);
      
      const counts = userList.reduce((acc, u: any) => {
        if (u.role === 'doctor') acc.doctors++;
        else if (u.role === 'client') acc.patients++;
        acc.total++;
        return acc;
      }, { total: 0, doctors: 0, patients: 0 });
      setStats(counts);
    }, (error) => {
      console.error("Admin Users Fetch Error:", error);
    });

    const labQ = query(collectionGroup(db, 'lab_results'));
    const unsubscribeLabs = onSnapshot(labQ, (snap) => {
      const labCounts = snap.docs.reduce((acc, doc) => {
        const status = doc.data().status;
        if (status === 'completed') acc.completed++;
        else if (status === 'verified') acc.verified++;
        else if (status === 'failed' || status === 'error') acc.failed++;
        acc.total++;
        return acc;
      }, { completed: 0, verified: 0, failed: 0, total: 0 });
      setDiagnosisStats(labCounts);
    }, (error) => {
      console.warn("Admin Labs CollectionGroup Error (check indexes):", error);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLabs();
    };
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user from the registry?")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.displayName) return;
    const uid = `p_${Math.random().toString(36).substr(2, 9)}`;
    try {
      await setDoc(doc(db, 'users', uid), {
        ...newUser,
        createdAt: new Date().toISOString()
      });
      setShowProvisionModal(false);
      setNewUser({ email: '', displayName: '', role: 'client' });
    } catch (err) {
      console.error("Provisioning failed:", err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = [
    { name: 'Verified', value: diagnosisStats.verified, color: '#10b981' },
    { name: 'Pending', value: diagnosisStats.completed, color: '#3b82f6' },
    { name: 'Failed', value: diagnosisStats.failed, color: '#ef4444' },
  ];

  const userDistribution = [
    { name: 'Patients', value: stats.patients, color: '#3b82f6' },
    { name: 'Doctors', value: stats.doctors, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white transition-colors duration-500 relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Atmos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <header className="mb-12 sm:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 sm:w-12 h-1 bg-blue-600" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">System Command</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter italic leading-none">
              ADMIN <span className="text-blue-600">OPS</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium max-w-md leading-relaxed">
              Global intelligence oversight and clinical governance terminal.
            </p>
          </div>
          
          <div className="flex p-1 bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-2xl">
            <button 
              onClick={() => setView('admin')}
              className={cn(
                "flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
                view === 'admin' ? "bg-blue-600 text-white shadow-xl scale-105" : "text-gray-500 hover:text-white"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Intelligence
            </button>
            <button 
              onClick={() => setView('patient')}
              className={cn(
                "flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
                view === 'patient' ? "bg-rose-600 text-white shadow-xl scale-105" : "text-gray-500 hover:text-white"
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
              className="space-y-12 sm:space-y-16"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                <StatCard icon={Users} label="Total Assets" value={stats.total.toString()} trend="Active Nodes" color="blue" />
                <StatCard icon={Shield} label="Clinical Staff" value={stats.doctors.toString()} trend="Verified" color="emerald" />
                <StatCard icon={Activity} label="Clinical Records" value={diagnosisStats.verified.toString()} trend="Finalized" color="purple" />
                <StatCard icon={Settings} label="Task Queue" value={diagnosisStats.completed.toString()} trend="Processing" color="blue" />
                <StatCard icon={AlertCircle} label="System Alerts" value={diagnosisStats.failed.toString()} trend="High Priority" color="orange" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/5 p-8 sm:p-12 shadow-2xl overflow-hidden relative group">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    Diagnosis Performance
                  </h3>
                  <div className="h-64 sm:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '1rem', fontSize: '10px' }} />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/5 p-8 sm:p-12 shadow-2xl overflow-hidden relative group">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-purple-500" />
                    User Distribution
                  </h3>
                  <div className="h-64 sm:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userDistribution}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={10}
                          dataKey="value"
                        >
                          {userDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '1rem', fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] sm:rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden">
                <div className="p-8 sm:p-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tighter italic uppercase">Identity <span className="text-blue-500">Registry</span></h2>
                    <p className="text-sm text-gray-500 mt-2">Managing healthcare entities across the decentralized spectrum.</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <input 
                      type="text" 
                      placeholder="SEARCH..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-2xl px-6 text-xs font-black uppercase tracking-widest focus:border-blue-500 outline-none"
                    />
                    <button 
                      onClick={() => setShowProvisionModal(true)}
                      className="p-4 sm:p-5 bg-blue-600 text-white rounded-2xl shadow-xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest"
                    >
                      <UserPlus className="w-5 h-5" />
                      Provision
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                        <th className="px-12 py-8">Entity Identity</th>
                        <th className="px-12 py-8">Classification</th>
                        <th className="px-12 py-8">Status</th>
                        <th className="px-12 py-8 text-right">Registry Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((u, i) => (
                        <motion.tr 
                          key={u.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-12 py-10">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xl font-black italic shadow-inner">
                                {u.displayName?.[0] || '?'}
                              </div>
                              <div>
                                <div className="text-lg font-black tracking-tight">{u.displayName || 'Anonymous Node'}</div>
                                <div className="text-[10px] font-mono text-gray-500">{u.email || u.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-12 py-10">
                             <select 
                               value={u.role || 'client'}
                               onChange={(e) => updateUserRole(u.id, e.target.value)}
                               className={cn(
                                 "appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none transition-all",
                                 u.role === 'admin' ? "text-blue-400 border-blue-500/30" : "text-gray-400"
                               )}
                             >
                               <option value="client" className="bg-[#050505]">Patient Node</option>
                               <option value="doctor" className="bg-[#050505]">Clinical Hub</option>
                               <option value="admin" className="bg-[#050505]">System Overlord</option>
                             </select>
                          </td>
                          <td className="px-12 py-10">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] font-black uppercase italic text-emerald-500">Live</span>
                            </div>
                          </td>
                          <td className="px-12 py-10 text-right">
                            <button 
                              onClick={() => deleteUser(u.id)}
                              className="p-4 hover:bg-rose-500/10 text-gray-600 hover:text-rose-500 rounded-xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/5 p-8 shadow-2xl"
            >
               <PatientDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showProvisionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowProvisionModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0a0a0a] border border-white/10 rounded-[4rem] p-12 w-full max-w-xl shadow-[0_0_100px_rgba(37,99,235,0.2)]"
            >
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-10">Provision <span className="text-blue-600">Entity</span></h2>
              <form onSubmit={handleProvision} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Full Identity Name</label>
                  <input required value={newUser.displayName} onChange={(e) => setNewUser({...newUser, displayName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-black uppercase tracking-widest focus:border-blue-500 outline-none" placeholder="e.g. ARIS THORNE" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Communication Bridge (Email)</label>
                  <input required type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-black uppercase tracking-widest focus:border-blue-500 outline-none" placeholder="USER@INTERNAL.COM" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Access Tier</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['client', 'doctor'].map((r) => (
                      <button key={r} type="button" onClick={() => setNewUser({...newUser, role: r})} className={cn("p-6 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all", newUser.role === r ? "bg-blue-600 text-white" : "bg-white/5 border-white/10 text-gray-500")}>
                        {r === 'client' ? 'Patient Node' : 'Clinical Node'}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-8 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
                  Commit Registry Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, color }: { icon: any, label: string, value: string, trend: string, color: string }) => {
  const colors: any = {
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/10',
    emerald: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10',
    purple: 'text-purple-500 border-purple-500/20 bg-purple-500/10',
    orange: 'text-orange-500 border-orange-500/20 bg-orange-500/10',
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 group hover:bg-white/[0.04] transition-all">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-10 border transition-all group-hover:scale-110", colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</div>
      <div className="text-4xl font-black italic tracking-tighter mb-4">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">{trend}</div>
    </div>
  );
};

export default AdminDashboard;
