// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String },
  phoneNumber: { type: String },
  photoURL: { type: String },

  // Extended fields
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  university: { type: String },
  college: { type: String },
  department: { type: String },
  course: { type: String },
  yearOfStudy: { type: String },
  semester: { type: String },
  unit: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
