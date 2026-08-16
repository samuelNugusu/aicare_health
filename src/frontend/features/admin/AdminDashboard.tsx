import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { 
  Users, Shield, Settings, Activity, LayoutGrid, HeartPulse, 
  MoreHorizontal, UserPlus, Trash2, X, BarChart3, PieChart as PieChartIcon, 
  AlertCircle, ShieldCheck, ChevronRight, Search, TrendingUp, CheckCircle2 
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
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

interface UserData {
  id: string;
  displayName: string;
  name?: string;
  email: string;
  role: 'doctor' | 'client' | 'admin';
  createdAt?: any;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'admin' | 'patient'>('admin');
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({ total: 0, doctors: 0, clients: 0 });
  const [diagnosisStats, setDiagnosisStats] = useState({ completed: 0, verified: 0, failed: 0, total: 0 });
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'client' as 'doctor' | 'client' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(q, (snap) => {
      const userList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
      setUsers(userList);
      
      const counts = userList.reduce((acc, u) => {
        if (u.role === 'doctor') acc.doctors++;
        else if (u.role === 'client') acc.clients++;
        acc.total++;
        return acc;
      }, { total: 0, doctors: 0, clients: 0 });
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
      console.warn("Admin Labs Snapshot Error:", error);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLabs();
    };
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to terminate this entity's access?")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.name) return;
    const tempUid = `id_${Date.now()}`;
    try {
      await setDoc(doc(db, 'users', tempUid), {
        ...newUser,
        displayName: newUser.name,
        createdAt: new Date().toISOString()
      });
      setShowProvisionModal(false);
      setNewUser({ email: '', name: '', role: 'client' });
    } catch (err) {
      console.error("Provisioning failed:", err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = [
    { name: 'Verified', value: diagnosisStats.verified, color: '#10B981' },
    { name: 'Pending', value: diagnosisStats.completed, color: '#3B82F6' },
    { name: 'Failed', value: diagnosisStats.failed, color: '#F43F5E' },
  ];

  const pieData = [
    { name: 'Patients', value: stats.clients, color: '#3B82F6' },
    { name: 'Doctors', value: stats.doctors, color: '#10B981' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600/30 overflow-x-hidden font-sans pb-16">
      {/* Background Atmos */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-[350px] sm:h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent" />
        <div className="absolute top-1/4 -right-20 w-64 sm:w-96 h-64 sm:h-96 bg-purple-600/10 blur-[100px] sm:blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -left-20 w-64 sm:w-96 h-64 sm:h-96 bg-blue-600/10 blur-[100px] sm:blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-semibold tracking-wider text-xs uppercase mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Core Infrastructure Management
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Control <span className="text-blue-500">Terminal</span>
            </h1>
          </div>

          <nav className="flex items-center self-start sm:self-auto gap-1.5 p-1 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 w-full sm:w-auto">
            <button 
              onClick={() => setView('admin')}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-semibold uppercase tracking-wider transition-all",
                view === 'admin' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-gray-400 hover:text-white"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Intelligence
            </button>
            <button 
              onClick={() => setView('patient')}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-semibold uppercase tracking-wider transition-all",
                view === 'patient' ? "bg-rose-600 text-white shadow-md shadow-rose-600/20" : "text-gray-400 hover:text-white"
              )}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              Simulate View
            </button>
          </nav>
        </header>

        <AnimatePresence mode="wait">
          {view === 'admin' ? (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Real-time Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard icon={<Users />} label="Nodes" value={stats.total.toString()} sub="Global Registry" color="blue" />
                <StatCard icon={<Shield />} label="Clinical" value={stats.doctors.toString()} sub="Verified Medics" color="emerald" />
                <StatCard icon={<Activity />} label="Diagnostics" value={diagnosisStats.total.toString()} sub="Total Events" color="purple" />
                <StatCard icon={<TrendingUp />} label="Efficacy" value={`${Math.round((diagnosisStats.verified / (diagnosisStats.total || 1)) * 100)}%`} sub="Verified Rate" color="blue" />
              </div>

              {/* Visual Intelligence Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      Diagnostics Activity
                    </h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Stream
                    </span>
                  </div>
                  <div className="h-48 sm:h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff50" fontSize={11} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff50" fontSize={11} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff15', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                        />
                        <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-purple-400" />
                    Registry Breakdown
                  </h3>
                  <div className="h-44 sm:h-52 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={48}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff15', borderRadius: '10px', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                      <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Total Nodes</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-gray-400">{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Registry Management */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight">Entity Registry</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Control access tiers and permissions.</p>
                  </div>
                  
                  <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-60">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input 
                        type="text"
                        placeholder="Scan directory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-500"
                      />
                    </div>
                    
                    <button 
                      onClick={() => setShowProvisionModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md active:scale-95 flex-shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Provision Node
                    </button>
                  </div>
                </div>

                {/* Desktop/Tablet Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-white/[0.01]">
                        <th className="px-5 py-3.5">Identity Profile</th>
                        <th className="px-5 py-3.5">Access Classification</th>
                        <th className="px-5 py-3.5">Internal ID</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((u, i) => (
                        <tr 
                          key={u.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                                {(u.displayName || u.name)?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-semibold truncate max-w-[200px]">
                                  {u.displayName || u.name || 'External Node'}
                                </div>
                                <div className="text-xs font-mono text-gray-500 truncate max-w-[200px]">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <select 
                              value={u.role || 'client'}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className={cn(
                                "appearance-none bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer outline-none hover:border-blue-500/50 transition-all",
                                u.role === 'admin' ? "text-amber-400" :
                                u.role === 'doctor' ? "text-emerald-400" :
                                "text-blue-400"
                              )}
                            >
                              <option value="client" className="bg-[#0a0a0a]">Patient Node</option>
                              <option value="doctor" className="bg-[#0a0a0a]">Clinical Staff</option>
                              <option value="admin" className="bg-[#0a0a0a]">Global Admin</option>
                            </select>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-gray-500 truncate max-w-[120px]">{u.id}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 rounded-lg transition-all"
                              title="Terminate Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                            {(u.displayName || u.name)?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">
                              {u.displayName || u.name || 'External Node'}
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 truncate">{u.email}</div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Tier</span>
                        <select 
                          value={u.role || 'client'}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-semibold text-blue-400 outline-none"
                        >
                          <option value="client" className="bg-[#0a0a0a]">Patient</option>
                          <option value="doctor" className="bg-[#0a0a0a]">Doctor</option>
                          <option value="admin" className="bg-[#0a0a0a]">Admin</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-xs text-gray-500">
                      No entities found
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="patient-simulation"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-rose-500 font-semibold uppercase tracking-wider text-xs px-1">
                <AlertCircle className="w-4 h-4" />
                Simulating Patient Perspective
              </div>
              <div className="bg-[#080808] rounded-2xl border border-white/10 overflow-hidden">
                <PatientDashboard />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Provision Modal */}
      <AnimatePresence>
        {showProvisionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProvisionModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowProvisionModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">Provision <span className="text-blue-500">Node</span></h3>
                <p className="text-gray-400 text-xs">Register entity to internal directory</p>
              </div>

              <form onSubmit={handleProvision} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 ml-1">Identity Name</label>
                  <input 
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                  <input 
                    required
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@internal.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 ml-1">Access Hierarchy</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['client', 'doctor'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setNewUser({...newUser, role})}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all",
                          newUser.role === role 
                            ? "bg-blue-600 border-blue-500 text-white shadow-md" 
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-blue-500/30"
                        )}
                      >
                        {role === 'doctor' ? 'Clinical Staff' : 'Patient Node'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-white text-black rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                  >
                    Commit Node Entry
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, color }: { icon: any, label: string, value: string, sub: string, color: 'blue' | 'emerald' | 'purple' }) => {
  const colors = {
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    emerald: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    purple: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 group hover:bg-white/[0.05] transition-all relative overflow-hidden">
      <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 border transition-all", colors[color])}>
        {React.cloneElement(icon, { className: 'w-4 h-4 sm:w-4.5 sm:h-4.5' })}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">{label}</div>
      <div className="text-xl sm:text-2xl font-bold tracking-tight mb-0.5">{value}</div>
      <div className="text-[10px] text-gray-500">{sub}</div>
    </div>
  );
};

export default AdminDashboard;

