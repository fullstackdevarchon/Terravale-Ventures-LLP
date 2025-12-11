// src/pages/Admin/AdminManagement.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllAdmins, deleteAdmin, updateAdmin } from "../../api/adminApi";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";
import { FaEdit, FaTrash, FaPhone, FaEnvelope } from "react-icons/fa";

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await getAllAdmins();
            if (data.success) {
                setAdmins(data.admins);
            }
        } catch (error) {
            console.error("Failed to fetch admins:", error);
            toast.error("Failed to load admins");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) {
            return;
        }

        try {
            const data = await deleteAdmin(id);
            if (data.success) {
                toast.success("Admin deleted successfully");
                fetchAdmins();
            }
        } catch (error) {
            console.error("Failed to delete admin:", error);
            toast.error("Failed to delete admin");
        }
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin._id);
        setEditForm({
            name: admin.name,
            email: admin.email,
            phone: admin.phone || "",
        });
    };

    const handleUpdate = async (id) => {
        try {
            const data = await updateAdmin(id, editForm);
            if (data.success) {
                toast.success("Admin updated successfully");
                setEditingAdmin(null);
                fetchAdmins();
            }
        } catch (error) {
            console.error("Failed to update admin:", error);
            toast.error("Failed to update admin");
        }
    };

    const handleCancelEdit = () => {
        setEditingAdmin(null);
        setEditForm({ name: "", email: "", phone: "" });
    };

    if (loading) return <Preloader />;

    return (
        <PageContainer>
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-6 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
                        Admin Management
                    </h1>

                    {admins.length === 0 ? (
                        <div className="text-center text-white text-xl">
                            No admins found
                        </div>
                    ) : (
                        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {admins.map((admin) => (
                                <div
                                    key={admin._id}
                                    className="p-6 rounded-xl shadow-lg backdrop-blur-xl bg-white/10 border border-white/20"
                                >
                                    {editingAdmin === admin._id ? (
                                        // Edit Mode
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, name: e.target.value })
                                                }
                                                className="w-full px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/50"
                                                placeholder="Name"
                                            />
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, email: e.target.value })
                                                }
                                                className="w-full px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/50"
                                                placeholder="Email"
                                            />
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, phone: e.target.value })
                                                }
                                                className="w-full px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/50"
                                                placeholder="Phone"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdate(admin._id)}
                                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            <div className="mb-4">
                                                <h2 className="text-xl font-bold text-white mb-2">
                                                    {admin.name}
                                                </h2>
                                                <div className="flex items-center gap-2 text-white/80 mb-1">
                                                    <FaEnvelope className="text-sm" />
                                                    <span className="text-sm">{admin.email}</span>
                                                </div>
                                                {admin.phone && (
                                                    <div className="flex items-center gap-2 text-white/80">
                                                        <FaPhone className="text-sm" />
                                                        <span className="text-sm">{admin.phone}</span>
                                                    </div>
                                                )}
                                                <div className="mt-2">
                                                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                                                        {admin.role}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(admin)}
                                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition flex items-center justify-center gap-2"
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin._id)}
                                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition flex items-center justify-center gap-2"
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default AdminManagement;
