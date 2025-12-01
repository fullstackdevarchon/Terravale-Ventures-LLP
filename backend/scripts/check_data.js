import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const labours = await mongoose.connection.db.collection("labour").find({}).toArray();
        console.log("\n📄 Documents in 'labour' collection:");
        labours.forEach(l => console.log(` - ID: ${l._id}, Email: ${l.email}`));

        const laboursPlural = await mongoose.connection.db.collection("labours").find({}).toArray();
        if (laboursPlural.length > 0) {
            console.log("\n📄 Documents in 'labours' collection:");
            laboursPlural.forEach(l => console.log(` - ID: ${l._id}, Email: ${l.email}`));
        } else {
            console.log("\nStart 'labours' collection is empty.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkData();
