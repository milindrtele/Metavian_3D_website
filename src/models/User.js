import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  password: { type: String, required: true },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
