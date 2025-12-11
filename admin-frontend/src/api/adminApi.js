import api from "./axios";

/**
 * Admin Authentication API
 */

// Admin Register
export const adminRegister = async (name, email, password, phone) => {
    try {
        const response = await api.post("/api/admin/register", {
            name,
            email,
            password,
            phone,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Registration failed" };
    }
};

// Admin Login
export const adminLogin = async (email, password) => {
    try {
        const response = await api.post("/api/admin/login", {
            email,
            password,
        });

        // Store token in localStorage (same as user/labour)
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Login failed" };
    }
};

/**
 * Admin Management API
 */

// Get All Admins
export const getAllAdmins = async () => {
    try {
        const response = await api.get("/api/admin/all");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch admins" };
    }
};

// Get Admin By ID
export const getAdminById = async (id) => {
    try {
        const response = await api.get(`/api/admin/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch admin" };
    }
};

// Update Admin
export const updateAdmin = async (id, data) => {
    try {
        const response = await api.put(`/api/admin/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to update admin" };
    }
};

// Delete Admin
export const deleteAdmin = async (id) => {
    try {
        const response = await api.delete(`/api/admin/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete admin" };
    }
};

// Admin Logout
export const adminLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
