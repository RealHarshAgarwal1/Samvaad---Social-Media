import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './backend/models/user.model.js';

dotenv.config();

const clearUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const emailsToDelete = [
            'princegamer666@gmail.com',
            'harshagarwalcs@gmail.com',
            'samvaaddigital@gmail.com'
        ];

        const result = await User.deleteMany({ email: { $in: emailsToDelete } });
        console.log(`Deleted ${result.deletedCount} test accounts from the database!`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clearUsers();
