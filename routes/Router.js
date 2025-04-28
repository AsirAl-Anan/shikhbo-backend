// routes/index.js
import { Router } from "express";
import userRouter from "./User.router.js";
import aiRouter from "./aiRouter.js";
import adminRouter from "./Admin.router.js";
const router = Router();

router.use('/users', userRouter);
router.use('/ai', aiRouter)
router.use('/admin', adminRouter)


export default router;