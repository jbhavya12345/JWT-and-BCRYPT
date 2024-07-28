import { z } from "zod";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const signUp = async (req, res) => {
  const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    pNo: z.string().length(10, "Phone number must be 10 digits long"),
  });

  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    const errorMessages = result.error.errors;
    return res.status(400).json({ errors: errorMessages });
  }

  const { name, email, password, pNo } = result.data;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "Email already in use" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const refreshToken = jwt.sign(
    { _id: new mongoose.Types.ObjectId() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
    }
  );

  // Create a new user
  const userData = new User({
    name,
    email,
    password: hashedPassword,
    pNo,
    refreshToken
  });

  await userData.save();

  const cookieOptions = {
    httpOnly: true,
    secure: true
  };

  res
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(201)
    .json({ success: true, refreshToken, data: "User registered successfully" });
};

export const logIn = async (req, res) => {
  const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
  });

  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    const errorMessages = result.error.errors.map((error) => error.message);
    return res.status(400).json({ errors: errorMessages });
  }

  const { email, password } = result.data;
  const refreshTokenCookie = req.cookies.refreshToken;

  if (refreshTokenCookie) {
    try {
      const decodedToken = jwt.verify(refreshTokenCookie, process.env.REFRESH_TOKEN_SECRET);
      const userWithToken = await User.findOne({ refreshToken: refreshTokenCookie });

      if (userWithToken) {
        const newRefreshToken = jwt.sign(
          { _id: userWithToken._id },
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
          }
        );

        const cookieOptions = {
          httpOnly: true,
          secure: true
        };

        return res
          .cookie("refreshToken", newRefreshToken, cookieOptions)
          .json("Token is right and you can go ahead");
      } else {
        return res.status(400).json("False Token");
      }
    } catch (error) {
      return res.status(400).json("Invalid Token");
    }
  }

  // Check if the user exists
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(400).json({ error: "Email not registered" });
  }

  // Compare the password
  const comparedPassword = await bcrypt.compare(password, existingUser.password);

  if (!comparedPassword) {
    return res.status(400).json({ error: "Email and password don't match" });
  }

  res.status(201).json({ success: true, data: "User logged in successfully" });
};
