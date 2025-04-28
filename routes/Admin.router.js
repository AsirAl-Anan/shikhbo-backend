import express from 'express';
import { 
  adminSignin, 
  addCq, 
  getDashboardStats ,
  getSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject ,
  getCq
} from '../controllers/Admin.controller.js';

const adminRouter = express.Router();

// Authentication route
adminRouter.post('/signin', adminSignin);

// Protected admin routes
adminRouter.post('/cq', addCq);
adminRouter.get('/cq', getCq);
adminRouter.get('/dashboard-stats', getDashboardStats);
adminRouter.get('/subject', getSubjects);
adminRouter.post('/subject', createSubject);
adminRouter.put('/subject/:id', updateSubject);
adminRouter.delete('/subject/:id', deleteSubject);
export default adminRouter;