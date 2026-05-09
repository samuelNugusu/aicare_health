import React from 'react';
import { useAuth } from '../firebase/AuthProvider';
import { Loader2 } from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">
           Authenticating with AiCare Cloud...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
