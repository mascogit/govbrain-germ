export enum TaskType {
  DETECT_OUTBREAK = 'Detect outbreak',
  SIMULATE_SCENARIO = 'Simulate scenario',
  GENERATE_BRIEFING = 'Generate briefing',
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  data: string; // Base64 string
}

export interface Signal {
  type: string;
  source_description: string;
  location?: string;
  timeframe?: string;
  suspected_condition?: string;
  signal_strength: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface RiskAssessment {
  overall_risk_level: 'low' | 'medium' | 'high';
  likely_pathogen_class: string;
  key_uncertainties: string[];
  justification: string;
}

export interface Scenario {
  time_horizon_days: number;
  best_case: string;
  worst_case: string;
  most_likely_course: string;
  critical_triggers: string[];
}

export interface CostAnalysis {
  score: number;
  summary: string;
}

export interface MgtcAnalysis {
  information_cost: CostAnalysis;
  bargaining_cost: CostAnalysis;
  enforcement_cost: CostAnalysis;
  top_governance_risks: string[];
  opportunities_for_improvement: string[];
}

export interface InternationalCoordination {
  key_actors: string[];
  coordination_challenges: string[];
  opportunities: string[];
}

export interface RecommendedAction {
  priority: 'immediate' | 'short_term' | 'medium_term';
  domain: string;
  action: string;
  rationale: string;
}

export interface Briefings {
  minister_brief?: string;
  public_message?: string;
  partner_note?: string;
}

export interface AnalysisResponse {
  task: string;
  signals: Signal[];
  risk_assessment: RiskAssessment;
  scenario: Scenario;
  mgtc_analysis: MgtcAnalysis;
  international_coordination: InternationalCoordination;
  recommended_actions: RecommendedAction[];
  briefings: Briefings;
}

export interface AppState {
  task: TaskType;
  context: string;
  files: UploadedFile[];
  isLoading: boolean;
  response: AnalysisResponse | null;
  rawResponse: string | null;
  error: string | null;
}
