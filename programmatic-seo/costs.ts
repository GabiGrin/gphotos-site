import fs from "fs/promises";

interface ApiCost {
  timestamp: string;
  model: string;
  tokens?: number;
  images?: number;
  cost: number;
  description: string;
}

const COST_PER_1K_TOKENS = {
  "gpt-4": 0.03,
  "gpt-4o": 0.03,
  "dall-e-3": 0.08,
};
export type Model = keyof typeof COST_PER_1K_TOKENS;

function calculateTokenCost(model: Model, tokens: number): number {
  return (tokens / 1000) * (COST_PER_1K_TOKENS[model] || 0);
}

function calculateImageCost(model: Model, count: number): number {
  return count * (COST_PER_1K_TOKENS[model] || 0);
}

async function logCost(cost: ApiCost) {
  const logEntry = `${cost.timestamp} | ${cost.model} | ${cost.tokens || "-"} tokens | ${cost.images || "-"} images | $${cost.cost.toFixed(4)} | ${cost.description}\n`;

  await fs.appendFile("api-costs.log", logEntry);
  return cost.cost;
}

export { logCost, calculateTokenCost, calculateImageCost };
