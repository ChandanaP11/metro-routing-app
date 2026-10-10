import mongoose from "mongoose";

const connetDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/MetroDB');
        console.log('connected to database....');
    } catch (error) {
        console.log(`${error}`);
    }
}

export default connetDB;