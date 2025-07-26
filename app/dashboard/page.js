"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiLogOut } from "react-icons/fi";
import { signOut, onUserStateChange } from "../../lib/authMethods";
import Modal from "../../components/Modal";
import Image from "next/image";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch full user profile from backend
  const fetchUserProfile = async (uid) => {
    try {
      const res = await fetch(`/api/users?uid=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const { user: userProfile } = await res.json();
        return userProfile;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  };

  // Check if user profile is incomplete
  const isProfileIncomplete = (profile, user) => {
    if (!profile) return true;
    
    // Define required fields for a complete profile
    const requiredFields = ['firstName', 'lastName', 'university', 'college', 'department'];
    
    // Check if any required field is missing or empty
    return requiredFields.some(field => !profile[field] || profile[field].trim() === '');
  };

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onUserStateChange(async (u) => {
      if (!u) {
        router.replace("/auth/users/login");
      } else {
        setUser(u);
        setLoading(true);
        
        // Fetch profile from backend
        const userProfile = await fetchUserProfile(u.uid);
        setProfile(userProfile);
        
        // Auto-show modal if profile is incomplete
        if (isProfileIncomplete(userProfile, u)) {
          setShowModal(true);
        }
        
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/auth/users/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Prefill modal with user data if available
  const getInitialValues = () => {
    if (!profile || !user) return {};
    
    return {
      ...profile,
      firstName: profile.firstName || user.displayName?.split(' ')[0] || '',
      lastName: profile.lastName || user.displayName?.split(' ')[1] || '',
      email: user.email || profile.email || '',
      uid: user.uid,
      displayName: user.displayName || profile.displayName || '',
      photoURL: user.photoURL || profile.photoURL || '',
      phoneNumber: user.phoneNumber || profile.phoneNumber || '',
      university: profile.university || '',
      college: profile.college || '',
      department: profile.department || '',
      course: profile.course || '',
      yearOfStudy: profile.yearOfStudy || '',
      semester: profile.semester || '',
      unit: profile.unit || '',
    };
  };

  const handleModalSubmit = async (data) => {
    if (!user) return;
    
    try {
      // Remove MongoDB fields from data before sending
      const { _id, __v, createdAt, updatedAt, ...safeProfile } = data;
      
      // Always include Firebase user data
      const payload = { 
        ...safeProfile, 
        uid: user.uid, 
        email: user.email || safeProfile.email,
        displayName: user.displayName || safeProfile.displayName,
        photoURL: user.photoURL || safeProfile.photoURL,
        phoneNumber: user.phoneNumber || safeProfile.phoneNumber 
      };
      
      console.log('Frontend: Submitting user profile payload:', payload);
      
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const { user: updatedProfile } = await res.json();
        setProfile(updatedProfile);
        setShowModal(false);
        
        // Show success message
        alert('Profile updated successfully!');
      } else {
        const errorData = await res.json();
        console.error('Failed to update profile:', errorData);
        alert(`Failed to update profile: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleModalClose = () => {
    // Only allow closing if profile is complete
    if (!isProfileIncomplete(profile, user)) {
      setShowModal(false);
    } else {
      // Show warning for incomplete profile
      const confirmClose = window.confirm(
        "Your profile is incomplete. Please fill in the required fields (Name, University, College, Department) to continue."
      );
      if (confirmClose) {
        setShowModal(false);
      }
    }
  };

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="text-indigo-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        {/* Profile Picture */}
        {user?.photoURL ? (
          <Image
            src={user.photoURL} 
            alt="Profile" 
            width={64}
            height={64}
            className="w-16 h-16 rounded-full mb-4 border-2 border-indigo-200"
          />
        ) : (
          <FiUser className="text-indigo-500 text-5xl mb-4" />
        )}
        
        {/* Welcome Message */}
        <h2 className="text-2xl font-bold mb-2 text-center">
          Welcome{user?.displayName ? `, ${user.displayName}` : "!"}
        </h2>
        
        {/* User Info */}
        {user?.email && (
          <p className="text-gray-500 mb-2 text-center">{user.email}</p>
        )}
        {user?.phoneNumber && (
          <p className="text-gray-500 mb-4 text-center">{user.phoneNumber}</p>
        )}
        
        {/* Profile Status */}
        {profile && (
          <div className="mb-4 text-center">
            {isProfileIncomplete(profile, user) ? (
              <span className="text-orange-600 text-sm font-medium">
                ⚠️ Profile Incomplete
              </span>
            ) : (
              <span className="text-green-600 text-sm font-medium">
                ✅ Profile Complete
              </span>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-2 flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded font-medium shadow transition w-full justify-center"
        >
          {isProfileIncomplete(profile, user) ? 'Complete Profile' : 'Update Profile Details'}
        </button>
        
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium shadow transition w-full justify-center"
        >
          <FiLogOut /> Logout
        </button>
      </div>
      
      {/* Profile Modal */}
      <Modal
        open={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialValues={getInitialValues()}
        title={isProfileIncomplete(profile, user) ? "Complete Your Profile" : "Update Profile"}
        subtitle={isProfileIncomplete(profile, user) ? "Please fill in your details to continue" : "Update your profile information"}
      />
    </div>
  );
}