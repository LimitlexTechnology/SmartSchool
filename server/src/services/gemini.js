const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("[Gemini Service] API Key configured:", !!process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Generates questions for a question paper based on a topic and instructions.
 * 
 * @param {string} topic - The topic for the questions.
 * @param {string} instructions - Any specific instructions for generation.
 * @param {number} count - Number of questions to generate.
 * @returns {Promise<Array>} - Array of generated questions.
 */
async function generateQuestions(topic, instructions = "", count = 5) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini Raw Response:", text);
    
    // Clean text: remove markdown code blocks and whitespace
    let cleanedText = text.replace(/```json|```/g, "").trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON. Raw text:", text);
      // Attempt to extract array if it's wrapped in other text
      const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }
      throw new Error("AI returned invalid data format. Please try again.");
    }
  } catch (error) {
    console.error("Gemini Question Generation Error Details:", error.message, error);
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
      throw new Error(`Invalid Gemini API Key. Please check your .env file. Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Provides feedback and a suggested score for a student's short answer.
 * 
 * @param {string} question - The original question text.
 * @param {string} studentAnswer - The student's response.
 * @param {number} maxMarks - Maximum marks for the question.
 * @returns {Promise<Object>} - Suggested score and feedback.
 */
async function evaluateShortAnswer(question, studentAnswer, maxMarks) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
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
    
    Only return the JSON object, no other text.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini Evaluation Raw Response:", text);

    let cleanedText = text.replace(/```json|```/g, "").trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini evaluation as JSON. Raw text:", text);
      const objectMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }
      throw new Error("AI returned invalid evaluation format.");
    }
  } catch (error) {
    console.error("Gemini Evaluation Error Details:", error);
    throw error;
  }
}

/**
 * Evaluates the given text for toxic, explicit, or fraudulent behavior.
 * 
 * @param {string} text - The text content to analyze.
 * @returns {Promise<Object>} - Moderation result: { passed: boolean, reason: string }
 */
async function moderateContent(text) {
  if (!process.env.GEMINI_API_KEY) {
    // If AI is disabled, just pass it
    console.warn("GEMINI_API_KEY is missing. Skipping AI moderation.");
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
    
    Only return the JSON object, no other text.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    let cleanedText = rawText.replace(/\`\`\`json|\`\`\`/g, "").trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse moderation JSON. Raw text:", rawText);
      const objectMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (objectMatch) return JSON.parse(objectMatch[0]);
      return { passed: true }; // Failsafe pass
    }
  } catch (error) {
    console.error("Content Moderation AI Error:", error);
    return { passed: true }; // Failsafe pass on network failure
  }
}

module.exports = {
  generateQuestions,
  evaluateShortAnswer,
  moderateContent
};
