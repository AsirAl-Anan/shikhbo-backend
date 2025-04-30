
import Cq from '../models/Cq.model.js';
import User from '../models/User.model.js'; // Assuming you have a User model
import Subject from '../models/Subject.model.js';
// Admin signin controller
export const adminSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find admin user
    const admin = await User.findOne({ email , role: 'admin' });
    if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
  

    

    res.status(200).json({ 
      success: true, 
      user: adminData 
    });
  } catch (error) {
    console.error('Admin signin error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
export const getCq = async (req, res) => {
  const { subjectName } = req.params;

  try {
    const cqs = await Cq.find({ subject: subjectName });

    if (cqs.length === 0) {
      return res.status(404).json({ message: 'No questions found for this subject' });
    }

    res.status(200).json(cqs);
  } catch (error) {
    console.error('Get CQ error:', error);
    res.status(500).json({ message: 'Server error while fetching questions' });
  }
}

// Add new CQ controller
export const addCq = async (req, res) => {
  try {
    const {
      stem,
      a,
      b,
      c,
      d,
      board,
      year,
      subject,
      chapter,
      topic
    } = req.body;

    // Validate required fields
    if (!stem || !a?.question || !a?.answer || 
        !b?.question || !b?.answer || 
        !c?.question || !c?.answer || 
        !d?.question || !d?.answer || 
        !board || !year || !subject || !chapter || !topic) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new CQ
    const newCq = new Cq({
      stem,
      a,
      b,
      c,
      d,
      board,
      year,
      subject,
      chapter,
      topic
    });

    // Save to database
    await newCq.save();

    res.status(201).json({ 
      success: true, 
      message: 'Question added successfully',
      cq: newCq 
    });
  } catch (error) {
    console.error('Add CQ error:', error);
    res.status(500).json({ message: 'Server error while adding question' });
  }
};

// Get dashboard statistics controller
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts from database
    const userCount = await User.countDocuments();
    const questionCount = await Cq.countDocuments();

    res.status(200).json({
      userCount,
      questionCount
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
};


//subject controller


// Get all subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new subject

// Create a new subject
export const createSubject = async (req, res) => {
  try {
    const { name, chapters } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }
    
    const newSubject = new Subject({ 
      name,
      chapters: chapters || [] // Include the chapters array from the request
    });
    
    await newSubject.save();
    
    res.status(201).json(newSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
// Update a subject
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, chapters } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }
    
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { name, chapters }, // Include chapters in the update
      { new: true }
    );
    
    if (!updatedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.status(200).json(updatedSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a subject
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
