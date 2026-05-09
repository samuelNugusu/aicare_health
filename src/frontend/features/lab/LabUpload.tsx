import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeLabResult } from '../../services/geminiService';
import { db, auth } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../../utils/utils';
import AnalysisResults from './AnalysisResults';

export default function LabUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError("Please upload an image file of your lab result.");
      return;
    }
    setError(null);
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!preview) return;
    setIsProcessing(true);
    setError(null);
    try {
      const analysisJson = await analyzeLabResult({ base64Image: preview });
      setResult(analysisJson);
      
      // Save to Firebase if user is logged in
      if (auth.currentUser) {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/lab_results`), {
          fileName: file?.name,
          uploadDate: serverTimestamp(),
          status: 'completed',
          analysis: analysisJson,
          previewUrl: '...' // Usually you'd upload to storage first, but for now we skip storage and just use analysis
        });
      }
    } catch (err: any) {
      console.error("Lab Upload Error:", err);
      setError(err.message || "Failed to analyze health data. Please try a clearer image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Analysis Report</h2>
          <button onClick={reset} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
            Upload Another
          </button>
        </div>
        <AnalysisResults data={result} />
      </div>
    );
  }

  return (
    <section id="upload" className="py-24 bg-white relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
           <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Upload Your Lab Results</h2>
           <p className="text-gray-600">Drag and drop your blood reports for instant AI-powered insights.</p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "border-2 border-dashed rounded-[3rem] p-12 transition-all flex flex-col items-center justify-center text-center gap-6 cursor-pointer",
                  isDragging ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                )}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 mb-1">Select a file or drag and drop</p>
                  <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Image (JPG, PNG)</p>
                </div>
                <input 
                  type="file" 
                  id="file-input" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={onFileChange} 
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 rounded-[3rem] p-4 lg:p-8 border border-gray-100 flex flex-col items-center"
              >
                 <div className="relative w-full max-w-lg mb-8 group">
                   <img src={preview!} alt="Preview" className="w-full rounded-[2rem] shadow-lg border border-white" />
                   <button 
                    onClick={reset}
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur shadow-md p-2 rounded-full hover:bg-white text-gray-900"
                   >
                     <X className="w-5 h-5" />
                   </button>
                 </div>
                 
                 <div className="w-full max-w-lg space-y-6">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      )}
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm font-medium p-4 bg-red-50 rounded-2xl">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={processFile}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-100"
                    >
                      {isProcessing ? (
                        <>Analyzing health data...</>
                      ) : (
                        <>Start Intelligence Analysis</>
                      )}
                    </motion.button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
