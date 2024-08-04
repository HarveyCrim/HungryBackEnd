import express from "express"
import OrderController from "../controllers/OrderController"
import { authMiddleware } from "../middlewares/auth"
const orderRouter = express.Router()
orderRouter.post("/createCheckout", authMiddleware, OrderController.createCheckoutSession)
orderRouter.post("/checkout/webhook", OrderController.stripeHandler)
orderRouter.get("/allOrders", authMiddleware, OrderController.getMyOrders)
orderRouter.patch("/updateOrder", authMiddleware, OrderController.updateOrder)
orderRouter.get("/allOrdersRes", authMiddleware, OrderController.getMyOrdersRes)
export default orderRouter