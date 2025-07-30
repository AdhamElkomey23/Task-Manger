import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface BrainResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chatWithBrain(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<BrainResponse> {
  try {
    const systemMessage = systemPrompt || 
      "You are an AI assistant integrated into TaskFlow, a task management application. Help users with task planning, productivity advice, project management, and general assistance. Be concise, helpful, and professional.";

    const openaiMessages = [
      { role: "system" as const, content: systemMessage },
      ...messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return {
      message: response.choices[0].message.content || "I apologize, but I couldn't generate a response.",
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens
      } : undefined
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to communicate with AI assistant. Please try again.");
  }
}

export async function generateTaskSuggestions(
  taskTitle: string,
  description?: string,
  workspaceContext?: string
): Promise<string[]> {
  try {
    const prompt = `Based on this task: "${taskTitle}"${description ? ` with description: "${description}"` : ''}${workspaceContext ? ` in workspace context: "${workspaceContext}"` : ''}, suggest 3-5 actionable subtasks or steps. Return only a JSON array of strings.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a task planning expert. Generate practical, actionable subtasks. Respond with only a JSON array of strings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
    return result.suggestions || result.subtasks || [];
  } catch (error) {
    console.error("Failed to generate task suggestions:", error);
    return [];
  }
}

export async function analyzeProductivity(
  tasksData: {
    completed: number;
    inProgress: number;
    overdue: number;
    totalHours: number;
    period: string;
  }
): Promise<string> {
  try {
    const prompt = `Analyze this productivity data: ${JSON.stringify(tasksData)}. Provide insights, trends, and actionable recommendations for improvement. Keep it concise and actionable.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a productivity analyst. Provide clear, actionable insights based on task management data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Unable to analyze productivity data at this time.";
  } catch (error) {
    console.error("Failed to analyze productivity:", error);
    return "Unable to analyze productivity data at this time.";
  }
}