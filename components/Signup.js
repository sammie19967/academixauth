import React, { useState } from "react";
import {
  signUpWithEmail,
  signInWithGoogle,
  setupRecaptcha,
  sendSMSCode,
  verifySMSCode,
} from "./auth"; // adjust path as needed

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
    <div className="signup-container" style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Sign Up</h2>

      {message && <p>{message}</p>}

      {step === "email" && (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /><br />
          <button onClick={handleEmailSignUp}>Sign Up with Email</button>
          <hr />
          <button onClick={handleGoogleSignUp}>Continue with Google</button>
          <hr />
          <button onClick={() => setStep("phone")}>Use Phone Number</button>
        </>
      )}

      {step === "phone" && (
        <>
          <input
            type="tel"
            placeholder="+2547XXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          /><br />
          <div id="recaptcha-container"></div>
          <button onClick={handlePhoneSendCode}>Send Code</button>
        </>
      )}

      {step === "verify" && (
        <>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          /><br />
          <button onClick={handleVerifyCode}>Verify Code</button>
        </>
      )}
    </div>
  );
}
