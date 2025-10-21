import express from "express";
import Route from "../models/route.js";

const router = express.Router();

// Save route
router.post("/", async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all routes
router.get("/", async (req, res) => {
  const routes = await Route.find();
  res.json(routes);
});

export default router;
