"use client";

import GoogleIcon from '@mui/icons-material/Google';

import React, { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "../lib/authMethods"; // Adjust path as needed


const LoginPage = () => {
  const [step, setStep] = useState("email"); // email | phone | verify
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      setMessage("Login successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setMessage("Google login successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePhoneSendCode = async () => {
    try {
      setError("");
      setMessage("");
      setupRecaptcha();
      const result = await sendSMSCode(phoneNumber);
      setConfirmationResult(result);
      setStep("verify");
      setMessage("📲 Code sent to phone");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifySMSCode(confirmationResult, code);
      setMessage("✅ Phone verified and logged in!");
      setStep("email");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        {step === "email" && (
          <>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-sm">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Sign In
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">or</p>
              <button
                onClick={handleGoogleLogin}
                className="mt-3 w-full border flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100"
              >
                <GoogleIcon style={{ fontSize: 24 }} />
                Sign in with Google
              </button>
              <button
                onClick={() => setStep("phone")}
                className="mt-3 w-full border flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100"
              >
                📱 Sign in with SMS
              </button>
            </div>
          </>
        )}

        {step === "phone" && (
          <div className="space-y-4 mt-6">
            <input
              type="tel"
              placeholder="+2547XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div id="recaptcha-container"></div>
            <button
              onClick={handlePhoneSendCode}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Send Code
            </button>
            <button
              onClick={() => setStep("email")}
              className="w-full text-blue-600 hover:underline"
            >
              Back to Email Login
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4 mt-6">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerifyCode}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Verify Code
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm">
            Don’t have an account?{' '}
            <a href="/auth/users/signup" className="text-blue-600 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
