"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiLogOut } from "react-icons/fi";
import { signOut, onUserStateChange } from "../../lib/authMethods";
import Modal from "../../components/Modal";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch full user profile from backend
  const fetchUserProfile = async (uid) => {
    const res = await fetch(`/api/users?uid=${encodeURIComponent(uid)}`);
    if (res.ok) {
      const { user: userProfile } = await res.json();
      return userProfile;
    }
    return null;
  };

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onUserStateChange((u) => {
      if (!u) {
        router.replace("/auth/users/login");
      } else {
        setUser(u);
        // Fetch profile from backend
        fetchUserProfile(u.uid).then(setProfile);
      }
    });
    return () => unsubscribe();
  }, [router]);
  
  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onUserStateChange((u) => {
      if (!u) {
        router.replace("/auth/users/login");
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/auth/users/login");
  };

  // Prefill with user data if available
  const initialValues = profile && user ? {
    ...profile,
    firstName: profile.firstName || user.displayName?.split(' ')[0] || '',
    lastName: profile.lastName || user.displayName?.split(' ')[1] || '',
    email: user.email || '',
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
  } : {};

  const handleModalSubmit = async (data) => {
    if (!user) return;
    // Remove MongoDB fields from data before sending
    const { _id, __v, createdAt, updatedAt, ...safeProfile } = data;
    // Always include uid and email
    const payload = { ...safeProfile, uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL, phoneNumber: user.phoneNumber };
    console.log('Frontend: Submitting user profile payload:', payload);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      // Re-fetch profile after update
      const { user: updatedProfile } = await res.json();
      setProfile(updatedProfile);
      setShowModal(false);
    } else {
      alert('Failed to update profile');
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <FiUser className="text-indigo-500 text-5xl mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome{user && user.displayName ? `, ${user.displayName}` : "!"}</h2>
        {user && user.email && (
          <p className="text-gray-500 mb-4">{user.email}</p>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="mb-2 flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded font-medium shadow transition"
        >
          Update Profile Details
        </button>
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium shadow transition"
        >
          <FiLogOut /> Logout
        </button>
      </div>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        initialValues={initialValues}
      />
    </div>
  );
}
