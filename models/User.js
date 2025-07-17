import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: String,
  phoneNumber: String,
  photoURL: String,
  // Add any other fields you need here
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);