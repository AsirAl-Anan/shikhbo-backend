// models/MCQ.js
import mongoose from "mongoose";

export const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },

  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },
  },

  correctOption: {
    type: String,
    required: true,
    enum: ['a', 'b', 'c', 'd'], // Only allow valid labels
  },

  subject: { type: String, required: true },
  board: { type: String, required: true },
  topic: { type: String, required: true },
    chapter: { type: String, required: true },
  year: { type: Number },
  
}, {
  timestamps: true,
});

const MCQ = mongoose.model("MCQ", mcqSchema);
export default MCQ;
