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

// AI Response Generator with multimodal support
export const generateAiResponse = async (prompt, imagePath = null) => {
  try {
    const model = await gemini.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    
    let result;
    if (imagePath) {
      // Multimodal request with text and image
      const imageData = processImage(imagePath);
      result = await model.generateContent([prompt, imageData]);
    } else {
      // Text-only request
      result = await model.generateContent(prompt);
    }
    
    const response = result.response;
    const text = response.text();
    return { response: text };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return { 
      response: "Sorry, I couldn't generate a response at this time. The server is too busy, try again later" 
    };
  }
};

// Generate a chat name based on the initial prompt
export const generateChatName = async (prompt) => {
  try {
    const model = await gemini.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    const namePrompt = `Generate a very short, concise chat name (maximum 5 words) based on this user query: "${prompt}". Return only the name, with no quotation marks or additional text.`;
    
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
  
  const userMessage = await Message.create({
    chatId,
    sender: "user",
    text: prompt,
    image: imagePath ? `/uploads/${imagePath.split('/').pop()}` : null
  });
  
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