import jwt, { Secret } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization
  const token = auth?.split(" ")[1]
  try{
    const signed = jwt.verify(token as string , process.env.JWT_SECRET as Secret)
    res.locals.signed = signed
    console.log('ver')
    next()
  }
  catch(err){
    console.log(err)
    res.json({
      "message" : "invalid token"
    })
  }
}