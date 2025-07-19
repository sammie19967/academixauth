"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiLogOut } from "react-icons/fi";
import { signOut, onUserStateChange } from "../../lib/authMethods";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <FiUser className="text-indigo-500 text-5xl mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome{user && user.displayName ? `, ${user.displayName}` : "!"}</h2>
        {user && user.email && (
          <p className="text-gray-500 mb-4">{user.email}</p>
        )}
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium shadow transition"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}
