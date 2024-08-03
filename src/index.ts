import  {Request, Response} from "express"
import express from "express"
import cors from "cors"
import "dotenv/config"
import mongoose, { mongo } from "mongoose"
import cookieParser from "cookie-parser"
import userRouter from "./routes/userRouter"
import resRouter from "./routes/restaurantRouter"
import orderRouter from "./routes/OrderRouter"

const app = express()
try{
    mongoose.connect(process.env.MONGO_URL!)
}
catch(err){
    console.log(err)
}
app.use(cors())
app.use(cookieParser())
app.get("/health", (req: Request, res: Response) => {
    res.send({"message" : "healthy"})
})
app.use("/api/orders/checkout/webhook", express.raw({type: "*/*"}))
// app.use()
app.use(express.json())
app.use("/api/user", userRouter)
app.use("/api/res", resRouter)
app.use("/api/orders", orderRouter)
app.listen(process.env.PORT, () => console.log("listening"))