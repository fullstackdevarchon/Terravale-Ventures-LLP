import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import PageContainer1 from "../../components/PageContainer1";
import API_BASE from "../../config";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // States
  const [isForgot, setIsForgot] = useState(false);
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forgot Password States
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // -----------------------
  // Google Login
  // -----------------------
  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.error("Google Login Failed: No ID Token Found");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken, role: "labour" }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Google Login Failed");
        return;
      }

      // Store user with token inside user object
      localStorage.setItem("token", data.token);
      const u = data.user;
      localStorage.setItem("userId", u.id);
      localStorage.setItem("role", u.role);

      // Save cookies
      Cookies.set("token", data.token, { path: "/", expires: 1 });
      Cookies.set("role", u.role, { path: "/", expires: 1 });

      login(u, data.token);
      toast.success("Google Login Successful!");
      navigate("/labour-dashboard");

    } catch (err) {
      console.error("Google Login Error:", err);
      toast.error("An error occurred during Google login.");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  // -----------------------
  // Normal Login
  // -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/labours/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        const u = data.user || data.labour || {};
        localStorage.setItem("userId", u._id || u.id);
        localStorage.setItem("role", u.role);

        Cookies.set("token", data.token, { path: "/", expires: 1 });
        Cookies.set("role", u.role, { path: "/", expires: 1 });

        login(u, data.token);
        toast.success(`Welcome back, ${u.fullName || "User"}!`);
        navigate("/labour-dashboard");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch {
      toast.error("⚠ Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Forgot Password – Send OTP
  // -----------------------
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/forgot/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role: "labour" }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to send OTP");
      } else {
        toast.success("OTP sent successfully! Check your email.");
        setStep(2);
      }
    } catch {
      toast.error("Error sending OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Forgot Password – Reset
  // -----------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/forgot/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword, role: "labour" }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "OTP verification failed");
      } else {
        toast.success("Password reset successful! Please login.");
        setTimeout(() => {
          setIsForgot(false);
          setStep(1);
          setOtp("");
          setNewPassword("");
        }, 2000);
      }
    } catch {
      toast.error("Error resetting password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer1>
      <main className="min-h-screen flex items-center justify-center py-8">
        <div className="relative w-full max-w-4xl px-6">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

            {/* Left Panel */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl text-white">
              <h2 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
                Welcome Back, Labour!
              </h2>
              <p className="mb-6 text-gray-200 text-center">
                Access your dashboard, manage tasks, and view your work history.
              </p>

              <ul className="space-y-4 text-gray-200">
                <li className="flex items-center gap-3">
                  ✅ Secure Access
                </li>
                <li className="flex items-center gap-3">
                  ✅ Google One-tap Login
                </li>
                <li className="flex items-center gap-3">
                  ✅ Easy Task Management
                </li>
              </ul>
            </div>

            {/* Right Panel */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
              <div className="mb-6 text-center">
                <h1 className="text-4xl font-extrabold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
                  {isForgot ? "Forgot Password" : "Labour Login"}
                </h1>
                <p className="text-gray-200">
                  {isForgot ? "Reset your password using OTP" : "Sign in to continue"}
                </p>
              </div>

              {/* Forgot Password Form */}
              {isForgot ? (
                <form onSubmit={step === 1 ? handleSendOTP : handleResetPassword} className="space-y-4">
                  <div>
                    <label className="text-gray-200 block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl p-3 bg-white/10 text-white border border-white/20 focus:outline-none focus:border-green-400"
                      placeholder="Enter your email"
                    />
                  </div>

                  {step === 2 && (
                    <>
                      <div>
                        <label className="text-gray-200 block mb-1">OTP</label>
                        <input
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full rounded-xl p-3 bg-white/10 text-white border border-white/20 focus:outline-none focus:border-green-400"
                          placeholder="Enter OTP"
                        />
                      </div>

                      <div>
                        <label className="text-gray-200 block mb-1">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-xl p-3 bg-white/10 text-white border border-white/20 focus:outline-none focus:border-green-400"
                          placeholder="Enter new password"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl py-3 bg-white text-white font-semibold shadow-md hover:bg-blue-700 transition-all"
                  >
                    {loading ? "Processing..." : step === 1 ? "Send OTP" : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(false);
                      setStep(1);
                    }}
                    className="text-sm text-green-300 hover:text-green-400 underline block mx-auto mt-4"
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                /* Login Form */
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-gray-200 block mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl p-3 bg-white/10 text-white border border-white/20 focus:outline-none focus:border-green-400"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="text-gray-200 block mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl p-3 bg-white/10 text-white border border-white/20 focus:outline-none focus:border-green-400"
                        placeholder="Enter your password"
                      />
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setIsForgot(true)}
                        className="text-sm text-green-300 hover:text-green-400"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl py-3 bg-white text-white font-semibold shadow-md hover:bg-blue-700 transition-all hover:scale-105"
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="my-6 flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/20" />
                    <div className="text-gray-300 text-sm">OR</div>
                    <div className="flex-1 h-px bg-white/20" />
                  </div>

                  {/* Google Login */}
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="filled_blue"
                      shape="pill"
                      width="250"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </PageContainer1>
  );
};

export default Login;
