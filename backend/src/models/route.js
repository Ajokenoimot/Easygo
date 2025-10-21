import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
  destination: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Route", routeSchema);
