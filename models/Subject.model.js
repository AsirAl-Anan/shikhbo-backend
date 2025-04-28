import express from 'express';
import mongoose, { Schema } from 'mongoose';

const SubjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  chapters: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      topics: [
        {
          type: String,
          required: true,
          trim: true,
          unique: true,
        }
      ]
    }
  ]
});

const Subject = mongoose.model('Subject', SubjectSchema);
export default Subject;
