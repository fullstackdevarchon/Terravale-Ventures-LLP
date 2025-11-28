import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import PageContainer1 from "../../components/PageContainer1";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const [showForgot, setShowForgot] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/labours/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        const u = data.user || data.labour || {};
        localStorage.setItem("userId", u._id || u.id);
        localStorage.setItem("role", u.role);

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

  // SEND OTP
  const handleSendOtp = async () => {
    if (!email) return toast.error("Enter your email");

    setForgotLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/forgot/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role: "labour" }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent successfully!");
        setOtpStage(true);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setForgotLoading(false);
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async () => {
    if (!otp || !newPassword) return toast.error("Enter OTP & new password");

    setForgotLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/forgot/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword, role: "labour" }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset successful!");
        setShowForgot(false);
        setOtpStage(false);
        setEmail("");
        setOtp("");
        setNewPassword("");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <PageContainer1>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center px-6">

        {/* LEFT GLASS MODEL - Now Same UI as Right */}
        <div className="flex justify-center">
          <div className="w-full max-w-md p-8 rounded-2xl 
            backdrop-blur-xl bg-white/10 border border-white/20 
            text-black shadow-2xl">

            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white/40 p-3 rounded-full shadow-sm hover:bg-blue-200 transition-all duration-300">
                  <FiUser className="text-blue-600 text-2xl" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-black">Welcome Back, Labour!</h2>
              <p className="text-black/70 text-sm mt-1">
                Access your dashboard and daily tasks easily.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT LOGIN AREA – Model UI */}
        <div className="flex justify-center">
          <div className="w-full max-w-md p-8 rounded-2xl 
            backdrop-blur-xl bg-white/10 border border-white/20 
            text-black shadow-2xl">

            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white/40 p-3 rounded-full shadow-sm hover:bg-blue-200 transition-all duration-300">
                  <FiUser className="text-blue-600 text-2xl" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-black">Labour Login</h2>
              <p className="text-black/70 text-sm mt-1">
                Sign in to access your work dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-red-600" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full py-2 bg-white/60 border border-white/40
                  rounded-lg text-black placeholder-black/50 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-green-600" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 w-full py-2 bg-white/60 border border-white/40
                  rounded-lg text-black placeholder-black/50 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg font-semibold 
                ${loading
                    ? "bg-white/30 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                  }`}
              >
                {loading ? <FaSpinner className="mx-auto animate-spin" /> : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-black/70">
              Forgot password?{" "}
              <span
                onClick={() => setShowForgot(true)}
                className="text-black font-medium cursor-pointer hover:underline"
              >
                Reset here
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="backdrop-blur-xl bg-white/80 border border-white/40
            p-6 rounded-xl w-full max-w-md shadow-xl text-black">

            <h3 className="text-lg font-bold mb-4 text-center">
              {otpStage ? "Reset Password" : "Forgot Password"}
            </h3>

            {!otpStage ? (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full mb-3 px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-black/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  onClick={handleSendOtp}
                  disabled={forgotLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-white"
                >
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full mb-3 px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-black/50"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full mb-3 px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-black/50"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <button
                  onClick={handleResetPassword}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white"
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}

            <button
              onClick={() => {
                setShowForgot(false);
                setOtpStage(false);
              }}
              className="mt-3 w-full text-sm text-black/60 hover:text-black"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </PageContainer1>
  );
};

export default Login;
