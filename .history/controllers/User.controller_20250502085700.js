import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import Cq from "../models/Cq.model.js";
import MCQ from "../models/Mcq.model.js";
// Create a new user
export const createUser = async (req, res) => {
  const {  email, password,username } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });
   let newUser
   
    if(password){
     newUser = new User({ 
      username,
      email, 
      password,
    //  avatar: avatar || undefined
    });
  } else {
    newUser = new User({ 
      username,
      email, 
     
    //  avatar: avatar || undefined
    });
  }

    await newUser.save();
   
   

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
       sameSite:"None",
        maxAge: 7 * 24 * 60 * 60 * 1000 //
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite:"None",
      maxAge: 30 * 24 * 60 * 60 * 1000 //
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// Sign in user
export const signInUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("SignIn Request:", req.body);
  console.log("Email:", email);
  try {
    const user = await User.findOne({ email }).select('+password');
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
  
    console.log("Access Token in signIn:", accessToken);
    console.log("Refresh Token:", refreshToken);

    // Set cookies correctly
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
       sameSite:"None",
        maxAge: 7 * 24 * 60 * 60 * 1000 //
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite:"None",
        maxAge: 30 * 24 * 60 * 60 * 1000 //
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

   
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by email
export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({email: req.params.email}).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user by ID
export const updateUser = async (req, res) => {
  const { name, email, password, studentData } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (studentData) user.studentData = { ...user.studentData, ...studentData };

    const updatedUser = await user.save();
    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        studentData: updatedUser.studentData,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout user
export const logoutUser = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/// exam related functions


export const startExam = async (req, res) => {
  const { subject,mcqCount,cqCount, examDuration,examType } = req.body;
 

  try {
    console.log("Subject:", subject);
  } catch (error) {
    console.error("Error starting exam:", error);
    res.status(500).json({ message: "Server error while creating exam", error: error.message });
    
  }
 }

 export const startExam = async (req, res) => {
  const { subject, mcqCount, cqCount, examDuration, examType, userId } = req.body;
 
  try {
    console.log("Subject:", subject);
    
    if (!subject || !examDuration || !examType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject, exam duration, and exam type are required' 
      });
    }
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required to start an exam' 
      });
    }

    // Initialize exam data
    const examData = {
      subject,
      duration: examDuration,
      userId,
      startTime: new Date(),
      endTime: new Date(Date.now() + examDuration * 60 * 1000), // Convert minutes to milliseconds
      totalMarks: 0,
      passingMarks: 0,
      mcqs: [],
      cqs: []
    };

    // Initialize questions based on exam type
    if (examType === 'mcq' || examType === 'both') {
      if (!mcqCount || mcqCount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'MCQ count must be greater than 0 for MCQ or both exam types' 
        });
      }
      
      // Fetch random MCQs based on subject
      const mcqs = await MCQ.aggregate([
        { $match: { subject: subject } },
        { $sample: { size: mcqCount } }
      ]);
      
      if (mcqs.length < mcqCount) {
        return res.status(404).json({
          success: false,
          message: `Not enough MCQs available for subject ${subject}. Requested: ${mcqCount}, Available: ${mcqs.length}`
        });
      }
      
      examData.mcqs = mcqs;
      examData.totalMarks += mcqs.length; // Assuming 1 mark per MCQ
    }
    
    if (examType === 'cq' || examType === 'both') {
      if (!cqCount || cqCount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'CQ count must be greater than 0 for CQ or both exam types' 
        });
      }
      
      // Fetch random CQs based on subject
      const cqs = await Cq.aggregate([
        { $match: { subject: subject } },
        { $sample: { size: cqCount } }
      ]);
      
      if (cqs.length < cqCount) {
        return res.status(404).json({
          success: false,
          message: `Not enough CQs available for subject ${subject}. Requested: ${cqCount}, Available: ${cqs.length}`
        });
      }
      
      examData.cqs = cqs;
      examData.totalMarks += cqs.length * 10; // Assuming 10 marks per CQ (based on 4 sub-questions)
    }
    
    // Calculate passing marks (e.g., 40% of total marks)
    examData.passingMarks = Math.ceil(examData.totalMarks * 0.4);
    
    // Create and save the exam
    const newExam = new Exam(examData);
    await newExam.save();
    
    return res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: newExam
    });
    
  } catch (error) {
    console.error("Error starting exam:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating exam", 
      error: error.message 
    });
  }
};