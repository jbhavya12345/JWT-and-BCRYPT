import { z } from "zod";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

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

  const userData = new User({
    name,
    email,
    password: hashedPassword,
    pNo,
  });

  await userData.save();
  res.status(201).json({ success: true, data: "User registered successfully" });
};
export const logIn = async (req, res) => {
  const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
  });

  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    const errorMessages = result.error.errors;
    return res.status(400).json({ errors: errorMessages });
  }

  const { email, password } = result.data;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(400).json({ error: "Email not registered" });
  }

  // Hash the password
  const comparedPassword = await bcrypt.compare(password, existingUser.password);

  if(!comparedPassword){
    res.status(400).json({error: "Email and Password dosn't match"})
  }

  res.status(201).json({ success: true, data: "User logined successfully" });
};
