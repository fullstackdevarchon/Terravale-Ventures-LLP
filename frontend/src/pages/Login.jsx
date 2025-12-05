// src/pages/Login.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import PageContainer from "../components/PageContainer";
import Footer from "../components/Footer";
import API_BASE from "../config";

// ⭐ Import Google OAuth
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  // States
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const allowedRoles = ["buyer", "seller"];
  const currentRole = allowedRoles.includes(role) ? role : "buyer";

  // -----------------------
  // Google Login
  // -----------------------
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google Login Success:", credentialResponse);

    const idToken = credentialResponse.credential;

    if (!idToken) {
      setError("Google Login Failed: No ID Token Found");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Google Login Failed");
        return;
      }

      // Store user with token inside user object
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data.user,
          token: data.token,
        })
      );

      // Optional separate storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      // Save cookies
      Cookies.set("token", data.token, { path: "/", expires: 1 });
      Cookies.set("role", data.user.role, { path: "/", expires: 1 });

      alert("Google Login Successful!");

      // Redirect based on role
      navigate(
        data.user.role === "seller" ? "/seller" : "/buyer-dashboard",
        { replace: true }
      );

    } catch (err) {
      console.error("Google Login Error:", err);
      setError("An error occurred during Google login.");
    }
  };

  // Google Login Error Handler
  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  // -----------------------
  // Login / Register
  // -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = `${API_BASE}/api/users${isRegister ? "/register" : "/login"
        }`;

      const payload = isRegister
        ? { fullName, email, pass: password, role: currentRole }
        : { email, pass: password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || "Something went wrong");

      // ⭐ Login
      if (!isRegister && data.user) {
        const { user, token } = data;

        if (!token) return setError("Authentication failed: No token received");

        if (user.role !== currentRole) {
          alert(`You are not a ${currentRole}! Your account is ${user.role}.`);
          return;
        }

        const authData = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          token,
        };

        localStorage.setItem("user", JSON.stringify(authData));
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);

        Cookies.set("token", token, { path: "/", expires: 1 });
        Cookies.set("role", user.role, { path: "/", expires: 1 });

        alert("Login successful!");

        navigate(
          user.role === "seller" ? "/seller" : "/buyer-dashboard",
          { replace: true }
        );

        // ⭐ Register Success
      } else if (isRegister) {
        setSuccess("Registration successful! Please login.");
        setTimeout(() => setIsRegister(false), 1500);
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  // -----------------------
  // Forgot Password – Send OTP
  // -----------------------
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/forgot/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to send OTP");

      setSuccess("OTP sent successfully! Check your email.");
      setStep(2);
    } catch (err) {
      setError("Error sending OTP. Try again.");
    }
  };

  // -----------------------
  // Forgot Password – Reset
  // -----------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${API_BASE}/api/forgot/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) return setError(data.message || "OTP verification failed");

      setSuccess("Password reset successful! Please login.");
      setTimeout(() => {
        setIsForgot(false);
        setStep(1);
      }, 2000);
    } catch (err) {
      setError("Error resetting password. Try again.");
    }
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <PageContainer>
      <main className="min-h-screen flex items-center justify-center py-8">
        <div className="relative w-full max-w-4xl px-6">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left Panel */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10
                p-4 shadow-xl">
              <h2 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
                Welcome Back
              </h2>
              <p className="text-black mb-6">
                Login to access your dashboard, manage orders, events and more.
              </p>

              <ul className="space-y-3 text-black">
                <li className="flex items-center gap-3">
                  ✈️ Secure role-based access
                </li>
                <li className="flex items-center gap-3">
                  ✈️ Google One-tap Login
                </li>
                <li className="flex items-center gap-3">
                  ✈️ OTP Password Reset
                </li>
              </ul>
            </div>

            {/* Right Panel */}
            <div
              className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10
                p-4 shadow-xl"
            >
              <div className="mb-4 text-center">
                <h1 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
                  {isForgot
                    ? "Forgot Password"
                    : isRegister
                      ? "Create Account"
                      : "Login"}
                </h1>

                <p className="text-black mt-2">
                  {isForgot
                    ? "Reset your password using OTP"
                    : isRegister
                      ? `Sign-Up as ${currentRole}`
                      : `Login as ${currentRole}`}
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50/80 text-red-700 px-4 py-3 border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-lg bg-green-50/80 text-green-800 px-4 py-3 border border-green-200">
                  {success}
                </div>
              )}

              {/* -----------------------
                  Forgot Password
                ----------------------- */}
              {isForgot ? (
                <form
                  onSubmit={step === 1 ? handleSendOTP : handleResetPassword}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-black">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl p-3 bg-white/10 text-black border border-white/20"
                    />
                  </div>

                  {step === 2 && (
                    <>
                      <div>
                        <label className="text-black">OTP</label>
                        <input
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full rounded-xl p-3 bg-white/10 text-black border border-white/20"
                        />
                      </div>

                      <div>
                        <label className="text-black">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-xl p-3 bg-white/10 text-black border border-white/20"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
                  >
                    {step === 1 ? "Send OTP" : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsForgot(false)}
                    className="text-sm text-white underline block mx-auto mt-2"
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                <>
                  {/* -----------------------
                      Login & Register
                    ----------------------- */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                      <div>
                        <label className="text-black">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-xl p-3 bg-white/10 text-black border border-white/20"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-black">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl p-3 bg-white/10 text-black border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="text-black">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl p-3 bg-white/10 text-black border border-white/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-60 mx-auto flex justify-center py-2.5 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
                    >
                      {isRegister ? "Sign-Up" : "Sign-In"}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="my-4 flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <div className="text-black">OR</div>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Google */}
                  <div className=" w-60 mx-auto flex justify-center rounded-xl py-2.5">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  </div>

                  {/* Links */}
                  <div className="text-center text-black text-sm">
                    {isRegister ? (
                      <>
                        Already have an account?{" "}
                        <button
                          onClick={() => setIsRegister(false)}
                          className="text-black hover:text-white underline"
                        >
                          Sign-In
                        </button>
                      </>
                    ) : (
                      <>
                        New here?{" "}
                        <button
                          onClick={() => setIsRegister(true)}
                          className="text-black hover:text-white underline"
                        >
                          Sign-Up
                        </button>

                        <div className="mt-2">
                          <button
                            onClick={() => setIsForgot(true)}
                            className="text-xs text-black"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-black">
            By continuing you agree to our{" "}
            <a href="/terms" className="text-black hover:text-white underline">Terms</a> &{" "}
            <a href="/terms" className="text-black hover:text-white underline">Privacy</a>.
          </div>
        </div>
      </main>
      <Footer />
    </PageContainer>
  );
};

export default Login;
