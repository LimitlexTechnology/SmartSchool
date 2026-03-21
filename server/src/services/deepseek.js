const OpenAI = require("openai");
require('dotenv').config();

let openai = null;

if (process.env.DEEPSEEK_API_KEY) {
  openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
}

/**
 * Generates questions using DeepSeek.
 */
async function generateQuestionsDS(topic, instructions = "", count = 5) {
  if (!openai) throw new Error("DEEPSEEK_API_KEY is not configured.");

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
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a professional educational content creator. Always return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: 'json_object' } // DeepSeek supports JSON mode
    });

    const text = response.choices[0].message.content;
    console.log("[DeepSeek] Raw Response:", text);
    
    // Some models wrap the array in an object even if asked for an array
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : (parsed.questions || Object.values(parsed)[0]);
  } catch (error) {
    console.error("DeepSeek Question Generation Error:", error);
    throw error;
  }
}

/**
 * Evaluates short answers using DeepSeek.
 */
async function evaluateShortAnswerDS(question, studentAnswer, maxMarks) {
  if (!openai) throw new Error("DEEPSEEK_API_KEY is not configured.");

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
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an expert examiner. Always return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("DeepSeek Evaluation Error:", error);
    throw error;
  }
}

module.exports = {
  generateQuestionsDS,
  evaluateShortAnswerDS,
  isDSAvailable: !!openai
};
