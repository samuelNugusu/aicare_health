import { motion } from 'motion/react';
import { Activity, AlertTriangle, CheckCircle2, Info, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../utils/utils';
import { LabAnalysisData } from '../../../shared/types';

export default function AnalysisResults({ data }: { data: LabAnalysisData }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'critical': return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Critical' };
      case 'high': return { icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', label: 'High' };
      case 'low': return { icon: ArrowDownRight, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Low' };
      default: return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', label: 'Normal' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">AI Health Summary</h3>
        </div>
        <p className="text-gray-600 leading-relaxed text-lg">
          {data.summary}
        </p>
        <div className="mt-6 flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
           <Info className="w-4 h-4 text-blue-600" />
           <p className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">
             AI generated analysis. Consult your physician for medical advice.
           </p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.keyMetrics.map((metric, i) => {
          const config = getStatusConfig(metric.status);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "bg-white p-6 rounded-[2rem] border relative overflow-hidden group hover:shadow-lg transition-all",
                config.border
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Marker</span>
                  <p className="text-xl font-bold text-gray-900">{metric.marker}</p>
                </div>
                <div className={cn("p-2 rounded-xl", config.bg, config.color)}>
                  <config.icon className="w-5 h-5" />
                </div>
              </div>
              
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-sans font-bold text-gray-900">{metric.value}</span>
                <span className="text-sm text-gray-500 mb-1.5 font-medium">{metric.unit}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-50">
                <span className="text-gray-500 italic">Ref: {metric.referenceRange}</span>
                <span className={cn("font-bold uppercase tracking-tighter sm:tracking-normal", config.color)}>{config.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recommendations & Alerts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5em] p-8 border border-gray-100 shadow-lg">
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-green-500 w-5 h-5" />
            Recommendations
          </h4>
          <ul className="space-y-4">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-gray-600 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-[2.5em] p-8 border border-gray-100 shadow-lg">
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="text-orange-500 w-5 h-5" />
            Predictive Insights
          </h4>
          <ul className="space-y-4">
            {data.predictiveAlerts.map((alert, i) => (
              <li key={i} className="flex gap-3 text-gray-600 bg-orange-50/30 p-3 rounded-2xl border border-orange-50">
                <Minus className="text-orange-400 w-4 h-4 mt-1 flex-shrink-0" />
                {alert}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
