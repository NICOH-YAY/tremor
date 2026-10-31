// Verified standard global rates, not the separate Flex/Batch discount table.
export const MODEL_CONFIG={model:'gemini-3.5-flash-lite',location:'global',temperature:0.2,maxPromptChars:24000,maxOutputTokens:256} as const;
export const PRICING={model:MODEL_CONFIG.model,location:'global',tier:'standard',currency:'USD',checkedDate:'2026-10-31',url:'https://cloud.google.com/vertex-ai/generative-ai/pricing',inputPerMillion:0.30,outputPerMillion:2.50,cachedInputPerMillion:0.03,cachedInputUsed:false} as const;
export function estimatedCost(tokensIn:number,tokensOut:number){return (tokensIn*PRICING.inputPerMillion+tokensOut*PRICING.outputPerMillion)/1e6;}
