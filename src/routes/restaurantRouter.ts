import express from "express"
import { authMiddleware } from "../middlewares/auth"
import resContoller from "../controllers/ResController"
const resRouter = express.Router()

resRouter.post("/save", authMiddleware, resContoller.saveRestaurant)
resRouter.get("/", authMiddleware, resContoller.getRestaurant)
resRouter.get("/restaurants", authMiddleware, resContoller.getRestaurants)
resRouter.post("/restaurants/city", authMiddleware, resContoller.getRestaurantsInCity)
resRouter.get("/restaurants/single/:id", authMiddleware, resContoller.getSingleRestaurant)
export default resRouter 