// lib/openai.ts
import OpenAI from "openai";

export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY! 
});

export async function chat(
  messages: any[], 
  toolSchema?: any
) {
  return openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages as any,
    temperature: 0.2,
    tool_choice: "auto",
    tools: toolSchema ?? []
  });
}