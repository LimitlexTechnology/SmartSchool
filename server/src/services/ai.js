const OpenAI = require("openai");
require('dotenv').config();

// Since the API key provided starts with 'sk-or-v1-', it's an OpenRouter key.
// We use OpenRouter's base URL and a standard model like GPT-4o-mini or Gemini Flash.
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://smartschool.edu", 
    "X-Title": "SmartSchool",
  }
}) : null;

/**
 * Generates questions using the configured AI service.
 */
async function generateQuestions(topic, instructions = "", count = 5) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const prompt = `
    You are an expert teacher. Generate ${count} exam questions about "${topic}".
    Additional instructions: ${instructions}
    
    Return the response as a valid JSON array of objects. Each object must have:
    - "type": either "Multiple Choice" or "Short Answer"
    - "text": the question text
    - "marks": recommended marks for this question (integer)
    - "options": (only for Multiple Choice) an array of 4 strings
    - "correctAnswer": (only for Multiple Choice) the exact string of the correct option
    
    Only return the JSON array, no other text.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // Using GPT-4o-mini via OpenRouter
      messages: [
        { role: "system", content: "You are a professional educational content creator. Always return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0].message.content;
    console.log("[AI Service] Raw Response:", text);
    
    const parsed = JSON.parse(text);
    // OpenRouter models might return the array directly or wrapped in an object
    return Array.isArray(parsed) ? parsed : (parsed.questions || Object.values(parsed)[0]);
  } catch (error) {
    console.error("AI Question Generation Error:", error);
    throw error;
  }
}

/**
 * Evaluates short answers using the configured AI service.
 */
async function evaluateShortAnswer(question, studentAnswer, maxMarks) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const prompt = `
    Question: "${question}"
    Student's Answer: "${studentAnswer}"
    Maximum Marks: ${maxMarks}
    
    Evaluate this answer objectively. Provide:
    1. A suggested score out of ${maxMarks}.
    2. Constructive feedback for the student.
    
    Return the response as a valid JSON object:
    {
      "suggestedScore": number,
      "feedback": "string"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert examiner. Always return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    throw error;
  }
}

/**
 * Evaluates the given text for toxic, explicit, or fraudulent behavior.
 */
async function moderateContent(text) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is missing. Skipping AI moderation.");
    return { passed: true };
  }

  const prompt = `
    Analyze the following message intended for a secure intra-school social network.
    The primary rule is: "The app should entirely frown on nudes, explicit content, sexual behavior, and any fraudulent acts such as scamming, asking for money deceptively, or illicit trades."
    
    Message: "${text}"
    
    Determine if the message violates these guidelines. In an educational setting, normal discussion is allowed, but explicitly requesting/posting nudes, adult matters, or performing scams is strictly prohibited.
    
    Return the response as a valid JSON object:
    {
      "passed": boolean,
      "reason": "string (Why it passed or failed)"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional content moderator. Always return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI Moderation Error:", error);
    return { passed: true }; // Failsafe pass
  }
}

module.exports = {
  generateQuestions,
  evaluateShortAnswer,
  moderateContent,
  isAvailable: !!process.env.OPENAI_API_KEY
};
