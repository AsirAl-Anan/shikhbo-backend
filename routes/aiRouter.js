import { Router } from "express";
import { protectedRoute } from "../middlewares/Auth.middleware.js";
import { 
  startChatWithAi, 
  resumeChatWithAi, 
  getChatWithAi, 
  getAllChatWithAi,
  uploadImage
} from "../controllers/Ai.controller.js";
import upload from "../multer/multer.js";

const aiRouter = Router();

// Text-only endpoints (backward compatible)
aiRouter.post("/chat/query", protectedRoute, startChatWithAi);
aiRouter.post("/chat/:chatId/query", protectedRoute, resumeChatWithAi);

// Multimodal endpoints (with file upload)
aiRouter.post("/chat/query/multimodal", protectedRoute, upload.single('image'), startChatWithAi);
aiRouter.post("/chat/:chatId/query/multimodal", protectedRoute, upload.single('image'), resumeChatWithAi);

// Image upload endpoint
aiRouter.post("/upload", protectedRoute, upload.single('image'), uploadImage);

// Chat retrieval endpoints
aiRouter.post("/chat/getChat", protectedRoute, getChatWithAi);
aiRouter.get("/chat/getAllchat", protectedRoute, getAllChatWithAi);

export default aiRouter;