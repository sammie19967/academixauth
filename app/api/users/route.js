import dbConnect from "@/lib/dbConnect";
import User from "@/models/User"; // We'll create this model
import { NextResponse } from "next/server";

// POST: Create or upsert user
export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const {
    uid,
    email,
    displayName,
    phoneNumber,
    photoURL,
    firstName,
    lastName,
    role,
    university,
    college,
    department,
    course,
    yearOfStudy,
    semester,
    unit
  } = body;
  if (!uid || !email) {
    return NextResponse.json({ error: "Missing uid or email" }, { status: 400 });
  }
  const user = await User.findOneAndUpdate(
    { uid },
    {
      uid,
      email,
      displayName,
      phoneNumber,
      photoURL,
      firstName,
      lastName,
      role: role || "user",
      university,
      college,
      department,
      course,
      yearOfStudy,
      semester,
      unit
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json({ user });
}

// DELETE: Delete user
export async function DELETE(req) {
  await dbConnect();
  const { uid } = await req.json();
  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }
  await User.deleteOne({ uid });
  return NextResponse.json({ success: true });
}
// GET: Get user
export async function GET(req) {
  await dbConnect();
  const { uid } = await req.json();
  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }
  const user = await User.findOne({ uid });
  return NextResponse.json({ user });
}
// GET: Get all users
