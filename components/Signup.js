

"use client";
import React, { useState } from "react";
import {
  signUpWithEmail,
  signInWithGoogle,
  setupRecaptcha,
  sendSMSCode,
  verifySMSCode,
} from "../lib/authMethods"; // adjust path as needed

export default function SignUp() {
  const [step, setStep] = useState("email"); // email | phone | verify
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleEmailSignUp = async () => {
    try {
      await signUpWithEmail(email, password);
      setMessage("✅ Signed up successfully!");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      setMessage("✅ Signed in with Google!");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  const handlePhoneSendCode = async () => {
    try {
      setupRecaptcha(); // attaches invisible recaptcha
      const result = await sendSMSCode(phoneNumber);
      setConfirmationResult(result);
      setStep("verify");
      setMessage("📲 Code sent to phone");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifySMSCode(confirmationResult, code);
      setMessage("✅ Phone verified and signed in!");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create your account</h2>
          <p className="text-gray-500">Sign up to get started</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center ${message.startsWith("✅") ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </div>
        )}

        {step === "email" && (
          <>
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <button
                onClick={handleEmailSignUp}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium shadow-md hover:shadow-indigo-200"
              >
                Sign Up with Email
              </button>
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with</span>
              </div>
            </div>
            <div className="grid gap-3">
              <button
                onClick={handleGoogleSignUp}
                className="w-full border border-gray-300 flex items-center justify-center gap-3 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.805 10.023h-9.765v3.956h5.584c-.24 1.308-1.447 3.84-5.584 3.84-3.36 0-6.089-2.782-6.089-6.22s2.729-6.221 6.089-6.221c1.914 0 3.2.815 3.937 1.516l2.692-2.605c-1.73-1.61-3.97-2.6-6.629-2.6-5.523 0-10 4.477-10 10s4.477 10 10 10c5.77 0 9.604-4.04 9.604-9.74 0-.654-.073-1.15-.162-1.609z"/></svg>
                Google
              </button>
              <button
                onClick={() => setStep("phone")}
                className="w-full border border-gray-300 flex items-center justify-center gap-3 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Phone Number
              </button>
            </div>
          </>
        )}

        {step === "phone" && (
          <div className="space-y-5">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                placeholder="+2547XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div id="recaptcha-container"></div>
            <button
              onClick={handlePhoneSendCode}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium shadow-md hover:shadow-indigo-200"
            >
              Send Verification Code
            </button>
            <button
              onClick={() => setStep("email")}
              className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-4"
            >
              ← Back to Email Signup
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-5">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <button
              onClick={handleVerifyCode}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium shadow-md hover:shadow-indigo-200"
            >
              Verify Code
            </button>
            <button
              onClick={() => setStep("phone")}
              className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-4"
            >
              ← Back to Phone Entry
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/auth/users/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
