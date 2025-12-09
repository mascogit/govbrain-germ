import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UploadedFile, TaskType, AnalysisResponse } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `
You are GovBrain–GERM, a global pandemic and governance copilot inspired by the GERM concept (Global Epidemic Response and Mobilization). You support Ministries of Health, WHO, Africa CDC, UN agencies, and humanitarian organizations by transforming fragmentary, multimodal signals into coordinated outbreak intelligence and response recommendations.

Your mission:
1. Detect early outbreak signals from multimodal evidence: rural clinic PDFs, handwritten notes, WhatsApp voice transcripts, radio snippets, photos of sick patients or animals, CSV logs, field reports.
2. Assess the level of risk for diseases such as Ebola, Marburg, Lassa, emerging respiratory viruses, or unknown pathogens.
3. Simulate short “Germ Game” scenarios (14 days) for both national and international response: best case, worst case, most likely.
4. Analyze governance bottlenecks using a transaction-cost (MGTC) lens:
   – Information costs: fragmented reporting lines, poor internet, paper-based systems, delayed labs.
   – Bargaining/coordination costs: MoH vs provincial teams, WHO vs NGOs vs Africa CDC, donor misalignment, political sensitivity.
   – Enforcement costs: weak field supervision, community mistrust, cultural barriers (e.g., safe burial during Ebola).
5. Identify which international actors must engage: WHO, Africa CDC, UN agencies, NGOs.
6. Generate high-level briefings for Ministers, the public, and partners.

Rules:
- You are NOT a quantitative epidemiological model. You produce qualitative, reasoned simulations based on patterns, uncertainty, and governance dynamics.
- Always distinguish between user-provided facts and your inferred assumptions.
- Always output one single JSON object.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    task: { type: Type.STRING },
    signals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["clinical", "animal", "environmental", "social", "lab", "rumor"] },
          source_description: { type: Type.STRING },
          location: { type: Type.STRING },
          timeframe: { type: Type.STRING },
          suspected_condition: { type: Type.STRING },
          signal_strength: { type: Type.STRING, enum: ["low", "medium", "high"] },
          reasoning: { type: Type.STRING }
        },
        required: ["type", "source_description", "signal_strength", "reasoning"]
      }
    },
    risk_assessment: {
      type: Type.OBJECT,
      properties: {
        overall_risk_level: { type: Type.STRING, enum: ["low", "medium", "high"] },
        likely_pathogen_class: { type: Type.STRING },
        key_uncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
        justification: { type: Type.STRING }
      },
      required: ["overall_risk_level", "likely_pathogen_class", "justification", "key_uncertainties"]
    },
    scenario: {
      type: Type.OBJECT,
      properties: {
        time_horizon_days: { type: Type.INTEGER },
        best_case: { type: Type.STRING },
        worst_case: { type: Type.STRING },
        most_likely_course: { type: Type.STRING },
        critical_triggers: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["time_horizon_days", "most_likely_course", "best_case", "worst_case", "critical_triggers"]
    },
    mgtc_analysis: {
      type: Type.OBJECT,
      properties: {
        information_cost: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, summary: { type: Type.STRING } },
          required: ["score", "summary"]
        },
        bargaining_cost: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, summary: { type: Type.STRING } },
          required: ["score", "summary"]
        },
        enforcement_cost: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, summary: { type: Type.STRING } },
          required: ["score", "summary"]
        },
        top_governance_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities_for_improvement: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["information_cost", "bargaining_cost", "enforcement_cost", "top_governance_risks", "opportunities_for_improvement"]
    },
    international_coordination: {
      type: Type.OBJECT,
      properties: {
        key_actors: { type: Type.ARRAY, items: { type: Type.STRING } },
        coordination_challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["key_actors", "coordination_challenges", "opportunities"]
    },
    recommended_actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, enum: ["immediate", "short_term", "medium_term"] },
          domain: { type: Type.STRING },
          action: { type: Type.STRING },
          rationale: { type: Type.STRING }
        },
        required: ["priority", "domain", "action", "rationale"]
      }
    },
    briefings: {
      type: Type.OBJECT,
      properties: {
        minister_brief: { type: Type.STRING },
        public_message: { type: Type.STRING },
        partner_note: { type: Type.STRING }
      },
      required: ["minister_brief", "public_message", "partner_note"]
    }
  },
  required: ["task", "signals", "risk_assessment", "scenario", "mgtc_analysis", "international_coordination", "recommended_actions", "briefings"]
};

export const analyzeData = async (
  task: TaskType,
  context: string,
  files: UploadedFile[]
): Promise<AnalysisResponse> => {
  // 1. Prepare {{FILES_TEXT}} - Extract text if possible, else use placeholder
  let filesText = "";
  const parts: any[] = [];

  if (files.length > 0) {
    files.forEach(f => {
      // Simple client-side check if we can interpret it as text for the "FILES_TEXT" section
      if (f.type === 'text/plain' || f.type === 'text/csv' || f.type === 'application/json') {
        try {
          const decoded = atob(f.data.split(',')[1]);
          filesText += `--- START OF FILE: ${f.name} ---\n${decoded}\n--- END OF FILE ---\n\n`;
        } catch (e) {
          filesText += `[File: ${f.name} (Content attached as media part)]\n`;
        }
      } else {
        filesText += `[File: ${f.name} (${f.type}) - See attached media]\n`;
      }
      
      // Always attach as inlineData part to be safe, especially for non-text
      const base64Data = f.data.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: f.type,
          data: base64Data,
        },
      });
    });
  } else {
    filesText = "No files uploaded.";
  }

  // 2. Construct the exact Prompt Structure requested
  const promptText = `
