import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const cleanup = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const collection = mongoose.connection.db.collection('users');

        console.log("Checking indexes...");
        const indexes = await collection.indexes();
        console.log("Current indexes:", indexes.map(i => i.name));

        if (indexes.find(i => i.name === 'clerkId_1')) {
            console.log("Dropping index clerkId_1...");
            await collection.dropIndex('clerkId_1');
            console.log("Index clerkId_1 dropped successfully.");
        } else {
            console.log("Index clerkId_1 not found. Nothing to drop.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error during cleanup:", error);
        process.exit(1);
    }
};

cleanup();
