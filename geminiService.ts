
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, BudgetAllocation, AIGoalSuggestion } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyReallocation = async (state: AppState, spentYesterday: number) => {
  const prompt = `
    You are a Zero-Based Budgeting AI Assistant with a focus on Debt Acceleration. 
    Current Budget: ${JSON.stringify(state.allocations)}
    Yesterday's Spend: $${spentYesterday}
    Monthly Goal: ${state.goal.name} ($${state.goal.current}/$${state.goal.target})
    
    Debt Categories & Acceleration Targets: ${JSON.stringify(state.categories.filter(c => c.classification === 'debt'))}

    Strategy:
    1. If the user overspent, reduce 'spendable' first, then 'savings'.
    2. If the user underspent, check if any 'debt' category has a 'targetPayoffMonths'. 
    3. Prioritize funding debt acceleration (Snowball/Avalanche hybrid) before adding to 'savings' if a debt target is set.
    4. Ensure the budget is zero-based: Total Income = Bills + Savings + Spendable + Debt Payments.
    
    Provide a concise explanation of how you prioritized debt acceleration if targets were present.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          newAllocations: {
            type: Type.OBJECT,
            properties: {
              bills: { type: Type.NUMBER },
              income: { type: Type.NUMBER },
              savings: { type: Type.NUMBER },
              spendable: { type: Type.NUMBER },
              total: { type: Type.NUMBER }
            },
            required: ['bills', 'income', 'savings', 'spendable', 'total']
          },
          explanation: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const getWeeklyReview = async (history: any[], goal: any) => {
  const prompt = `
    Analyze the following weekly financial history: ${JSON.stringify(history)}
    Current Goal Progress: ${JSON.stringify(goal)}
    Identify 3 strengths, 3 weaknesses, and provide coaching advice for the next week.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          advice: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const suggestRevisedGoal = async (state: AppState): Promise<AIGoalSuggestion> => {
  const prompt = `
    Based on the user's spending patterns and performance:
    Budget: ${JSON.stringify(state.allocations)}
    Goal Progress: ${JSON.stringify(state.goal)}
    Recent History: ${JSON.stringify(state.history.slice(-7))}

    Suggest a revised monthly savings goal. Highlight areas where they over or under-performed.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestedName: { type: Type.STRING },
          suggestedAmount: { type: Type.NUMBER },
          reasoning: { type: Type.STRING }
        },
        required: ['suggestedName', 'suggestedAmount', 'reasoning']
      }
    }
  });

  return JSON.parse(response.text);
};
