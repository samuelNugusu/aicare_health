import React, { useState } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { Users, Shield, Settings, Activity, LayoutGrid, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PatientDashboard from '../patient/PatientDashboard';
import { cn } from '../../utils/utils';

const AdminDashboard: React.FC = () => {
  const { user, roleData } = useAuth();
  const [view, setView] = useState<'admin' | 'patient'>('admin');

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Control Center</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Manage users, roles, and system integrity for the AiCare platform.</p>
          </div>
          
          <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => setView('admin')}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                view === 'admin' ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Admin Panel
            </button>
            <button 
              onClick={() => setView('patient')}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                view === 'patient' ? "bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 shadow-sm" : "text-gray-500"
              )}
            >
              <HeartPulse className="w-4 h-4" />
              Patient View
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="grid md:grid-cols-4 gap-6">
                <StatCard icon={<Users className="w-6 h-6 text-blue-600" />} label="Total Users" value="1,284" />
                <StatCard icon={<Shield className="w-6 h-6 text-purple-600" />} label="Doctors" value="42" />
                <StatCard icon={<Activity className="w-6 h-6 text-green-600" />} label="Active Sessions" value="18" />
                <StatCard icon={<Settings className="w-6 h-6 text-gray-600" />} label="System Health" value="Optimal" />
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                  <h2 className="text-xl font-bold dark:text-white">User Management</h2>
                  <button className="text-sm font-bold text-blue-600 dark:text-blue-400">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-bold">User</th>
                        <th className="px-6 py-4 font-bold">Role</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {[
                        { name: "Dr. Sarah Smith", role: "doctor", status: "verified", email: "sarah@example.com" },
                        { name: "John Doe", role: "client", status: "active", email: "john@example.com" },
                        { name: "Alice Brown", role: "admin", status: "verified", email: "alice@example.com" }
                      ].map((u, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                                {u.name[0]}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{u.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 
                              u.role === 'doctor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
                              'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{u.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="patient"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PatientDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
    <div className="text-sm text-gray-400 dark:text-gray-500 font-medium">{label}</div>
  </div>
);

export default AdminDashboard;
