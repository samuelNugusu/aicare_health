import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, HeartPulse } from 'lucide-react';
import { signInWithGoogle } from '../firebase/firebase';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 -z-10 opacity-10">
        <div className="w-[600px] h-[600px] rounded-full bg-blue-600 blur-[120px]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3 h-3" />
              Advanced Health Intelligence
            </div>
            
            <h1 className="text-6xl md:text-7xl font-sans font-bold tracking-tight text-gray-900 leading-[0.95] mb-8">
              AI-Powered <br />
              <span className="text-blue-600">Health Diagnostics</span> <br />
              at Your Fingertips
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              Upload your lab results and get instant, professional-grade AI analysis. 
              Monitor your health trends and chat with your personal medical assistant 24/7.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signInWithGoogle}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Analyze Your Health Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">10k+ Users</span>
                  <span className="text-xs text-gray-500">Managing their health better</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                     <HeartPulse className="text-blue-600 w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-bold text-gray-900">Health Overview</h3>
                     <p className="text-xs text-gray-500">Live monitoring enabled</p>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">98%</span>
                  <p className="text-[10px] uppercase font-bold text-green-500">Wellness Score</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: "Hemoglobin", value: "14.2", unit: "g/dL", status: "Optimal" },
                  { label: "Cholesterol", value: "185", unit: "mg/dL", status: "Healthy" },
                  { label: "Blood Sugar", value: "92", unit: "mg/dL", status: "Normal" }
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                      <p className="font-bold text-gray-900">{item.value} <span className="text-[10px] text-gray-400 font-normal">{item.unit}</span></p>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold uppercase">{item.status}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                   <ShieldCheck className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase tracking-wider">AI Verified Diagnosis</span>
                </div>
                <p className="text-sm text-gray-600 italic">"Results indicate optimal metabolic health. Maintain current diet."</p>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Zap className="text-orange-600 w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-gray-900">Prediction: Low Risk</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
