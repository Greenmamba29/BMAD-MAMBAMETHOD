// lib/openai.ts
import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function chat(messages: {role: "system"|"user"|"assistant"|"tool", content: string, name?: string}[], toolSchema?: any) {
  return openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.2,
    tool_choice: "auto",
    tools: toolSchema ?? []
  });
}