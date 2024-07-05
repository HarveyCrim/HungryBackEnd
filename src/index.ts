import express, {Request, Response} from "express"
import cors from "cors"
import "dotenv/config"
import mongoose, { mongo } from "mongoose"
import cookieParser from "cookie-parser"
import userRouter from "./routes/userRouter"

const app = express()
try{
    mongoose.connect(process.env.MONGO_URL!)
}
catch(err){
    console.log(err)
}
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.get("/health", (req: Request, res: Response) => {
    res.send({"message" : "healthy"})
})

app.use("/api/user", userRouter)
app.listen(process.env.PORT, () => console.log("listening"))