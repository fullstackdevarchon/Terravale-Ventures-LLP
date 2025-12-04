import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";

const AdminLayout = ({ user, setAuthState }) => {
  const navigate = useNavigate();

  if (!user || user.role !== "admin") {
    toast.error("Unauthorized access");
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.fullName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-8 py-4 border border-white/40 text-black text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-white transition shadow-md font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
