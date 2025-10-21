import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  displayName: String,
});
const User = mongoose.model("User", UserSchema);

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, displayName });
    res.json({ message: "Account created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, { httpOnly: true, secure: false });
    res.json({ message: "Login successful" });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

// Video generation route (static demo for now)
app.post("/api/generate-video", async (req, res) => {
  const { destination } = req.body;
  if (!destination)
    return res.status(400).json({ error: "Destination required" });

  // Replace with AI-generated video later (e.g., Replicate API)
  const videoUrl =
    "https://player.vimeo.com/external/367095674.sd.mp4?s=b2a13b4b5a&profile_id=165";
  res.json({ videoUrl });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
