import mongoose from "mongoose"
const orderSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveryDetails: {
        email: String,
        name: String,
        address: String,
        city: String
    },
    cartItems: [
        {
            menuItemId: String,
            quantity: Number,
            name: String
        }
    ],
    status: {
        type: String,
        enum: ["placed", "inProgress", "outForDelivery", "delivered"]
    },
    totalAmount: Number
}, {
    timestamps: true
})

export const orderModel = mongoose.model("Order", orderSchema)
