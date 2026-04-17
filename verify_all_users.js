import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './backend/models/user.model.js';

dotenv.config();

const fixAuth = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // Force 'isVerified' to true for everyone who is locked out
        const result = await User.updateMany({}, { $set: { isVerified: true } });
        console.log(`Updated ${result.modifiedCount} users to be verified!`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixAuth();
