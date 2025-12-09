import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResponse } from '../types';
import { 
  Activity, 
  ShieldAlert, 
  Scale, 
  Megaphone, 
  Globe, 
  AlertTriangle,
  CheckCircle2,
  AlertOctagon
} from './Icons';

interface AnalysisPanelProps {
  response: AnalysisResponse | null;
  isLoading: boolean;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ response, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scenario' | 'governance' | 'briefings'>('overview');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-pulse">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-mono tracking-widest">ANALYZING BIOSECURITY SIGNALS...</p>
        <p className="text-xs text-slate-600 mt-2 font-mono">Running MGTC Governance Models</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
        <Activity className="w-24 h-24 mb-4" />
        <p className="text-xl font-light">Awaiting Intelligence</p>
        <p className="text-sm mt-2">Select a task and upload data to begin.</p>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-400 border-red-500 bg-red-900/20';
      case 'medium': return 'text-yellow-400 border-yellow-500 bg-yellow-900/20';
      case 'low': return 'text-green-400 border-green-500 bg-green-900/20';
      default: return 'text-slate-400 border-slate-500 bg-slate-900/20';
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'immediate': return 'text-red-400';
      case 'short_term': return 'text-orange-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Header / Navigation */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
           <h2 className="text-xl font-bold text-cyan-400 tracking-wide uppercase">
            GERM Analysis
          </h2>
          <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getRiskColor(response.risk_assessment.overall_risk_level)}`}>
            RISK LEVEL: {response.risk_assessment.overall_risk_level}
          </div>
        </div>
        
        <div className="flex bg-slate-800 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'scenario', label: 'Scenario', icon: ShieldAlert },
            { id: 'governance', label: 'Governance', icon: Scale },
            { id: 'briefings', label: 'Briefings', icon: Megaphone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-cyan-900/50 text-cyan-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Risk Assessment */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" /> Risk Assessment
              </h3>
              <p className="text-lg text-slate-200 leading-relaxed mb-4">
                {response.risk_assessment.justification}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                  <span className="block text-slate-500 text-xs uppercase mb-1">Likely Pathogen</span>
                  <span className="text-cyan-300 font-mono">{response.risk_assessment.likely_pathogen_class}</span>
                </div>
                <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                  <span className="block text-slate-500 text-xs uppercase mb-1">Key Uncertainties</span>
                  <ul className="list-disc list-inside text-slate-300">
                    {response.risk_assessment.key_uncertainties.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Detected Signals */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Detected Signals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {response.signals.map((signal, idx) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-cyan-400 font-bold text-sm uppercase">{signal.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        signal.signal_strength === 'high' ? 'text-red-400 border-red-900 bg-red-900/10' : 
                        signal.signal_strength === 'medium' ? 'text-yellow-400 border-yellow-900 bg-yellow-900/10' : 
                        'text-green-400 border-green-900 bg-green-900/10'
                      }`}>
                        {signal.signal_strength} Strength
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{signal.source_description}</p>
                    {signal.location && <p className="text-xs text-slate-500 mb-1">📍 {signal.location} {signal.timeframe && `• ${signal.timeframe}`}</p>}
                    <p className="text-slate-500 text-xs italic border-l-2 border-slate-600 pl-2">
                      {signal.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

             {/* Actions */}
             <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Recommended Actions
              </h3>
              <div className="space-y-3">
                {response.recommended_actions.map((action, i) => (
                  <div key={i} className="flex gap-4 bg-slate-800/30 p-4 rounded border-l-4 border-l-cyan-600 border border-slate-700/50">
                     <div className="flex-shrink-0 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          action.priority === 'immediate' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                          action.priority === 'short_term' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wide ${getPriorityColor(action.priority)}`}>
                            {action.priority.replace('_', ' ')}
                          </span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className="text-slate-400 text-xs uppercase">{action.domain}</span>
                        </div>
                        <p className="text-slate-200 font-medium">{action.action}</p>
                        <p className="text-slate-500 text-sm mt-1">{action.rationale}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO TAB */}
        {activeTab === 'scenario' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Scenario Projection</h3>
                <span className="text-xs text-slate-500 font-mono border border-slate-700 px-2 py-1 rounded">Horizon: {response.scenario.time_horizon_days} Days</span>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Best Case */}
                <div className="bg-slate-800/30 border border-green-900/30 rounded-lg p-5">
                   <h4 className="text-green-400 font-bold uppercase text-sm mb-4 border-b border-green-900/30 pb-2">Best Case</h4>
                   <p className="text-slate-300 text-sm leading-relaxed">{response.scenario.best_case}</p>
                </div>

                {/* Most Likely */}
                <div className="bg-slate-800/60 border border-cyan-900/50 rounded-lg p-5 shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                   <h4 className="text-cyan-400 font-bold uppercase text-sm mb-4 border-b border-cyan-900/30 pb-2">Most Likely Course</h4>
                   <p className="text-slate-200 text-sm leading-relaxed">{response.scenario.most_likely_course}</p>
                </div>

                {/* Worst Case */}
                <div className="bg-slate-800/30 border border-red-900/30 rounded-lg p-5">
                   <h4 className="text-red-400 font-bold uppercase text-sm mb-4 border-b border-red-900/30 pb-2">Worst Case</h4>
                   <p className="text-slate-300 text-sm leading-relaxed">{response.scenario.worst_case}</p>
                </div>
             </div>

             <div className="mt-6 bg-slate-900/50 p-4 rounded border border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Critical Triggers</h4>
                <div className="flex flex-wrap gap-2">
                  {response.scenario.critical_triggers.map((trigger, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300">
                      {trigger}
                    </span>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* GOVERNANCE TAB */}
        {activeTab === 'governance' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* MGTC Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { title: 'Information Cost', data: response.mgtc_analysis.information_cost, color: 'text-blue-400', bar: 'bg-blue-500' },
                 { title: 'Bargaining Cost', data: response.mgtc_analysis.bargaining_cost, color: 'text-purple-400', bar: 'bg-purple-500' },
                 { title: 'Enforcement Cost', data: response.mgtc_analysis.enforcement_cost, color: 'text-orange-400', bar: 'bg-orange-500' },
               ].map((item, i) => (
                 <div key={i} className="bg-slate-800/40 p-5 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-end mb-2">
                       <span className={`text-sm font-bold uppercase ${item.color}`}>{item.title}</span>
                       <span className="text-2xl font-black text-white">{item.data.score.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full mb-4 overflow-hidden">
                       <div className={`h-full ${item.bar}`} style={{ width: `${(item.data.score / 10) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.data.summary}</p>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                   <AlertTriangle className="w-4 h-4 text-red-400" /> Top Governance Risks
                </h3>
                <ul className="space-y-2">
                   {response.mgtc_analysis.top_governance_risks.map((risk, i) => (
                     <li key={i} className="flex gap-2 text-sm text-slate-300">
                       <span className="text-slate-600">•</span> {risk}
                     </li>
                   ))}
                </ul>

                <h3 className="text-sm font-bold text-slate-300 uppercase mt-6 mb-4 flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-green-400" /> Opportunities for Improvement
                </h3>
                <ul className="space-y-2">
                   {response.mgtc_analysis.opportunities_for_improvement.map((opp, i) => (
                     <li key={i} className="flex gap-2 text-sm text-slate-300">
                       <span className="text-slate-600">•</span> {opp}
                     </li>
                   ))}
                </ul>
              </div>
              
              <div>
                 <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                   <Globe className="w-4 h-4 text-blue-400" /> International Coordination
                </h3>
                 <div className="flex flex-wrap gap-2 mb-4">
                    {response.international_coordination.key_actors.map((actor, i) => (
                       <span key={i} className="px-2 py-1 bg-blue-900/30 border border-blue-800 text-blue-300 text-xs rounded">
                         {actor}
                       </span>
                    ))}
                 </div>
                 
                 <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Challenges</p>
                 <ul className="space-y-1 mb-4">
                    {response.international_coordination.coordination_challenges.map((c, i) => (
                       <li key={i} className="text-sm text-slate-400 pl-2 border-l border-slate-700 mb-1">{c}</li>
                    ))}
                 </ul>

                 <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Opportunities</p>
                 <ul className="space-y-1 mb-4">
                    {response.international_coordination.opportunities.map((c, i) => (
                       <li key={i} className="text-sm text-slate-400 pl-2 border-l border-green-900/50 mb-1">{c}</li>
                    ))}
                 </ul>
              </div>
            </div>
          </div>
        )}

        {/* BRIEFINGS TAB */}
        {activeTab === 'briefings' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {response.briefings.minister_brief && (
                 <div className="bg-slate-800/30 border border-slate-700 p-6 rounded-lg">
                    <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm mb-4">Ministerial Briefing Note</h3>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-serif">
                       <ReactMarkdown>{response.briefings.minister_brief}</ReactMarkdown>
                    </div>
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {response.briefings.public_message && (
                    <div className="bg-slate-800/30 border border-slate-700 p-6 rounded-lg">
                       <h3 className="text-green-400 font-bold uppercase tracking-wider text-sm mb-4">Public Communication</h3>
                       <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                          <ReactMarkdown>{response.briefings.public_message}</ReactMarkdown>
                       </div>
                    </div>
                 )}

                 {response.briefings.partner_note && (
                    <div className="bg-slate-800/30 border border-slate-700 p-6 rounded-lg">
                       <h3 className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-4">Partner/Donor Advisory</h3>
                       <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                          <ReactMarkdown>{response.briefings.partner_note}</ReactMarkdown>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default AnalysisPanel;
