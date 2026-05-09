import { Search, Brain, MessageSquare, Microscope, Clock, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: Microscope,
    title: "Smart Lab Analysis",
    description: "Upload PDF or photos of your blood work. Our AI extracts and explains every marker in simple terms.",
    color: "bg-blue-500"
  },
  {
    icon: Brain,
    title: "Predictive Diagnostics",
    description: "Identify potential health risks before they become symptoms using advanced genetic and biomarker modeling.",
    color: "bg-indigo-500"
  },
  {
    icon: MessageSquare,
    title: "24/7 Health Assistant",
    description: "Get instant answers to medical questions, medication info, and wellness tips from our expert AI coach.",
    color: "bg-purple-500"
  },
  {
    icon: Clock,
    title: "Trend Tracking",
    description: "Visualize your health over time with automated tracking of your historical lab results and vitals.",
    color: "bg-teal-500"
  },
  {
    icon: Shield,
    title: "Doctor Verification",
    description: "Easily share reports with your physician through our secure, encrypted health portal.",
    color: "bg-rose-500"
  },
  {
    icon: Search,
    title: "Intelligent Recommendations",
    description: "Personalized diet, exercise, and supplement advice tailored specifically to your unique biological data.",
    color: "bg-orange-500"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 px-4">
          <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">Features</span>
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-gray-900 mt-4 mb-6 tracking-tight">
            Advanced AI Health Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our platform combines cutting-edge machine learning with verified medical knowledge 
            to provide you with the most accurate health insights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200`}>
                <feature.icon className="text-white w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
