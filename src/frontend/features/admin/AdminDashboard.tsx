import React from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { Users, Shield, Settings, Activity } from 'lucide-react';
import { motion } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const { user, roleData } = useAuth();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
        <p className="text-gray-500 mt-2">Manage users, roles, and system integrity.</p>
      </header>

      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Users className="w-6 h-6 text-blue-600" />} label="Total Users" value="1,284" />
        <StatCard icon={<Shield className="w-6 h-6 text-purple-600" />} label="Doctors" value="42" />
        <StatCard icon={<Activity className="w-6 h-6 text-green-600" />} label="Active Sessions" value="18" />
        <StatCard icon={<Settings className="w-6 h-6 text-gray-600" />} label="System Health" value="Optimal" />
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-bottom border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold">User Management</h2>
          <button className="text-sm font-bold text-blue-600">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: "Dr. Sarah Smith", role: "doctor", status: "verified", email: "sarah@example.com" },
                { name: "John Doe", role: "client", status: "active", email: "john@example.com" },
                { name: "Alice Brown", role: "admin", status: "verified", email: "alice@example.com" }
              ].map((u, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      u.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">{u.status}</span>
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
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gray-50 rounded-2xl">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-400 font-medium">{label}</div>
  </div>
);

export default AdminDashboard;
