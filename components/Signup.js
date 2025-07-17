"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithGoogle } from "../lib/authMethods";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const SignUpPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === "password") {
      const score = calculatePasswordStrength(value);
      setPasswordScore(score);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    
    // Length
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    
    // Complexity
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    return Math.min(score, 5);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords don't match", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }

    if (passwordScore < 3) {
      return toast.warning("Please choose a stronger password", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }

    setLoading(true);
    try {
      await signUpWithEmail(form.email, form.password);
      toast.success("🎉 Account created successfully! Redirecting to login...", {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      toast.error(`⚠️ ${err.message}`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("🎉 Signed in with Google! Redirecting...", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      toast.error(`⚠️ ${err.message}`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordScore <= 1) return "bg-red-500";
    if (passwordScore <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (!form.password) return "";
    if (passwordScore <= 1) return "Very Weak";
    if (passwordScore <= 2) return "Weak";
    if (passwordScore <= 3) return "Moderate";
    if (passwordScore <= 4) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Decorative header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Join Our Community</h1>
          <p className="text-blue-100 mt-1">Start your journey with us today</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleEmailSignup} className="space-y-5">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-indigo-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-indigo-300 text-indigo-700"
                />
              </div>
              
              {/* Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-indigo-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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
                {form.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-indigo-500">
                      <span>Password strength: {getPasswordStrengthText()}</span>
                      <span>{form.password.length}/12</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`} 
                        style={{ width: `${(passwordScore / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Confirm Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-indigo-500" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-indigo-300 text-indigo-700"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-500 hover:text-indigo-700 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
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
                  Creating Account...
                </>
              ) : "Sign Up"}
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
          
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-3 px-4 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <FcGoogle className="text-xl" />
            Sign up with Google
          </button>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a 
              href="/auth/users/login" 
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition duration-200"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;