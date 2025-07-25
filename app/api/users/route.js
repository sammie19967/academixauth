import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // Ensure you have this DB connector
import User from '@/models/User';

// GET /api/users?uid=xyz
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing UID' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/users
export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  if (!body.uid || !body.email) {
    return NextResponse.json({ error: 'Missing required fields: uid and email' }, { status: 400 });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { uid: body.uid },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );
    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Failed to upsert user' }, { status: 500 });
  }
}
