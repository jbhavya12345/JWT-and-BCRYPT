import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "./routes/user.route.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_DB_STRING);

const app = express();

// Configure CORS options if necessary
const corsOptions = {
  Credential: true,
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

// Use CORS middleware
app.use(cors(corsOptions));

// Use middleware to parse JSON request bodies
app.use(express.json());

app.use("/user", router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