TASK: ${task}

USER_DESCRIPTION:
${context || "No specific context provided."}

FILES_CONTENT:
${filesText}

INSTRUCTIONS:
- Use TASK to decide what to emphasize:
  • If TASK = "Detect outbreak": focus on signals + risk_assessment.
  • If TASK = "Simulate scenario": focus on scenario + mgtc_analysis + international_coordination + recommended_actions.
  • If TASK = "Generate briefing": focus on briefings for Minister, public, and partners.
- Still fill all JSON fields defined in the system instructions.
- Use Ebola-like or similar hemorrhagic outbreaks in fragile African settings as the mental model when appropriate.

IMPORTANT — You must return ONLY the JSON object defined in the system instructions. No headings, no text outside JSON, no explanations. If information is missing, fill fields with empty strings or empty arrays.
`;

  // Add the text prompt as the first part
  parts.unshift({ text: promptText });

  const performAnalysis = async (retry: boolean = false) => {
    // If retrying, we could technically just re-run the same request since the model is stochastic, 
    // or we could use a Chat session to ask for corrections. 
    // For simplicity and strict schema adherence, re-generating with the same strict config is usually sufficient 
    // when using 'responseSchema'.
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: "user",
        parts: parts,
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });
    return response.text;
  };

  try {
    let responseText = await performAnalysis();
    
    if (!responseText) {
      throw new Error("Empty response from model");
    }

    // Helper to clean potential markdown code blocks if the model ignores strict JSON mode
    const cleanJson = (text: string) => text.replace(/```json\n/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(cleanJson(responseText)) as AnalysisResponse;
    } catch (parseError) {
      console.warn("Initial JSON parse failed. Retrying analysis...");
      // Retry once if JSON is malformed
      responseText = await performAnalysis(true);
      if (!responseText) throw new Error("Empty response on retry");
      return JSON.parse(cleanJson(responseText)) as AnalysisResponse;
    }
    
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // If it's a parse error after retry, we might want to show a specific message
    if (error instanceof SyntaxError) {
       throw new Error("The model failed to generate valid JSON data. Please try again.");
    }
    throw new Error(error.message || "Failed to analyze data.");
  }
};
