import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "firebase/auth";
import { auth } from "./firebase";

// EMAIL/PASSWORD
export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// GOOGLE
const provider = new GoogleAuthProvider();
export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

// PHONE/SMS
// Call this once to render the reCAPTCHA widget (containerId should match a div in your HTML)
export function setupRecaptcha(containerId = "recaptcha-container") {
  window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  }, auth);
}

// Send SMS code to phone number
export function sendSMSCode(phoneNumber) {
  const appVerifier = window.recaptchaVerifier;
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

// After user receives code, verify it
export function verifySMSCode(confirmationResult, code) {
  return confirmationResult.confirm(code);
}
