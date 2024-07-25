import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "require all fields"]
    },
    email: {
        type: String,
        required: [true, "require all fields"],
        unique: [true, "email Already logedIn"]
        
    },
    password: {
        type: String,
        required: [true, "require all fields"]
        
    },
    pNo: {
        type: String,
        required: [true, "require all fields"],
        unique: [true, "phoneNumber Already registered"]

    }
}, {timestamps: true})

export const User = mongoose.model("User", userSchema);