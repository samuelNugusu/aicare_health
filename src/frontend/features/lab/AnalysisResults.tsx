import { motion } from 'motion/react';
import { Activity, AlertTriangle, CheckCircle2, Info, ArrowUpRight, ArrowDownRight, Minus, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/utils';
import { LabAnalysisData } from '../../../shared/types';

interface AnalysisResultsProps {
  data: LabAnalysisData;
  isDoctor?: boolean;
  status?: string;
  onVerify?: () => void;
  isVerifying?: boolean;
}

export default function AnalysisResults({ data, isDoctor, status, onVerify, isVerifying }: AnalysisResultsProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified': return { icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-100 dark:border-emerald-900/40', label: 'Verified' };
      case 'critical': return { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-100 dark:border-red-900/40', label: 'Critical' };
      case 'high': return { icon: ArrowUpRight, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-orange-100 dark:border-orange-900/40', label: 'High' };
      case 'low': return { icon: ArrowDownRight, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/40', label: 'Low' };
      default: return { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-100 dark:border-green-900/40', label: 'Normal' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-md transition-colors relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">AI Health Summary</h3>
          </div>
          
          {isDoctor && status !== 'verified' && (
            <button 
              onClick={onVerify}
              disabled={isVerifying}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {isVerifying ? 'Processing...' : 'Verify Diagnosis'}
            </button>
          )}

          {status === 'verified' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Physician Verified
            </div>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
          {data.summary}
        </p>
        <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 transition-colors">
           <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
           <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
             AI generated analysis. Consult your physician for medical advice.
           </p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {data.keyMetrics.map((metric, i) => {
          const config = getStatusConfig(metric.status);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "bg-white dark:bg-gray-900 p-5 rounded-2xl border relative overflow-hidden group hover:shadow-md transition-all",
                config.border
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Marker</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{metric.marker}</p>
                </div>
                <div className={cn("p-1.5 rounded-lg", config.bg, config.color)}>
                  <config.icon className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{metric.unit}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 dark:border-gray-800 transition-colors">
                <span className="text-gray-500 italic">Ref: {metric.referenceRange}</span>
                <span className={cn("font-semibold uppercase tracking-wider", config.color)}>{config.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recommendations & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-md transition-colors">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-500 dark:text-green-400 w-4 h-4" />
            Recommendations
          </h4>
          <ul className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold">{i + 1}</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-md transition-colors">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500 dark:text-orange-400 w-4 h-4" />
            Predictive Insights
          </h4>
          <ul className="space-y-3">
            {data.predictiveAlerts.map((alert, i) => (
              <li key={i} className="flex gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-orange-50/40 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30 transition-colors">
                <Minus className="text-orange-500 dark:text-orange-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
