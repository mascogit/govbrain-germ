// services/geminiService.ts

import { TaskType, AnalysisResponse } from "../types";

/**
 * Public-safe stub for GovBrain analysis.
 * Core LLM prompting and orchestration logic is maintained privately.
 */
export async function runAnalysis(
  _taskType: TaskType,
  _input: unknown
): Promise<AnalysisResponse> {
  throw new Error(
    "GovBrain core LLM logic is intentionally excluded from the public repository for IP protection and responsible-use considerations."
  );
}
