import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export interface ScoreResult {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  reasoning: string;
  strengths: string[];
  gaps: string[];
}

export async function scoreResume(
  resumeText: string,
  jobDescription: string
): Promise<ScoreResult> {
  const response = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert technical recruiter. Evaluate the candidate's resume against the job description.
Return ONLY valid JSON matching this exact structure:
{
  "overallScore": <number 0-100>,
  "skillsScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "educationScore": <number 0-100>,
  "reasoning": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"]
}`,
      },
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty response from AI");
  return JSON.parse(content) as ScoreResult;
}

export async function generateQuestions(
  resumeText: string,
  jobDescription: string
): Promise<{ question: string; type: "TECHNICAL" | "BEHAVIOURAL" | "CULTURE_FIT"; order: number }[]> {
  const response = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert interviewer. Generate exactly 10 personalized interview questions.
Return ONLY valid JSON as an array:
[
  { "question": "<question>", "type": "TECHNICAL", "order": 1 },
  ...6 TECHNICAL questions (orders 1-6)...
  { "question": "<question>", "type": "BEHAVIOURAL", "order": 7 },
  { "question": "<question>", "type": "BEHAVIOURAL", "order": 8 },
  { "question": "<question>", "type": "CULTURE_FIT", "order": 9 },
  { "question": "<question>", "type": "CULTURE_FIT", "order": 10 }
]`,
      },
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty response from AI");
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : parsed.questions;
}
