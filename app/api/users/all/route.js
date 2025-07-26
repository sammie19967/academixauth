import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getAuth } from 'firebase-admin/auth';

export async function GET(req) {
    // Check Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '');
    let decoded;
    try {
        decoded = await getAuth().verifyIdToken(idToken);
        if (decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }
    } catch (e) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    await dbConnect();
    const users = await User.find({});
    return NextResponse.json({ users });
}