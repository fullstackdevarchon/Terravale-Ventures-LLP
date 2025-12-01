import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const checkCollections = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI not found in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("\n📂 Existing Collections:");
        collections.forEach(c => console.log(` - ${c.name}`));

        const countLabour = await mongoose.connection.db.collection("labour").countDocuments();
        const countLabours = await mongoose.connection.db.collection("labours").countDocuments();

        console.log(`\n📊 Document Counts:`);
        console.log(` - Collection 'labour': ${countLabour}`);
        console.log(` - Collection 'labours': ${countLabours}`);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkCollections();
