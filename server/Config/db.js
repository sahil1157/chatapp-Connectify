import mongoose from "mongoose";
import dotenv from 'dotenv';
import colors from 'colors';
import { v2 as cloudinary } from 'cloudinary'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(colors.yellow.bold('MongoDB connected'));
    } catch (error) {
        console.error(colors.red.bold(`Error connecting to MongoDB: ${error.message}`));
        process.exit(1);
    }
};

export default connectDB;
