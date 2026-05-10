import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthProvider';
import { db } from '../../firebase/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  where,
  limit
} from 'firebase/firestore';
import { Activity, Plus, TrendingUp, TrendingDown, Scale, Heart, Droplet, Ruler, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MetricEntry {
  id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: any;
}

const METRIC_CONFIG: Record<string, { label: string; icon: any; unit: string; color: string; bg: string }> = {
  weight: { label: 'Weight', icon: Scale, unit: 'kg', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  blood_pressure_sys: { label: 'Sys BP', icon: Activity, unit: 'mmHg', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  heart_rate: { label: 'Heart Rate', icon: Heart, unit: 'bpm', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  glucose: { label: 'Glucose', icon: Droplet, unit: 'mg/dL', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  height: { label: 'Height', icon: Ruler, unit: 'cm', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
};

const HealthMetrics: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Record<string, MetricEntry>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newMetric, setNewMetric] = useState({ type: 'weight', value: '' });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/metrics`),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snap) => {
      const latest: Record<string, MetricEntry> = {};
      snap.docs.forEach(doc => {
        const data = doc.data() as Omit<MetricEntry, 'id'>;
        if (!latest[data.type]) {
          latest[data.type] = { id: doc.id, ...data };
        }
      });
      setMetrics(latest);
    });
  }, [user]);

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMetric.value) return;

    try {
      await addDoc(collection(db, `users/${user.uid}/metrics`), {
        type: newMetric.type,
        value: parseFloat(newMetric.value),
        unit: METRIC_CONFIG[newMetric.type]?.unit || '',
        timestamp: serverTimestamp()
      });
      setIsAdding(false);
      setNewMetric({ type: 'weight', value: '' });
    } catch (err) {
      console.error("Error adding metric:", err);
    }
  };

  const calculateBMI = () => {
    const weight = metrics['weight']?.value;
    const height = metrics['height']?.value;
    if (weight && height) {
      const heightInM = height / 100;
      return (weight / (heightInM * heightInM)).toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold dark:text-white">Vital Stats</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(METRIC_CONFIG).map(([type, config]) => {
          const Icon = config.icon;
          const data = metrics[type];
          return (
            <motion.div 
              key={type}
              layout
              className={`p-6 rounded-3xl border border-transparent dark:border-gray-800 ${config.bg} transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {data && (
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {new Date(data.timestamp?.toDate()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{config.label}</div>
                <div className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                  {data ? `${data.value}` : '--'}
                  <span className="text-xs ml-1 font-bold text-gray-400 uppercase tracking-tighter">{config.unit}</span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* BMI Card */}
        {bmi && (
           <motion.div 
            layout
            className="p-6 rounded-3xl border border-transparent dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20 transition-all col-span-2"
          >
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="px-2 py-1 rounded-full bg-blue-600 text-[10px] text-white font-bold uppercase tracking-widest">
                  Verified
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Calculated Body Mass Index (BMI)</div>
                <div className="text-2xl font-black text-blue-900 dark:text-blue-100 tracking-tight">
                  {bmi}
                  <span className="text-xs ml-2 font-bold opacity-60 uppercase tracking-tighter">Normal Range</span>
                </div>
              </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold dark:text-white tracking-tight">Add Health Logic</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <form onSubmit={handleAddMetric} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Metric Type</label>
                  <select 
                    value={newMetric.type}
                    onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value })}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 transition-all font-bold dark:text-white"
                  >
                    {Object.entries(METRIC_CONFIG).map(([type, config]) => (
                      <option key={type} value={type}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Value ({METRIC_CONFIG[newMetric.type]?.unit})</label>
                  <input 
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={newMetric.value}
                    onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 transition-all text-xl font-black dark:text-white shadow-inner"
                    autoFocus
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                >
                  Log Entry
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthMetrics;
