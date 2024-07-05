import express from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middlewares/auth";
const userRouter = express.Router()

userRouter.post("/create", UserController.createCurrentUser)
userRouter.put("/edit", authMiddleware, UserController.editCurrentUser)
userRouter.get("/", authMiddleware, UserController.returnCurrentUser)
export default userRouter