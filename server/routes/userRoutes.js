import express from "express";
import { getCars, getUserData, loginUser, registerUser ,getCarById} from "../controller/userContoller.js";
import { protect } from "../middleware/auth.js";
const userRouter=express.Router();
userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/data',protect,getUserData)
userRouter.get('/cars',protect,getCars)
userRouter.get('/cars/:id', getCarById);

export default userRouter