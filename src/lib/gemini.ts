import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type PilotModule = 
  | 'overview' 
  | 'architecture' 
  | 'setup' 
  | 'verify' 
  | 'demo' 
  | 'ai_ml' 
  | 'docs' 
  | 'audio' 
  | 'lab' 
  | 'search' 
  | 'analyst' 
  | 'agent' 
  | 'regions' 
  | 'conclusion' 
  | 'reset';

export interface PilotResponse {
  content: string;
  code?: string;
  language?: string;
  suggestions?: string[];
  data?: any;
  opsGuardrails?: {
    supplyChainImpact?: string;
    inventoryStatus?: string;
    logisticsRisk?: string;
  };
}

const SYSTEM_PROMPTS: Record<PilotModule, string> = {
  overview: `You are the "Supply Chain Overview" assistant. Provide high-level insights into manufacturing and operations. Focus on how Snowflake Cortex powers the supply chain.`,
  architecture: `You are the "Architecture Architect". Explain the Snowflake + Supply Chain data architecture. Focus on zero-copy cloning, secure sharing, and Cortex integration.`,
  setup: `You are the "Environment Setup" guide. Help users configure their Snowflake environment for supply chain analytics.`,
  verify: `You are the "Deployment Verifier". Help users check if their supply chain models and pipelines are running correctly.`,
  demo: `You are the "Demo Explorer". Guide users through a live supply chain demo (e.g., demand forecasting, route optimization).`,
  ai_ml: `You are the "AI & ML Studio" expert. Focus on predictive maintenance and demand forecasting using Snowflake ML.`,
  docs: `You are the "Document Processing" specialist. Help extract data from bills of lading, invoices, and shipping docs using Cortex Document AI.`,
  audio: `You are the "Audio Analysis" specialist. Analyze warehouse voice logs or customer support calls for operational efficiency.`,
  lab: `You are the "Intelligence Lab" researcher. Explore cutting-edge supply chain optimizations using generative AI.`,
  search: `You are the "Cortex Search" expert. Help users find parts, suppliers, or documents across the supply chain data lake.`,
  analyst: `You are the "Cortex Analyst". Provide natural language analytics for supply chain managers (e.g., "What is our current stock level in EMEA?").`,
  agent: `You are the "Intelligence Agent". Act as an autonomous agent that can trigger supply chain actions (e.g., reorder parts).`,
  regions: `You are the "Regional Customizer". Help optimize supply chain configurations for specific global regions.`,
  conclusion: `You are the "Supply Chain Conclusion" assistant. Summarize the benefits and next steps.`,
  reset: `You are the "System Reset" assistant. Help users redeploy or reset their supply chain environment.`
};

export async function askPilot(module: PilotModule, prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []): Promise<PilotResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: SYSTEM_PROMPTS[module],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The main explanation or response text." },
          code: { type: Type.STRING, description: "Any generated code snippet." },
          language: { type: Type.STRING, description: "The programming language of the code (sql, python, etc.)." },
          suggestions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Follow-up suggestions or actions."
          },
          data: { type: Type.OBJECT, description: "Any structured data for charts or tables." },
          opsGuardrails: {
            type: Type.OBJECT,
            properties: {
              costEstimate: { type: Type.STRING, description: "Estimated credit cost for this operation." },
              schemaValidation: { type: Type.STRING, description: "Data contract or schema validation status/code." },
              experimentLogging: { type: Type.STRING, description: "Boilerplate or status for experiment tracking." }
            }
          }
        },
        required: ["content"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as PilotResponse;
  } catch (e) {
    return { content: response.text || "I encountered an error processing the response." };
  }
}
