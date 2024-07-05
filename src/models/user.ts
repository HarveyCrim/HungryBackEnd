import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    auth0Id : {
        type : String,
    },
    email : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    address : {
        type : String,
    },
    city : {
        type : String
    },
    country : {
        type : String,
    }
})

export const userModel = mongoose.model("User", userSchema)