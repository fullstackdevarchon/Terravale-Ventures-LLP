// src/pages/Admin/AssignTask.jsx
import React, { useState, useEffect } from "react";
import PageContainer from "../../components/PageContainer";

const AssignTask = () => {
  const [notifications, setNotifications] = useState([]);

  // Request browser notification permission on component mount
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Function to send notification to Labour dashboard
  const handleAssign = () => {
    const notificationData = {
      title: "New Task",
      message: "You have a new order!",
      role: "labour", // target dashboard
    };

    // socket.emit("sendNotification", notificationData); // Socket removed
    alert("Notification sent to Labour! (Socket disabled)");

    // Optionally add to local notifications list
    setNotifications((prev) => [notificationData, ...prev]);
  };

  return (
    <PageContainer>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
          Assign Task
        </h1>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleAssign}
            className="px-8 py-3 bg-white text-white rounded-xl font-bold hover:bg-[#0000cc] shadow-lg transition transform hover:scale-105"
          >
            Assign Task
          </button>
        </div>

        {/* Notification dropdown */}
        {notifications.length > 0 && (
          <div className="mt-8 max-w-lg mx-auto backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-6">
            <h2 className="font-bold text-xl mb-4 text-black border-b border-black/10 pb-2">Notifications</h2>
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-sm">
                  <b className="text-white block mb-1">{n.title}</b>
                  <p className="text-black font-medium">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default AssignTask;
