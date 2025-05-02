import { CqSchema } from "./Cq.model.js";
import { mcqSchema } from "./Mcq.model.js";
import express from 'express';
import mongoose, { Schema } from 'mongoose';

const examSchema = new mongoose.Schema({
   
    subject: { type: String, required: true },
    duration: { type: Number },
    mcqs: [mcqSchema],
    cqs: [CqSchema], // embedded CQ schema here
  
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },


    
  }, {
    timestamps: true,
  });
  
  const Exam = mongoose.model('Exam', examSchema);
  export default Exam;
