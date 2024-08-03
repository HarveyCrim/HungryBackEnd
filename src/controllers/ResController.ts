import {Request, Response} from "express"
import { userModel } from "../models/user"
import resModel from "../models/restaurant"
import  {clist}  from "../../cuisines"
const saveRestaurant = async (req: Request, res: Response) => {
    let cuisinesAct = []
    for(let i = 0; i < clist?.length; i++){
        if(req.body.cuisines[i]){
            cuisinesAct.push(clist[i])
        }
    }
    req.body.cuisineList = cuisinesAct
    const email = res.locals.id
    const user = await userModel.findOne({email})
    const restaurant = await resModel.findOne({userId:user?._id})
    if(restaurant){
        const updRes = await resModel.findByIdAndUpdate(restaurant._id, req.body, {new : true})
        res.json(updRes)
    }
    else{
        req.body.userId = user?._id
        const resNew =  await resModel.create(req.body)
        res.json(resNew)
    }
}

const getRestaurant = async (req: Request, res: Response) => {
    const user = await userModel.findOne({email : res.locals.id})
    const rest = await resModel.findOne({userId: user?._id})
    res.json(rest)
}

const getSingleRestaurant = async (req: Request, res: Response) => {
    const {id} = req.params
    const restaurant = await resModel.findById(id)
    res.json(restaurant)
}

const getRestaurants = async (req: Request, res: Response) => {
    if(req.body.cuisineFilter){
        const rests = await resModel.find({
            city : req.body.city,
            cuisines : true
        })
        res.json(rests)
    }
    else{
        const rests = await resModel.find(req.body)
        res.json(rests)
    }
}

const getRestaurantsInCity = async (req: Request, res: Response) => {
    let queryObj: any = {}
    queryObj["city"] = req.body.city
    const actpage = Number(req.query.page)
    if(req.body.name.length > 0){
        queryObj["name"] = new RegExp(req.body.name ,'i')
    }
    if(req.body.cuisineList.length > 0){
        queryObj["cuisineList"] = {$all : req.body.cuisineList}
        console.log(req.body.cuisineList)
    }
    
    const total = await resModel.countDocuments(queryObj)
    let restaurants = null
    if(req.body.sort.length > 0)
        restaurants = await resModel.find(queryObj).sort({[req.body.sort] : 1}).skip((actpage - 1) * 5).limit(5)
    else
        restaurants = await resModel.find(queryObj).skip((actpage - 1) * 5).limit(5)
    res.json({restaurants, total})
}
export default {
    saveRestaurant,getRestaurant, getRestaurants, getRestaurantsInCity, getSingleRestaurant
}
