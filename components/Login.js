"use client";
import GoogleIcon from '@mui/icons-material/Google';
import { FiMail, FiLock, FiPhone, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail, signInWithGoogle, setupRecaptcha, sendSMSCode, verifySMSCode } from "../lib/authMethods";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const router = useRouter();
  const [step, setStep] = useState("email"); // email | phone | verify
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success("🎉 Login successful! Redirecting...", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        theme: "colored",
      });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      toast.error(`⚠️ ${err.message}`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("🎉 Google login successful! Redirecting...", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        theme: "colored",
      });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      toast.error(`⚠️ ${err.message}`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "phone") {
      setupRecaptcha();
    }
  }, [step]);

  const handlePhoneSendCode = async () => {
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const result = await sendSMSCode(formattedPhone);
      setConfirmationResult(result);
      setStep("verify");
      toast.info("📲 Verification code sent to your phone", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "colored",
      });
    } catch (err) {
      toast.error(`⚠️ ${err.message}`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      await verifySMSCode(confirmationResult, code);
      toast.success("✅ Phone verified! Redirecting...", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        theme: "colored",
      });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      toast.error(`⚠️ ${err.message}`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        {/* Decorative header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-blue-100 mt-1">Sign in to continue your journey</p>
        </div>

        <div className="p-8">
          {step === "email" && (
            <>
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-indigo-500" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-indigo-300 text-indigo-700"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-indigo-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-indigo-300 text-indigo-700"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-500 hover:text-indigo-700 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : "Sign In"}
                </button>
              </form>

              <div className="my-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-3 px-4 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <GoogleIcon style={{ color: "#DB4437", fontSize: 20 }} />
                  Google
                </button>
                <button
                  onClick={() => setStep("phone")}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-3 px-4 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <FiPhone className="text-indigo-500" />
                  Phone Number
                </button>
              </div>
            </>
          )}

          {step === "phone" && (
            <div className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="text-indigo-500" />
                </div>
                <input
                  type="tel"
                  placeholder="+2547XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-indigo-300 text-indigo-700"
                />
              </div>
              
              <div id="recaptcha-container" className="hidden"></div>
              
              <button
                onClick={handlePhoneSendCode}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Code...
                  </>
                ) : "Send Verification Code"}
              </button>
              
              <button
                onClick={() => setStep("email")}
                className="w-full flex items-center justify-center text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2"
              >
                <FiArrowLeft className="mr-1" /> Back to Email Login
              </button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-indigo-500" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-indigo-300 text-indigo-700"
                />
              </div>
              
              <button
                onClick={handleVerifyCode}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : "Verify Code"}
              </button>
              
              <button
                onClick={() => setStep("phone")}
                className="w-full flex items-center justify-center text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2"
              >
                <FiArrowLeft className="mr-1" /> Back to Phone Entry
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a 
              href="/auth/users/signup" 
              className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition duration-200"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;