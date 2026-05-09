/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import LabUpload from './features/lab/LabUpload';
import ChatAssistant from './features/chat/ChatAssistant';
import Footer from './components/Footer';
import { motion, useScroll, useSpring } from 'motion/react';

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[60]"
        style={{ scaleX }}
      />
      
      <Navbar />
      
      <main>
        <Hero />
        
        <Features />
        
        <div id="how-it-works" className="py-24 bg-white border-y border-gray-50">
          <div className="max-w-7xl mx-auto px-4">
             <div className="text-center mb-16">
                <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">Workflow</span>
                <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-6 tracking-tight">How AiCare Works</h2>
             </div>
             
             <div className="grid md:grid-cols-4 gap-8">
               {[
                 { step: "01", title: "Upload Results", desc: "Scan or upload your physical lab documents securely." },
                 { step: "02", title: "AI Analysis", desc: "Our engine parses every marker and explains the data." },
                 { step: "03", title: "Get Recommendations", desc: "Receive personalized health advice based on your biology." },
                 { step: "04", title: "Chat with AI", desc: "Ask follow-up questions to your personal assistant." }
               ].map((item, i) => (
                 <div key={i} className="relative p-8 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-xl transition-all">
                    <span className="text-5xl font-sans font-black text-blue-100 absolute top-4 right-8 group-hover:text-blue-600/10 transition-colors">{item.step}</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed relative z-10">{item.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <LabUpload />
        
        <ChatAssistant />

        {/* Ready to Take Control Section */}
        <section className="py-24 bg-blue-600 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white blur-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white blur-[100px] translate-x-1/2 translate-y-1/2 rounded-full" />
           </div>
           
           <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-sans font-bold text-white mb-6 tracking-tight">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-blue-100 mb-10 text-lg opacity-90">
                Join thousands of users who are making data-driven decisions about their wellness. 
                Start your free AI health analysis today.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:bg-blue-50 transition-all"
              >
                Get Started for Free
              </motion.button>
           </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

