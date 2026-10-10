import mongoose from "mongoose";

const itemSchema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    date:{
        type: Date,
        default: Date.now
    }
})

const itemModel = mongoose.model('Items',itemSchema)

export default itemModel;