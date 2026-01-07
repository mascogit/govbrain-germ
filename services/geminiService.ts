// services/geminiService.ts (public-safe)
// Core LLM prompt + orchestration logic intentionally omitted for IP + safety.

import { TaskType, AnalysisResponse } from "../types";

export async function runAnalysis(
  _taskType: TaskType,
  _input: unknown
): Promise<AnalysisResponse> {
  throw new Error(
    "GovBrain core LLM logic is not included in this public repository."
  );
}
