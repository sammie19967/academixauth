import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  updateProfile  // ADD THIS MISSING IMPORT
} from "firebase/auth";
import { auth } from "./firebase";

//
// ==== EMAIL/PASSWORD AUTH ===
//
export async function signUpWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Sync user to MongoDB
    try {
      console.log("[DEBUG] Syncing user to MongoDB:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
      });
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
        }),
      });
      const data = await res.json();
      console.log("[DEBUG] MongoDB sync response:", data);
    } catch (e) {
      console.warn("Failed to sync user to MongoDB:", e);
    }
    return user;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error));
  }
}

export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user status to active in database
    if (user) {
      const token = await user.getIdToken();
      try {
        await fetch('/api/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            uid: user.uid,
            status: 'active'
          })
        });
      } catch (e) {
        console.error('Error updating user status on login:', e);
        // Continue with login even if status update fails
      }
    }
    
    // Sync user to MongoDB
    try {
      console.log("[DEBUG] Syncing user to MongoDB:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
      });
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
          role: "user",
          status: "active"
        }),
      });
      const data = await res.json();
      console.log("[DEBUG] MongoDB sync response:", data);
    } catch (e) {
      console.warn("Failed to sync user to MongoDB:", e);
    }
    
    return user;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error));
  }
}

//
// ==== GOOGLE AUTH ===
//
const provider = new GoogleAuthProvider();
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Sync user to MongoDB
    try {
      console.log("[DEBUG] Syncing Google user to MongoDB:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
      });
      const token = await user.getIdToken();
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: "user",
          status: "active"
        }),
      });
      const data = await res.json();
      console.log("[DEBUG] MongoDB sync response:", data);
    } catch (e) {
      console.warn("Failed to sync Google user to MongoDB:", e);
    }
    
    return user;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error));
  }
}

//
// ==== PHONE AUTH - IMPROVED ===
//
export function setupRecaptcha(containerId = "recaptcha-container") {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      reject(new Error("Window or document not available"));
      return;
    }

    // Clean up existing verifier
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      } catch (e) {
        console.warn("Could not clear existing reCAPTCHA verifier:", e);
      }
    }

    const initializeRecaptcha = () => {
      const container = document.getElementById(containerId);
      if (!container) {
        reject(new Error(`Container with ID "${containerId}" not found`));
        return;
      }

      try {
        const recaptchaConfig = {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved:", response);
            resolve(response);
          },
          'expired-callback': () => {
            console.warn("reCAPTCHA expired. Please solve again.");
            reject(new Error("reCAPTCHA expired"));
          },
          'error-callback': (error) => {
            console.error("reCAPTCHA error:", error);
            reject(error);
          }
        };

        // In development, use a test key and set the badge to be invisible
        if (process.env.NODE_ENV === 'development') {
          recaptchaConfig.badge = 'bottomleft';  // Hide the badge in development
          recaptchaConfig.theme = 'dark';        // Make it less obtrusive
        }

        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, recaptchaConfig);
        
        // In development, automatically resolve after a short delay to bypass verification
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Auto-verifying reCAPTCHA');
          window.recaptchaVerifier.render().then(widgetId => {
            window.recaptchaVerifier.verify().then(resolve).catch(reject);
          });
          return;
        }

        // Render the reCAPTCHA
        window.recaptchaVerifier.render()
          .then((widgetId) => {
            window.recaptchaWidgetId = widgetId;
            console.log("reCAPTCHA rendered successfully with widget ID:", widgetId);
            resolve(widgetId);
          })
          .catch((error) => {
            console.error("Failed to render reCAPTCHA:", error);
            reject(error);
          });
      } catch (error) {
        console.error("Failed to create reCAPTCHA verifier:", error);
        reject(error);
      }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeRecaptcha);
    } else {
      // DOM is already ready
      setTimeout(initializeRecaptcha, 100);
    }
  });
}

