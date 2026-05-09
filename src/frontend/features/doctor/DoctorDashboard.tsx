import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Search, Clipboard, Calendar, MessageSquare, ExternalLink } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      // For this demo, we'll fetch all 'client' users
      const q = query(collection(db, 'users'), where('role', '==', 'client'));
      const snap = await getDocs(q);
      setPatients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Physician Portal</h1>
          <p className="text-gray-500 mt-2">Manage patient diagnostics and review lab submissions.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full md:w-80 transition-all"
          />
        </div>
      </header>

      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <DocStat icon={<Clipboard className="w-5 h-5" />} label="Recent Reports" value="12" color="blue" />
        <DocStat icon={<Calendar className="w-5 h-5" />} label="Avg. Response" value="4h" color="purple" />
        <DocStat icon={<MessageSquare className="w-5 h-5" />} label="Active Consults" value="5" color="green" />
        <DocStat icon={<Clipboard className="w-5 h-5" />} label="Pending Review" value="3" color="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-xl text-gray-900 px-2">Assigned Patients</h3>
          <div className="space-y-4">
            {filteredPatients.map((p, i) => (
              <div key={i} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    {p.photoURL ? <img src={p.photoURL} alt="" className="w-full h-full rounded-2xl object-cover" /> : <Clipboard className="w-6 h-6 outline-none" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{p.displayName || 'Anonymous Patient'}</h4>
                    <p className="text-sm text-gray-500">{p.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wide">Stable</span>
                  <button className="p-2 text-gray-300 group-hover:text-blue-600 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredPatients.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-medium">No patients found</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-xl text-gray-900 px-2">Critical Alerts</h3>
          <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clipboard className="text-red-600 w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-red-600 uppercase tracking-widest">Immediate Review</div>
                <p className="text-sm text-red-900 font-medium leading-relaxed">
                  John Doe submitted a lab result with critical high values in Glucose monitoring.
                </p>
                <button className="text-xs font-black text-red-600 hover:underline">OPEN REPORT</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocStat = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  return (
    <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-400 font-medium mt-1">{label}</div>
    </div>
  );
};

export default DoctorDashboard;
