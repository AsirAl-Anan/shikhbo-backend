import { startNewChat, continueChat } from "../services/AiService.js";

export const setupSocketIO = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("startChat", async ({ prompt, userId, imagePath = null }) => {
      try {
        const { chatId, messages, chatName } = await startNewChat(userId, prompt, imagePath);
        // Include chatName in the emitted data
        socket.emit("chatStarted", { chatId, messages, chatName });
      } catch (error) { 
        console.error("Error starting chat via socket:", error);
        socket.emit("error", { message: "Failed to start chat" });
      }
    });

    socket.on("sendMessage", async ({ chatId, prompt, imagePath = null }) => {
      try {
        const { messages, chatName } = await continueChat(chatId, prompt, imagePath);
        // Include chatName in the emitted data
        socket.emit("messageReceived", { chatId, messages, chatName });
      } catch (error) {
        console.error("Error sending message via socket:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};