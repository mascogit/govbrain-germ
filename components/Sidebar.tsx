import React, { useRef } from 'react';
import { TaskType, UploadedFile } from '../types';
import { Upload, X, FileText, Activity, ShieldAlert, FileOutput, Loader2 } from './Icons';

interface SidebarProps {
  task: TaskType;
  setTask: (task: TaskType) => void;
  context: string;
  setContext: (context: string) => void;
  files: UploadedFile[];
  onAddFiles: (files: FileList) => void;
  onRemoveFile: (id: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  task,
  setTask,
  context,
  setContext,
  files,
  onAddFiles,
  onRemoveFile,
  onAnalyze,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTaskIcon = (t: TaskType) => {
    switch (t) {
      case TaskType.DETECT_OUTBREAK: return <Activity className="w-4 h-4" />;
      case TaskType.SIMULATE_SCENARIO: return <ShieldAlert className="w-4 h-4" />;
      case TaskType.GENERATE_BRIEFING: return <FileOutput className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 gap-8 bg-slate-900 border-r border-slate-800 overflow-y-auto">
      
      {/* Branding */}
      <div>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter">
          GovBrain–GERM
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-1">BIOSECURITY INTELLIGENCE UNIT</p>
      </div>

      {/* Task Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operational Task</label>
        <div className="relative">
          <select
            value={task}
            onChange={(e) => setTask(e.target.value as TaskType)}
            className="w-full appearance-none bg-slate-800 border border-slate-700 hover:border-cyan-600 text-slate-200 text-sm rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
            disabled={isLoading}
          >
            {Object.values(TaskType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="absolute left-3 top-3.5 text-cyan-500">
             {getTaskIcon(task)}
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Intelligence Data</label>
        <div 
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-500 hover:bg-slate-800/50'}`}
        >
          <Upload className="w-8 h-8 text-slate-500" />
          <span className="text-sm text-slate-400 font-medium text-center">Click to upload files<br/><span className="text-xs text-slate-600">(PDF, IMG, TXT, CSV)</span></span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            accept=".pdf,.txt,.csv,.jpg,.jpeg,.png,.webp"
            disabled={isLoading}
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-slate-800 rounded p-2 border border-slate-700 group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  <span className="text-xs text-slate-300 truncate font-mono">{file.name}</span>
                </div>
                <button 
                  onClick={() => onRemoveFile(file.id)}
                  disabled={isLoading}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Input */}
      <div className="flex flex-col gap-2 flex-grow">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mission Context</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Enter detailed briefing context, specific instructions, or intelligence summaries..."
          className="w-full flex-grow bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none font-mono leading-relaxed"
          disabled={isLoading}
        />
      </div>

      {/* Action Button */}
      <button
        onClick={onAnalyze}
        disabled={isLoading || (files.length === 0 && context.trim() === '')}
        className={`w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase shadow-lg transition-all flex items-center justify-center gap-2 ${
          isLoading 
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
            : (files.length === 0 && context.trim() === '') 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-500/20 hover:scale-[1.01]'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running Simulation...
          </>
        ) : (
          <>
            Initiate Analysis
          </>
        )}
      </button>

    </div>
  );
};

export default Sidebar;
