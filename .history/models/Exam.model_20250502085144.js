import { CqSchema } from "./Cq.model.js";
import { mcqSchema } from "./Mcq.model.js";


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
    userId


    
  }, {
    timestamps: true,
  });
  
  const Exam = mongoose.model('Exam', examSchema);
  export default Exam;