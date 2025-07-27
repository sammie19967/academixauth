import { NextResponse } from 'next/server';
import admin from '@/middleware/firebaseAdmin';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the ID token using the admin instance from middleware
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Get the user record to check custom claims
      const userRecord = await admin.auth().getUser(decodedToken.uid);
      const isAdmin = userRecord.customClaims?.role === 'admin';
      
      if (!isAdmin) {
        return NextResponse.json(
          { isAdmin: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      // User is an admin
      return NextResponse.json({ 
        isAdmin: true,
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
      });
      
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { isAdmin: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