export async function sendSMSCode(phoneNumber) {
  if (typeof window === "undefined") {
    throw new Error("This function can only be called in a browser environment");
  }

  if (!window.recaptchaVerifier) {
    throw new Error("reCAPTCHA is not initialized. Please call setupRecaptcha() first.");
  }

  // Format phone number (ensure it starts with country code)
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  try {
    console.log("Sending SMS to:", formattedPhone);
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
    console.log("SMS sent successfully");
    return confirmationResult;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    
    // Clean up reCAPTCHA on error
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      } catch (e) {
        console.warn("Could not clear reCAPTCHA verifier after error:", e);
      }
    }
    
    throw new Error(getFriendlyErrorMessage(error));
  }
}

export async function verifySMSCode(confirmationResult, code) {
  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    // Sync user to MongoDB with active status
    try {
      const token = await user.getIdToken();
      // Generate a placeholder email for phone users if none exists
      const userEmail = user.email || `phone-${user.uid.replace(/[^a-zA-Z0-9]/g, '')}@phone-user.academix`;
      
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: userEmail,
          phoneNumber: user.phoneNumber,
          displayName: `Phone User (${user.phoneNumber})`,
          role: "user",
          status: "active"
        }),
      });
      const data = await res.json();
      console.log("Phone auth user sync response:", data);
    } catch (e) {
      console.warn("Failed to sync phone auth user:", e);
    }
    
    return user;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error));
  }
}

export function cleanupRecaptcha() {
  if (typeof window !== "undefined" && window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
      delete window.recaptchaVerifier;
      delete window.recaptchaWidgetId;
    } catch (e) {
      console.warn("Could not clean up reCAPTCHA verifier:", e);
    }
  }
}

//
// ==== LOGOUT ===
//
export async function logout() {
  try {
    // Clean up reCAPTCHA on logout
    cleanupRecaptcha();
    
    // Update user status to inactive before signing out
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        await fetch('/api/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            uid: user.uid, 
            status: 'inactive' 
          })
        });
      } catch (e) {
        console.error('Error updating user status on logout:', e);
        // Continue with logout even if status update fails
      }
    }
    
    // Sign out from Firebase
    return await signOut(auth);
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
}

export { logout as signOut };

//
// ==== CURRENT USER ===
//
export function getCurrentUser() {
  return auth.currentUser;
}

// Update Firebase user profile and sync to MongoDB
export async function updateUserProfile({ displayName, photoURL, phoneNumber }) {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  
  // Update Firebase profile
  await updateProfile(user, { displayName, photoURL });
  
  // Sync user to MongoDB
  try {
    const userPayload = {
      uid: user.uid,
      email: user.email,
      displayName: displayName ?? user.displayName,
      phoneNumber: phoneNumber ?? user.phoneNumber,
      photoURL: photoURL ?? user.photoURL,
    };
    console.log("[DEBUG] updateUserProfile: Syncing to MongoDB:", userPayload);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });
    const data = await res.json();
    console.log("[DEBUG] updateUserProfile: MongoDB sync response:", data);
  } catch (e) {
    console.warn("Failed to sync updated user to MongoDB:", e);
  }
  return user;
}

//
// ==== AUTH STATE CHANGE ===
//
export function onUserStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

//
// ==== FRIENDLY ERROR MESSAGES ===
//
function getFriendlyErrorMessage(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return "No user found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/invalid-verification-code":
      return "The verification code is invalid.";
    case "auth/missing-verification-code":
      return "Please enter the verification code.";
    case "auth/invalid-phone-number":
      return "Phone number is invalid. Make sure to include country code (e.g., +1234567890).";
    case "auth/missing-phone-number":
      return "Please provide a phone number.";
    case "auth/code-expired":
      return "The verification code has expired. Please request a new one.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA verification failed. Please try again.";
    case "auth/missing-app-credential":
      return "Phone authentication requires app verification.";
    default:
      console.error("Auth error:", error);
      return error.message || "Something went wrong. Please try again.";
  }
}