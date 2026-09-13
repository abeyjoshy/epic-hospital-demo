import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./src/routes/routes.js";

import mongooseClient from "./src/config/mongod.conf.js";

dotenv.config();

const app = express();
app.use(bodyParser.json({ type: ["application/json", "application/fhir+json"] }));
app.use(cors());
app.use(express.static("public"));

async function initializeServer() {
    try {
        // ROUTES
        app.use("/", routes);

        // START SERVER
        const port = process.env.PORT || 4000;
        app.listen(port, () => {
            console.log(`Epic Hospital local server is now listening at Port: ${port}`);
        });
    } catch (error) {
        console.error("Failed to initialize Epic Hospital server:", error);
        process.exit(1); // Exit the process with a failure co
    }
}
// CALL THE ASYNC INITIALIZATION FUNCTION
initializeServer();


// Connect to MongoDB
mongooseClient.connect()