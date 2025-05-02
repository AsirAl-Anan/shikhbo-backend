import Router from "express";
import { createUser, updateUser, getUser, signInUser, logoutUser, deleteUser, startExam , getExamById} from "../controllers/User.controller.js";
import {protectedRoute} from "../middlewares/Auth.middleware.js";

const userRouter = Router();

// Public routes
userRouter.post('/signup',createUser);
userRouter.post('/signin',signInUser);
userRouter.post('/logout',logoutUser);
userRouter.get('/:email',getUser);

// Protected routes
userRouter.route('/:id').put(protectedRoute, updateUser);
userRouter.route('/:id').delete(protectedRoute, deleteUser);


// Exam routes
userRouter.route('/exam').post(protectedRoute, startExam);
userRouter.route('/exam/:examI').get(protectedRoute, getExamById);

export default userRouter;