import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut,
    onAuthStateChanged
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
        await fetch("/api/users", {
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
      return result.user;
    } catch (error) {
      throw new Error(getFriendlyErrorMessage(error));
    }
  }
  
  //
  // ==== PHONE AUTH ===
  //
  export function setupRecaptcha(containerId = "recaptcha-container") {
    if (typeof window === "undefined" || typeof document === "undefined") return;
  
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Could not clear existing reCAPTCHA verifier:", e);
      }
      window.recaptchaVerifier = null;
    }
  
    const waitForElement = () => {
      const container = document.getElementById(containerId);
      if (container) {
        try {
          window.recaptchaVerifier = new RecaptchaVerifier(
            containerId,
            {
              size: "invisible", // use "normal" if you want a visible badge
              callback: (response) => {
                console.log("reCAPTCHA solved:", response);
              },
              'expired-callback': () => {
                console.warn("reCAPTCHA expired. Please solve again.");
              }
            },
            auth
          );
  
          window.recaptchaVerifier.render().then((widgetId) => {
            window.recaptchaWidgetId = widgetId;
          });
        } catch (error) {
          console.error("Failed to render reCAPTCHA:", error);
        }
      } else {
        setTimeout(waitForElement, 300);
      }
    };
  
    waitForElement();
  }
  
  export async function sendSMSCode(phoneNumber) {
    if (typeof window === "undefined" || !window.recaptchaVerifier) {
      throw new Error("reCAPTCHA is not ready. Please try again.");
    }
  
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      throw new Error(getFriendlyErrorMessage(error));
    }
  }
  
  export async function verifySMSCode(confirmationResult, code) {
    try {
      const result = await confirmationResult.confirm(code);
      return result.user;
    } catch (error) {
      throw new Error("Invalid verification code.");
    }
  }
  
  //
  // ==== LOGOUT ===
  //
  export async function logout() {
    const user = auth.currentUser;
    const result = await signOut(auth);
    if (user) {
      try {
        await fetch("/api/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid }),
        });
      } catch (e) {
        console.warn("Failed to delete user from MongoDB:", e);
      }
    }
    return result;
  }

  export { logout as signOut };

  //
  // ==== CURRENT USER ===
  //
  export function getCurrentUser() {
    return auth.currentUser;
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
        return "Phone number is invalid.";
      case "auth/missing-phone-number":
        return "Please provide a phone number.";
      case "auth/code-expired":
        return "The verification code has expired. Please request a new one.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  