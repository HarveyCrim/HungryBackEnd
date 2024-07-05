import { Request, Response } from "express";
import zod from "zod"
import { userModel } from "../models/user";
import jwt, {Secret} from "jsonwebtoken"

const createCurrentUser = async (req: Request, res: Response) => {
    const zodSchema = zod.object({
        auth0Id : zod.string(),
        email : zod.string().email(),
        name : zod.string(),
        city : zod.string().optional(),
        address : zod.string().optional(),
        country : zod.string().optional()
    })
    const {success} = zodSchema.safeParse(req.body)
    if(!success){
        res.json({"message" : "invalid input"})
    }
    let userAlready = await userModel.findOne(req.body)
    if(!userAlready){
        userAlready = await userModel.create(req.body)
    }

    let token: string = jwt.sign({id: userAlready?.email}, process.env.JWT_SECRET as Secret)
    token = "Bearer "+token
    const obj = {userAlready, token}
    res.json(obj)
}
const editCurrentUser = async (req: Request, res: Response) => {
    const zodSchema = zod.object({
        address : zod.string(),
        city : zod.string(),
        country: zod.string(),
        email: zod.string().email().optional(),
        name: zod.string().optional()
    })
    const {success} = zodSchema.safeParse(req.body)
    if(!success){
        res.json({"message" : "invalid request input"})
    }
    const email = res.locals.signed.id
    const updated = await userModel.updateOne({email}, req.body)
    res.json(updated)
}

const returnCurrentUser = async(req: Request, res: Response) => {
    console.log("in here")
    const id = res.locals.signed.id
    const userDoc = await userModel.findOne({email : id})
    res.json(userDoc)
}

export default {
    createCurrentUser,
    editCurrentUser,
    returnCurrentUser
}