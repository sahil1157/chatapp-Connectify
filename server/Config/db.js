import mongoose from "mongoose";
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

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
