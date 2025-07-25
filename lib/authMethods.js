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
    return userCredential.user;
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
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
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
        });

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
    
    // Debug: Let's see what Firebase is actually returning
    console.log("[DEBUG] Raw Firebase user object:", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      providerId: user.providerId,
      isAnonymous: user.isAnonymous,
      metadata: user.metadata,
      providerData: user.providerData
    });
    
    // Wait a moment to ensure Firebase has fully populated the user object
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get fresh user data
    const currentUser = auth.currentUser;
    console.log("[DEBUG] Current user after wait:", {
      uid: currentUser?.uid,
      email: currentUser?.email,
      displayName: currentUser?.displayName,
      phoneNumber: currentUser?.phoneNumber,
      photoURL: currentUser?.photoURL
    });
    
    // Use the current user or fallback to result user
    const userToSync = currentUser || user;
    
    // Validate that we have the required uid
    if (!userToSync.uid) {
      console.error("[DEBUG] No UID found in user object");
      throw new Error("User authentication failed - no UID provided by Firebase");
    }
    
    // Sync user to MongoDB after successful phone verification
    try {
      const userPayload = {
        uid: userToSync.uid,
        email: userToSync.email || `phone-${userToSync.uid}@temp.local`, // Provide fallback email
        displayName: userToSync.displayName || `Phone User ${userToSync.phoneNumber}`,
        phoneNumber: userToSync.phoneNumber,
        photoURL: userToSync.photoURL || null,
        authProvider: 'phone',
      };
      
      console.log("[DEBUG] Final payload being sent to API:", userPayload);
      
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[DEBUG] API Error Response:", errorText);
        console.error("[DEBUG] Request payload was:", userPayload);
        throw new Error(`API responded with ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("[DEBUG] MongoDB sync response:", data);
      
      if (!data.success) {
        console.error("[DEBUG] API returned success: false", data);
      }
    } catch (e) {
      console.error("Failed to sync phone user to MongoDB:", e);
      // Don't throw the error to prevent auth from failing
    }
    
    return userToSync;
  } catch (error) {
    console.error("SMS verification failed:", error);
    throw new Error("Invalid verification code.");
  }
}

// Clean up reCAPTCHA when component unmounts or page changes
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
  // Clean up reCAPTCHA on logout
  cleanupRecaptcha();
  // Only sign out from Firebase, do not delete user from DB
  return await signOut(auth);
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