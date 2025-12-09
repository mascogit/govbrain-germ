import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import AnalysisPanel from './components/AnalysisPanel';
import { TaskType, UploadedFile, AppState } from './types';
import { analyzeData } from './services/geminiService';
import { ChevronDown, ChevronUp, Terminal } from './components/Icons';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    task: TaskType.DETECT_OUTBREAK,
    context: '',
    files: [],
    isLoading: false,
    response: null,
    rawResponse: null,
    error: null,
  });
  
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const handleAddFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setState((prev) => ({
            ...prev,
            files: [...prev.files, {
              id: uuidv4(),
              name: file.name,
              type: file.type,
              data: e.target.result as string
            }]
          }));
        }
      };
      // Read all as data URL for simplicity with Gemini inlineData
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (id: string) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== id),
    }));
  };

  const handleAnalyze = async () => {
    if (state.files.length === 0 && state.context.trim() === '') return;

    setState((prev) => ({ ...prev, isLoading: true, error: null, response: null, rawResponse: null }));

    try {
      const result = await analyzeData(state.task, state.context, state.files);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        response: result,
        rawResponse: JSON.stringify(result, null, 2),
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "An unexpected error occurred during analysis.",
      }));
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar - Fixed width */}
      <div className="w-80 md:w-96 flex-shrink-0 h-full z-20 shadow-xl">
        <Sidebar
          task={state.task}
          setTask={(t) => setState(prev => ({ ...prev, task: t }))}
          context={state.context}
          setContext={(c) => setState(prev => ({ ...prev, context: c }))}
          files={state.files}
          onAddFiles={handleAddFiles}
          onRemoveFile={handleRemoveFile}
          onAnalyze={handleAnalyze}
          isLoading={state.isLoading}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow h-full flex flex-col relative bg-slate-900/50">
        
        {/* Error Banner */}
        {state.error && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded backdrop-blur-md flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <span className="flex items-center gap-2">
              <span className="font-bold">CRITICAL ERROR:</span> {state.error}
            </span>
            <button onClick={() => setState(prev => ({...prev, error: null}))} className="hover:text-white"><ChevronDown className="rotate-180" /></button>
          </div>
        )}

        {/* Content */}
        <div className="flex-grow p-8 h-full overflow-hidden flex flex-col">
          <AnalysisPanel response={state.response} isLoading={state.isLoading} />
        </div>

        {/* JSON Debug Panel - Fixed at bottom right-ish, collapsible */}
        <div className={`absolute bottom-0 right-0 left-0 border-t border-slate-800 bg-slate-900 transition-all duration-300 ease-in-out ${isDebugOpen ? 'h-64' : 'h-10'} flex flex-col`}>
          <button 
            onClick={() => setIsDebugOpen(!isDebugOpen)}
            className="flex items-center justify-between px-4 py-2 bg-slate-800 hover:bg-slate-750 border-t border-slate-700 cursor-pointer w-full text-xs font-mono text-slate-400"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>DEBUG_OUTPUT.JSON</span>
            </div>
            {isDebugOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          {isDebugOpen && (
            <div className="flex-grow overflow-auto p-4 font-mono text-xs bg-black/50 text-green-400">
              <pre>{state.rawResponse || "// No data available"}</pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default App;
