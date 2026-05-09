import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Activity, Clock, FileText, ChevronRight } from 'lucide-react';
import LabUpload from '../lab/LabUpload';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/lab_results`),
      orderBy('uploadDate', 'desc')
    );
    return onSnapshot(q, (snap) => {
      setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Health Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Welcome back, {user?.displayName?.split(' ')[0]}. Here is your latest data.</p>
        </div>
        <div className="flex gap-4">
           {/* Summary Cards */}
           <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-2xl border border-blue-100 dark:border-blue-800/30 min-w-[200px]">
              <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-widest mb-1">BMI Status</div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-100">22.4 (Normal)</div>
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-bold dark:text-white">Recent Lab Results</h2>
              <button className="text-sm font-bold text-blue-600 dark:text-blue-400">View History</button>
            </div>
            
            <div className="space-y-4">
              {results.map((res, i) => (
                <div key={i} className="group p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase font-bold text-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{res.fileName}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(res.uploadDate?.toDate()).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className="font-medium text-green-600 dark:text-green-400 capitalize">{res.status}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                </div>
              ))}
              
              {results.length === 0 && (
                <div className="py-12 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-center">
                   <p className="text-gray-400 dark:text-gray-600 font-medium italic">No results uploaded yet</p>
                </div>
              )}
            </div>
          </section>

          <section>
             <LabUpload />
          </section>
        </div>

        <div className="space-y-10">
           <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 blur-[60px] opacity-20" />
              <div className="relative z-10">
                <Activity className="w-8 h-8 text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4 tracking-tight">AI Wellness Insights</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  Your vitamin D levels are slightly below optimal. We recommend 15 minutes of direct morning sunlight.
                </p>
                <button className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-colors">
                   Read Full Plan
                </button>
              </div>
           </section>

           <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/30 transition-colors">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 px-2">Assigned Doctor</h4>
              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">DS</div>
                <div>
                   <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Dr. Sarah Smith</div>
                   <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">General Practitioner</div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
