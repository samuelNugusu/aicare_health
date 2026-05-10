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
  deleteDoc,
  doc,
  limit
} from 'firebase/firestore';
import { Activity, Plus, TrendingUp, TrendingDown, Scale, Heart, Droplet, Ruler, X, Trash2 } from 'lucide-react';
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

interface HealthMetricsProps {
  userId?: string;
  readOnly?: boolean;
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ userId, readOnly }) => {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.uid;
  
  const [metrics, setMetrics] = useState<Record<string, MetricEntry>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newMetric, setNewMetric] = useState({ type: 'weight', value: '' });

  useEffect(() => {
    if (!effectiveUserId) return;

    const q = query(
      collection(db, `users/${effectiveUserId}/metrics`),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snap) => {
      const latest: Record<string, MetricEntry> = {};
      snap.docs.forEach(docSnap => {
        const data = docSnap.data() as Omit<MetricEntry, 'id'>;
        if (!latest[data.type]) {
          latest[data.type] = { id: docSnap.id, ...data };
        }
      });
      setMetrics(latest);
    });
  }, [effectiveUserId]);

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveUserId || !newMetric.value || readOnly) return;

    try {
      await addDoc(collection(db, `users/${effectiveUserId}/metrics`), {
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

  const deleteMetric = async (id: string) => {
    if (!effectiveUserId || readOnly || !window.confirm("Are you sure you want to delete this recording?")) return;
    try {
      await deleteDoc(doc(db, `users/${effectiveUserId}/metrics`, id));
    } catch (err) {
      console.error("Error deleting metric:", err);
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
        {!readOnly && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 font-bold text-sm tracking-tight"
          >
            <Plus className="w-5 h-5" />
            Log Data
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Object.entries(METRIC_CONFIG).map(([type, config]) => {
          const Icon = config.icon;
          const data = metrics[type];
          return (
            <motion.div 
              key={type}
              layout
              className={`group relative p-5 sm:p-6 rounded-3xl border border-transparent dark:border-gray-800 ${config.bg} transition-all overflow-hidden`}
            >
              {data && (
                <button 
                  onClick={() => deleteMetric(data.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm pointer-events-auto z-10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${config.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">{config.label}</div>
                <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                  {data ? `${data.value}` : '--'}
                  <span className="text-[10px] ml-1 font-bold text-gray-400 uppercase tracking-tighter">{config.unit}</span>
                </div>
                {data && (
                  <div className="text-[8px] sm:text-[10px] text-gray-400 font-medium">
                    {new Date(data.timestamp?.toDate()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* BMI Card */}
        {bmi && (
           <motion.div 
            layout
            className="p-6 rounded-3xl border border-transparent dark:border-gray-800 bg-blue-100/50 dark:bg-blue-900/30 transition-all col-span-2 relative overflow-hidden"
          >
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/10 blur-2xl" />
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-[10px] text-blue-600 font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                  Calculated BMI
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-blue-900/60 dark:text-blue-300/60 uppercase tracking-widest text-[10px]">Body Mass Index</div>
                <div className="text-3xl font-black text-blue-900 dark:text-blue-100 tracking-tighter">
                  {bmi}
                  <span className="text-xs ml-2 font-bold opacity-60 uppercase tracking-tighter">
                    {parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Healthy' : 'Overweight'}
                  </span>
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
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 animate-pulse" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black dark:text-white tracking-tight">Manual Log</h3>
                  <p className="text-sm text-gray-500 font-medium">Record a new health data point.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <form onSubmit={handleAddMetric} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Stat Type</label>
                  <select 
                    value={newMetric.type}
                    onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value })}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 transition-all font-bold dark:text-white appearance-none pr-10"
                  >
                    {Object.entries(METRIC_CONFIG).map(([type, config]) => (
                      <option key={type} value={type}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Recorded Value ({METRIC_CONFIG[newMetric.type]?.unit})</label>
                  <input 
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={newMetric.value}
                    onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                    className="w-full p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-4 focus:ring-blue-600/20 transition-all text-2xl font-black dark:text-white shadow-inner"
                    autoFocus
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30"
                >
                  Save Entry
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthMetrics;
