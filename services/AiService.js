import { GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../models/Chat.model.js";
import Message from "../models/Message.model.js";
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to read and encode image files
const encodeImageToBase64 = (imagePath) => {
  const imageData = fs.readFileSync(imagePath);
  return Buffer.from(imageData).toString('base64');
};

// Process image for Gemini API
const processImage = (imagePath) => {
  const mimeType = getImageMimeType(imagePath);
  const base64Image = encodeImageToBase64(imagePath);
  return {
    inlineData: {
      data: base64Image,
      mimeType: mimeType
    }
  };
};

// Helper function to determine MIME type from file extension
const getImageMimeType = (imagePath) => {
  const extension = imagePath.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  return mimeTypes[extension] || 'image/jpeg';
};

// Function to detect language (simple implementation - can be enhanced)
const detectLanguage = (text) => {
  // Bangla Unicode range check (simplified approach)
  const banglaPhrases = ["আমি", "আমার", "কি", "কেন", "কিভাবে", "কোথায়", "কখন", "আমাকে", "আমাদের", "তুমি", "তোমার", "আপনি", "আপনার"];
  const banglaPhraseCheck = banglaPhrases.some(phrase => text.includes(phrase));
  const banglaCharCheck = /[\u0980-\u09FF]/.test(text);
  
  return (banglaCharCheck || banglaPhraseCheck) ? "bangla" : "english";
};

// Create the Bangladesh-specific educational prompt engineering
const createTutorPrompt = (userPrompt, language, hasImage = false) => {
  // Base context for the AI tutor
  const baseContext = `
You are an expert educational tutor for Bangladeshi students in grades 9-12. Your goal is to provide clear, helpful, and accurate academic assistance. 

Important educational context:
- You understand both Bangladesh's Bangla medium and English version curricula
- You're familiar with SSC and HSC exam patterns and requirements
- You can explain concepts from the Bangladesh National Curriculum textbooks
- You know about important educational institutions in Bangladesh including Dhaka College, Notre Dame College, Dhaka University, BUET, etc.
- You understand Bangladesh's education system and grading methods

When teaching:
1. Break down complex concepts into simple steps
2. Use examples relevant to Bangladeshi context and culture
3. Be patient and encouraging
4. Provide practice questions when appropriate
5. Explain concepts thoroughly rather than just giving answers
6. Include diagrams or visual descriptions when it helps understanding (especially for math, physics, chemistry, and biology)
7. Relate topics to practical applications when possible

${hasImage ? "The student has shared an image (likely of a textbook page, assignment, exam paper, or problem). Analyze the image carefully and address the visual content in your response." : ""}

Make sure your response is:
- Age-appropriate for high school students
- Culturally relevant to Bangladesh
- Academically accurate
- Clear and easy to understand
`;

  // Language-specific instructions
  const languageInstructions = language === "bangla" 
    ? "The student has asked in Bangla. Respond in fluent, natural Bangla. Use Bangla academic terminology where appropriate, but you may use English technical terms when they are commonly used in Bangladeshi education. Avoid mixing English unnecessarily."
    : "Respond in clear academic English. You may use simple English to ensure understanding when explaining complex concepts.";

  // Combine all parts
  return `${baseContext}

${languageInstructions}

Student Question: ${userPrompt}

Provide your thoughtful response as a helpful tutor:`;
};

// AI Response Generator with multimodal support
export const generateAiResponse = async (prompt, imagePath = null) => {
  try {
    const model = await gemini.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    
    // Detect language
    const detectedLanguage = detectLanguage(prompt);
    
    // Create the tutoring-specific prompt
    const tutorPrompt = createTutorPrompt(prompt, detectedLanguage, !!imagePath);
    
    let result;
    if (imagePath) {
      // Multimodal request with text and image
      const imageData = processImage(imagePath);
      result = await model.generateContent([tutorPrompt, imageData]);
    } else {
      // Text-only request
      result = await model.generateContent(tutorPrompt);
    }
    
    const response = result.response;
    const text = response.text();
    return { response: text };
  } catch (error) {
    console.error("Error generating AI response:", error);
    const errorMessage = detectLanguage(prompt) === "bangla" 
      ? "দুঃখিত, এই মুহূর্তে উত্তর দিতে অসমর্থ। সার্ভার ব্যস্ত আছে, দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।" 
      : "Sorry, I couldn't generate a response at this time. The server is too busy, please try again later.";
    
    return { response: errorMessage };
  }
};

// Generate a chat name based on the initial prompt
export const generateChatName = async (prompt) => {
  try {
    const model = await gemini.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    const language = detectLanguage(prompt);
    
    const namePrompt = language === "bangla"
      ? `এই প্রশ্ন থেকে একটি সংক্ষিপ্ত চ্যাট নাম তৈরি করুন (সর্বোচ্চ ৫টি শব্দ): "${prompt}". শুধুমাত্র নামটি দিন, কোটেশন মার্ক বা অতিরিক্ত টেক্সট ছাড়া।`
      : `Generate a very short, concise chat name (maximum 5 words) based on this student query: "${prompt}". Return only the name, with no quotation marks or additional text.`;
    
    const result = await model.generateContent(namePrompt);
    const chatName = result.response.text().trim();
    
    // If the name is too long, truncate it
    return chatName.length > 50 ? chatName.substring(0, 47) + "..." : chatName;
  } catch (error) {
    console.error("Error generating chat name:", error);
    return "New Conversation";
  }
};

// Start a New Chat (with optional image)
export const startNewChat = async (userId, prompt, imagePath = null) => {
  // Create a new chat with default values
  const chat = new Chat({ userId });
  const chatId = chat._id;
  
  console.log("chatId", chatId);
  console.log("userId", userId);
  console.log("prompt", prompt);
  console.log("imagePath", imagePath);
  
  if (!chatId || chatId === "null") {
    throw new Error("Invalid chatId");
  }
  
  // Generate a chat name
  const chatName = await generateChatName(prompt);
  chat.chatName = chatName;
  
  // Create user message
  const userMessage = await Message.create({
    chatId,
    sender: "user",
    text: prompt,
    image: imagePath ? `/uploads/${imagePath.split('/').pop()}` : null
  });
  
  // Generate AI response
  const aiResponse = await generateAiResponse(prompt, imagePath);
  
  // Create AI message
  const aiMessage = await Message.create({
    chatId,
    sender: "ai",
    text: aiResponse.response,
  });
  
  // Save the chat with the generated name
  await chat.save();
  
  return { chatId, chatName, messages: [userMessage, aiMessage] };
};

// Resume Existing Chat (with optional image)
export const continueChat = async (chatId, prompt, imagePath = null) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  
  // Get previous chat history to maintain context
  const previousMessages = await Message.find({ chatId }).sort({ createdAt: 1 });
  const chatHistory = previousMessages.map(msg => ({
    role: msg.sender === "user" ? "user" : "model",
    content: msg.text
  }));
  
  // Create the new user message
  const userMessage = await Message.create({
    chatId,
    sender: "user",
    text: prompt,
    image: imagePath ? `/uploads/${imagePath.split('/').pop()}` : null
  });
  
  // Generate AI response with context from previous conversation
  const aiResponse = await generateAiResponse(prompt, imagePath);
  
  const aiMessage = await Message.create({
    chatId,
    sender: "ai",
    text: aiResponse.response,
  });
  
  return { chatId, chatName: chat.chatName, messages: [userMessage, aiMessage] };
};

// Fetch Existing Chat
export const fetchChat = async (chatId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  
  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
  
  return { chatId, messages, chatName: chat.chatName };
};
