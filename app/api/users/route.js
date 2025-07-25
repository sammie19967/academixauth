import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { setUserRole } from '@/middleware/setUserRole';

// GET /api/users?uid=xyz
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing UID parameter' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      console.log(`[API] User not found for UID: ${uid}`);
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    console.log(`[API] User found for UID: ${uid}`);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ 
      error: 'Server error while fetching user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST /api/users
export async function POST(req) {
  await dbConnect();
  
  try {
    const body = await req.json();
    console.log('[API] Received user data:', { uid: body.uid, email: body.email, hasOtherFields: Object.keys(body).length > 2 });

    // Validate required fields
    if (!body.uid) {
      return NextResponse.json({ error: 'Missing required field: uid' }, { status: 400 });
    }

    // For phone users, email might be auto-generated, so we'll be more flexible
    if (!body.email) {
      console.warn('[API] No email provided, this might be a phone user');
      return NextResponse.json({ error: 'Missing required field: email' }, { status: 400 });
    }

    // Clean the data - remove any undefined or null values
    const cleanData = Object.entries(body).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = typeof value === 'string' ? value.trim() : value;
      }
      return acc;
    }, {});

    // Ensure uid and email are always present
    if (!cleanData.uid || !cleanData.email) {
      return NextResponse.json({ 
        error: 'Invalid data: uid and email are required',
        received: { uid: !!cleanData.uid, email: !!cleanData.email }
      }, { status: 400 });
    }

    // Update displayName if firstName and lastName are provided
    if (cleanData.firstName && cleanData.lastName) {
      cleanData.displayName = `${cleanData.firstName} ${cleanData.lastName}`;
    }

    console.log('[API] Upserting user with clean data:', {
      uid: cleanData.uid,
      email: cleanData.email,
      fieldsCount: Object.keys(cleanData).length
    });

    const updatedUser = await User.findOneAndUpdate(
      { uid: cleanData.uid },
      { $set: cleanData },
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('[API] User upserted successfully:', { uid: updatedUser.uid, id: updatedUser._id });
    // Sync role to Firebase custom claims
    try {
      if (cleanData.role) {
        await setUserRole(cleanData.uid, cleanData.role);
      }
    } catch (firebaseErr) {
      console.error('[API] Failed to sync role to Firebase:', firebaseErr);
    }
    return NextResponse.json({ 
      user: updatedUser,
      success: true,
      message: 'User profile updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/users error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationErrors,
        success: false
      }, { status: 400 });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ 
        error: `Duplicate ${field}: This ${field} is already in use`,
        success: false
      }, { status: 409 });
    }

    // Generic error
    return NextResponse.json({ 
      error: 'Failed to update user profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      success: false
    }, { status: 500 });
  }
}

// PUT /api/users - Alternative endpoint for updates only (no upsert)
export async function PUT(req) {
  await dbConnect();
  
  try {
    const body = await req.json();
    
    if (!body.uid) {
      return NextResponse.json({ error: 'Missing required field: uid' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ uid: body.uid });
    if (!existingUser) {
      return NextResponse.json({ 
        error: 'User not found. Please create user first.',
        success: false
      }, { status: 404 });
    }

    // Clean the data
    const cleanData = Object.entries(body).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '' && key !== 'uid') {
        acc[key] = typeof value === 'string' ? value.trim() : value;
      }
      return acc;
    }, {});

    // Update displayName if firstName and lastName are provided
    if (cleanData.firstName && cleanData.lastName) {
      cleanData.displayName = `${cleanData.firstName} ${cleanData.lastName}`;
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid: body.uid },
      { $set: cleanData },
      { 
        new: true, 
        runValidators: true
      }
    );

    console.log('[API] User updated successfully:', { uid: updatedUser.uid });
    // Sync role to Firebase custom claims
    try {
      if (cleanData.role) {
        await setUserRole(body.uid, cleanData.role);
      }
    } catch (firebaseErr) {
      console.error('[API] Failed to sync role to Firebase:', firebaseErr);
    }
    return NextResponse.json({ 
      user: updatedUser,
      success: true,
      message: 'User profile updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/users error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationErrors,
        success: false
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to update user profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      success: false
    }, { status: 500 });
  }
}

// DELETE /api/users?uid=xyz - For admin purposes
export async function DELETE(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing UID parameter' }, { status: 400 });
  }

  try {
    const deletedUser = await User.findOneAndDelete({ uid });
    
    if (!deletedUser) {
      return NextResponse.json({ 
        error: 'User not found',
        success: false
      }, { status: 404 });
    }

    console.log('[API] User deleted successfully:', { uid });
    
    return NextResponse.json({ 
      message: 'User deleted successfully',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      success: false
    }, { status: 500 });
  }
}