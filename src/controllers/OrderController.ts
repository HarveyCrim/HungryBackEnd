import {Request, Response} from "express"
import resModel, { menuItemType } from "../models/restaurant"
import Stripe from "stripe"
import mongoose from "mongoose"
import { orderModel } from "../models/order"
import { userModel } from "../models/user"
const stripe = new Stripe(process.env.STRIPE_SECRET as string)
type checkoutRequest = {
    cartItems: {
        menuItemId: string,
        name: string,
        quantity: number,
    }[],
    deliveryDetails: {
        email: string,
        name: string,
        address: string,
        city: string
    },
    restaurantId: string,
    totalAmount: number
}

const createLineItems = (checkoutRequest: checkoutRequest, menuItems: menuItemType[]) => {

    // console.log(menuItems)
    // console.log(checkoutRequest.cartItems)
    const lineItems = checkoutRequest.cartItems.map((cartItem) => {
        let actItem = menuItems.find((item) => item.itemName === cartItem.name )
        // console.log(actItem)
        const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency: "cad",
                unit_amount: actItem?.itemPrice! * 100,
                product_data: {
                    name: actItem?.itemName as string
                }
            },
            quantity: cartItem.quantity
        } 
        // console.log(line_item)
        return line_item
    })
    
    return lineItems
}

const createCheckoutSession = async(req: Request, res: Response) => {
    try{
        const dataToSend: checkoutRequest = req.body
        const restaurant = await resModel.findById(req.body.restaurantId)
        const userId = res.locals.signed.id
        const userDoc = await userModel.findOne({email : userId})
        const lineitems = createLineItems(dataToSend, restaurant?.menuItems!)
        const order = await orderModel.create(
            {
                restaurant: restaurant?._id,
                user: userDoc?._id, 
                deliveryDetails: {
                    email: userDoc?.email,
                    name: userDoc?.email,
                    address: userDoc?.address,
                    city: userDoc?.city
                },
                cartItems:dataToSend.cartItems,
                status:"placed",
                totalAmount: dataToSend.totalAmount
            }
        )
        const session = await createStripeSession(lineitems, order._id.toString() , restaurant?.deliveryPrice as number, restaurant?._id.toString() as string)
        if(!session.url){
            res.status(500).json({message : "Error creating stripe session"})
        }
        res.json({url: session.url})
    }
    catch(error){
        res.status(500).json(error)
    }
}

const createStripeSession = async (lineItems: Stripe.Checkout.SessionCreateParams.LineItem[], orderId: string, deliveryPrice: number, resId: string) => {
    const sessionData = await stripe.checkout.sessions.create({
        line_items: lineItems,
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Delivery",
                    type: "fixed_amount",
                    fixed_amount: {
                        amount: deliveryPrice * 100,
                        currency: "cad"
                    }
                }
            }
        ],
        mode: "payment",
        metadata: {
            orderId,
            resId
        },
        success_url: `${process.env.FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/detail/${resId}?cancelled=true`
    })
    return sessionData
}

const stripeHandler = async (req: Request, res: Response) => {
    let event = null
    try{
        const sig = req.headers["stripe-signature"]
        event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_CLI_SECRET as string)
    }
    catch(err: any){
        console.log("error")
        console.log(err)
        res.json({error: err})
    }
    console.log(event)
    if(event?.type === "checkout.session.completed"){
       const updatedOrder = await orderModel.findByIdAndUpdate(event.data.object.metadata!.orderId, {status: "inProgress"}, {new: true})
    }
    res.status(200).send()
}

const getMyOrders = async (req: Request, res: Response) => {
    const user = await userModel.findOne({email : res.locals.signed.id})
    const orderList = await orderModel.find({user: user?._id}).populate("user").populate("restaurant")
    res.json(orderList)
}

const getMyOrdersRes = async (req: Request, res: Response) => {
    const {resId} = req.query
    console.log(resId)
    const orderList = await orderModel.find({restaurant: resId}).populate("user").populate("restaurant").sort({createdAt: 1})
    console.log(orderList)
    res.json(orderList)
}

const updateOrder = async (req: Request, res: Response) => {
    const {orderId, newStatus} = req.query
    const updatedOrder = await orderModel.findByIdAndUpdate(orderId, {status: newStatus}, {new : true})
    res.status(200).send()
}

export default {
    createCheckoutSession,
    stripeHandler,
    getMyOrders,
    updateOrder,
    getMyOrdersRes
}
