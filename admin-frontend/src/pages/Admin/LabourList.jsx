import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaTrashAlt,
  FaUser,
  FaEnvelope,
  FaIdBadge,
  FaClock,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader"; // ✅ Import your Preloader

const LabourList = () => {
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLabour, setSelectedLabour] = useState(null); // State for modal details
  const [viewImage, setViewImage] = useState(null); // State for full image view

  // ✅ Fetch labours from backend
  const fetchLabours = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/labours", {
        withCredentials: true,
      });
      setLabours(data.labours || []);
    } catch (error) {
      console.error("❌ Error fetching labours:", error);
      toast.error("Failed to fetch labours.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete labour
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/labours/${id}`, {
        withCredentials: true,
      });
      setLabours((prev) => prev.filter((labour) => labour._id !== id));
      toast.success("Labour removed successfully!");
    } catch (error) {
      console.error("❌ Error deleting labour:", error);
      toast.error("Failed to delete labour.");
    }
  };

  useEffect(() => {
    fetchLabours();
  }, []);

  // // ✅ Show Preloader while loading
  // if (loading) {
  //   return <Preloader />;
  // }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto mt-10 px-4">
        <h2 className="text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
          Labour List
        </h2>

        {labours.length === 0 ? (
          <p className="text-black/70 text-center text-lg font-medium bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
            No labours found.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {labours.map((labour) => (
              <div
                key={labour._id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-xl p-6 flex flex-col justify-between hover:scale-[1.02] transition duration-300"
              >
                {/* Labour Details */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-black flex items-center gap-2">
                    {labour.profilePicture ? (
                      <img
                        src={labour.profilePicture}
                        alt={labour.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <FaUser className="text-white" />
                    )}
                    {labour.fullName}
                  </h3>
                  <p className="text-black flex items-center gap-2 font-medium">
                    <FaEnvelope className="text-blue-600" /> {labour.email}
                  </p>
                  <p className="text-black flex items-center gap-2 font-medium">
                    <FaIdBadge className="text-green-600" /> Role:{" "}
                    {labour.role}
                  </p>
                  <p className="text-black/70 flex items-center gap-2 text-sm font-medium">
                    <FaClock className="text-black/50" /> Joined:{" "}
                    {new Date(labour.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-between items-center pt-4 border-t border-white/20">
                  <button
                    onClick={() => setSelectedLabour(labour)}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition duration-200 shadow-md flex items-center gap-2"
                  >
                    <FaInfoCircle /> Info
                  </button>
                  <button
                    onClick={() => handleDelete(labour._id)}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition duration-200 shadow-md flex items-center gap-2"
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedLabour && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/40 transform transition-all scale-100">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-400 to-blue-600 p-6 flex justify-between items-center">
                <h3 className="text-2xl font-extrabold text-black flex items-center gap-3">
                  <FaUser className="text-blue-600" /> Labour Details
                </h3>
                <button
                  onClick={() => setSelectedLabour(null)}
                  className="text-white/80 hover:text-white transition bg-white/10 p-2 rounded-full hover:bg-white/20"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="bg-blue-100 p-1 rounded-full">
                    {selectedLabour.profilePicture ? (
                      <img
                        src={selectedLabour.profilePicture}
                        alt={selectedLabour.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => setViewImage(selectedLabour.profilePicture)}
                      />
                    ) : (
                      <div className="p-3">
                        <FaUser className="text-white text-xl" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Full Name</p>
                    <p className="text-lg font-bold text-gray-900">{selectedLabour.fullName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold">Email</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedLabour.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold">Phone</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedLabour.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                  <FaMapMarkerAlt className="text-red-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-bold mb-1">Address</p>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">
                      {selectedLabour.address ? (
                        <>
                          {selectedLabour.address.street && <span>{selectedLabour.address.street}, <br /></span>}
                          {selectedLabour.address.street2 && <span>{selectedLabour.address.street2}, <br /></span>}
                          {selectedLabour.address.city && <span>{selectedLabour.address.city}, </span>}
                          {selectedLabour.address.district && <span>{selectedLabour.address.district}, </span>}
                          <br />
                          {selectedLabour.address.state && <span>{selectedLabour.address.state}, </span>}
                          {selectedLabour.address.country && <span>{selectedLabour.address.country}</span>}
                          {selectedLabour.address.pincode && <span> - {selectedLabour.address.pincode}</span>}
                        </>
                      ) : (
                        "No address provided"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-sm">
                  <span className="flex items-center gap-2 font-medium text-gray-600">
                    <FaIdBadge className="text-green-600" /> {selectedLabour.role}
                  </span>
                  <span className="flex items-center gap-2 font-medium text-gray-500">
                    <FaClock /> Joined: {new Date(selectedLabour.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Image Modal */}
        {viewImage && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"
            onClick={() => setViewImage(null)}
          >
            <div className="relative">
              <button
                onClick={() => setViewImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-red-400 transition"
              >
                <FaTimes size={30} />
              </button>
              <img
                src={viewImage}
                alt="Full View"
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border-4 border-white"
              />
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default LabourList;
