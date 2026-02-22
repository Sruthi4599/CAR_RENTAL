import express from "express";
import { getCars, getUserData, loginUser, registerUser ,getCarById} from "../controller/userContoller.js";
import upload from "../middleware/multer.js";
import { updateProfileImage,updateProfile } from "../controller/userContoller.js";
import { protect } from "../middleware/auth.js";
const userRouter=express.Router();
userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/data',protect,getUserData)
userRouter.get('/cars',getCars)
userRouter.get('/cars/:id', getCarById);
userRouter.put("/update-profile", protect,updateProfile);
userRouter.post(
  "/upload-image",
  protect,
  upload.single("image"),
  updateProfileImage
);
export default userRouter