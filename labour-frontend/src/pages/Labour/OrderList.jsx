import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import {
  FaClipboardList,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaInfoCircle,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaRupeeSign,
  FaShippingFast,
  FaClock,
  FaEnvelope,
} from "react-icons/fa";
import Preloader from "../../components/Preloader"; // Assuming Preloader is available and correct

const OrderList = ({ mode = "all", hideDeliveredDefault = false, showFinishedSummary = false }) => {
  const [orders, setOrders] = useState([]);
  const [hasActiveAssigned, setHasActiveAssigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState({});
  const [expanded, setExpanded] = useState(null); // row details
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const myUserId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.filter) {
      setFilter(location.state.filter);
    }
  }, [location.state]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // console.debug(" fetchOrders:start");
      const response = await fetch(`${API_BASE}/api/labours/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setHasActiveAssigned(!!data.hasActiveAssigned);
        // console.debug(" fetchOrders:success count=", (data.orders || []).length);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Orders fetch error:", error);
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
      // console.debug(" fetchOrders:end");
    }
  };

  // Assign order to labour
  const handleAssignOrder = async (orderId) => {
    try {
      if (hasActiveOrder) {
        toast.error("You already have an active order. Complete it before taking another.");
        // console.warn(" assign:block due to active order. orderId=", orderId);
        return;
      }
      setUpdating({ [orderId]: { action: "assign" } });
      const token = localStorage.getItem("token");
      // console.debug(" assign:start orderId=", orderId);

      await axios.post(
        `${API_BASE}/api/labours/orders/${orderId}/assign`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order assigned successfully");
      // console.debug(" assign:success orderId=", orderId);
      // Optimistic update so UI reflects assignment immediately and disables further clicks
      setOrders((prev) => prev.map((o) => (
        o._id === orderId
          ? {
            ...o,
            isAssigned: true,
            assignedTo: myUserId,
            status: "Confirmed",
            currentStatus: { status: "Confirmed", updatedAt: new Date().toISOString() }
          }
          : o
      )));
      setHasActiveAssigned(true);
      setHasActiveAssigned(true);
      // fetchOrders(); // refresh list - navigating away so no need to fetch here
      navigate("/labour-dashboard/my-orders", { state: { filter: "confirmed" } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign order");
      console.error(" assign:error orderId=", orderId, error.response?.data || error.message);
    } finally {
      setUpdating({});
      // console.debug(" assign:end orderId=", orderId);
    }
  };


  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Mark this order as ${newStatus}?`)) return;

    try {
      setUpdating((prev) => ({ ...prev, [orderId]: { action: "status" } }));
      const token = localStorage.getItem("token");
      // console.debug(" status:start orderId=", orderId, "newStatus=", newStatus);
      const response = await fetch(
        `${API_BASE}/api/labours/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...updatedOrder.order } : order
          )
        );
        toast.success(`Order status updated to ${newStatus}`);
        // Refresh list to recompute hasActiveAssigned and include any newly visible items
        fetchOrders();

        if (newStatus === "Shipped") {
          navigate("/labour-dashboard/my-orders", { state: { filter: "shipped" } });
        }
        // Clear active flags
        setHasActiveAssigned(false);
        // console.debug("✅ status:success orderId=", orderId, "newStatus=", newStatus);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update order status");
        console.error(" status:error orderId=", orderId, errorData);
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: { action: null } }));
      // console.debug(" status:end orderId=", orderId);
    }
  };

  // Does the current labour already have an active order?
  const myActiveExists = useMemo(() => {
    if (!myUserId) return false;
    return orders.some((o) => {
      const assignedToId = typeof o.assignedTo === "string" ? o.assignedTo : (o.assignedTo?._id || o.assignedTo?.id);
      const mine = assignedToId && String(assignedToId) === String(myUserId);
      const active = (o.status || '').toLowerCase() !== 'delivered' && (o.status || '').toLowerCase() !== 'cancelled';
      return mine && active;
    });
  }, [orders, myUserId]);

  // Combine with backend flag for immediate correctness after refresh
  const hasActiveOrder = myActiveExists || hasActiveAssigned;

  // Badge colors
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "order placed":
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusIcon = (status) => {
    switch ((status || "").toLowerCase()) {
      case "order placed":
      case "confirmed":
        return <FaClipboardList />;
      case "shipped":
        return <FaShippingFast />;
      case "delivered":
        return <FaCheckCircle />;
      case "cancelled":
        return <FaTimesCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  // Action buttons (dropdown / take order / assigned to other)
  const getActionButton = (order) => {
    const myId = localStorage.getItem("userId");
    const assignedToId =
      typeof order.assignedTo === "string"
        ? order.assignedTo
        : order.assignedTo?._id || order.assignedTo?.id || null;
    const changedByMe = Array.isArray(order.statusHistory)
      && order.statusHistory.some((h) => String(h.changedBy || '') === String(myId));

    const isAssignedToMe = !!myId && (
      (!!assignedToId && String(assignedToId) === String(myId)) || changedByMe
    );
    const noAssignee = !assignedToId; // Handle inconsistent data where isAssigned=true but assignedTo=null
    const isAssignedToSomeoneElse = order.isAssigned && !isAssignedToMe && !noAssignee;
    const status = order.status;

    // Case 1: Assigned to me → show action buttons instead of dropdown
    if (isAssignedToMe) {
      const isUpdating = updating[order._id]?.action === "status";
      const canShip = ["Order Placed", "Confirmed"].includes(status);
      const canDeliver = status === "Shipped";

      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateOrderStatus(order._id, "Shipped")}
            disabled={isUpdating || !canShip}
            className={`px-3 py-1 text-sm font-medium rounded-md text-white inline-flex items-center gap-2 transition ${isUpdating || !canShip
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-[#0000cc]"
              }`}
          >
            <FaShippingFast /> {isUpdating && canShip ? "Updating..." : "Mark Shipped"}
          </button>
          <button
            onClick={() => updateOrderStatus(order._id, "Delivered")}
            disabled={isUpdating || !canDeliver}
            className={`px-3 py-1 text-sm font-medium rounded-md text-white inline-flex items-center gap-2 transition ${isUpdating || !canDeliver
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-[#0000cc]"
              }`}
          >
            <FaCheckCircle /> {isUpdating && canDeliver ? "Updating..." : "Mark Delivered"}
          </button>
        </div>
      );
    }

    // Case 2: Not assigned (or inconsistent: isAssigned=true but no assignedTo)
    if (!order.isAssigned || noAssignee) {
      // If I already have an active order, prevent taking another
      if (hasActiveOrder) {
        return (
          <button
            disabled
            title="You already have an active order"
            className="px-3 py-1 text-sm font-medium rounded-md text-white bg-gray-400 cursor-not-allowed inline-flex items-center gap-2"
          >
            <FaClock /> Active order in progress
          </button>
        );
      }
      // else allow taking this order
      return (
        <button
          onClick={() => handleAssignOrder(order._id)}
          disabled={updating[order._id]?.action === "assign"}
          className={`px-3 py-1 text-sm font-medium rounded-md text-white inline-flex items-center gap-2 transition ${updating[order._id]?.action === "assign"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-[#0000cc]"
            }`}
        >
          <FaBoxOpen /> {updating[order._id]?.action === "assign" ? "Assigning..." : "Take Order"}
        </button>
      );
    }

    // Case 3: Already assigned to someone else
    return (
      <span className="text-gray-500 text-sm" title={`Assigned to: ${order.assignedTo?.fullName || order.assignedTo?.name || assignedToId || 'unknown'}`}>
        Assigned to another labour
      </span>
    );
  };

  // Filter by page mode first (all/mine/pending), then by status tab
  const myId = localStorage.getItem("userId");
  const isDelivered = (s) => (s || "").toLowerCase() === "delivered";
  const isCancelled = (s) => (s || "").toLowerCase() === "cancelled";

  const modeFiltered = orders.filter((order) => {
    if (mode === "mine") {
      const assignedToId = typeof order.assignedTo === "string" ? order.assignedTo : (order.assignedTo?._id || order.assignedTo?.id);
      const changedByMe = Array.isArray(order.statusHistory)
        && order.statusHistory.some((h) => String(h.changedBy || '') === String(myId));
      return (
        !!myId && (
          (!!assignedToId && String(assignedToId) === String(myId)) || changedByMe
        )
      );
    }
    if (mode === "take") {
      // Only show orders that are NOT delivered/cancelled and currently unassigned (or inconsistent with no assignee)
      const s = (order.status || '').toLowerCase();
      const active = s !== 'delivered' && s !== 'cancelled';
      const assignedToId = typeof order.assignedTo === 'string' ? order.assignedTo : (order.assignedTo?._id || order.assignedTo?.id);
      const unassigned = !assignedToId; // treat missing assignedTo as unassigned
      return active && unassigned;
    }
    if (mode === "pending") {
      // Consider pending as any non-delivered and non-cancelled order
      return !isDelivered(order.status) && !isCancelled(order.status);
    }
    return true; // all
  });

  const filteredOrders = modeFiltered.filter(
    (order) =>
    (
      filter === "all"
        ? // In My Orders, optionally hide Delivered from the default "All" list
        !(mode === "mine" && hideDeliveredDefault && (order.status || "").toLowerCase() === "delivered")
        : (order.status || "").toLowerCase() === filter.toLowerCase()
    )
  );

  // Finished count (Delivered) for My Orders
  const finishedCount = useMemo(() => {
    if (!myUserId) return 0;
    return orders.filter((o) => {
      const assignedToId = typeof o.assignedTo === 'string' ? o.assignedTo : (o.assignedTo?._id || o.assignedTo?.id);
      const mine = assignedToId && String(assignedToId) === String(myUserId);
      return mine && (o.status || '').toLowerCase() === 'delivered';
    }).length;
  }, [orders, myUserId]);

  const toggleExpand = (orderId) => {
    setExpanded((prev) => (prev === orderId ? null : orderId));
  };

  const formatDateTime = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  // If My Orders 'All' is empty only because Delivered is hidden by default,
  // automatically switch to the Delivered tab so the user sees their completed orders.
  useEffect(() => {
    if (mode !== 'mine' || !hideDeliveredDefault) return;
    // Compute what 'All' shows with the current rules
    const hasAnyDeliveredMine = orders.some((o) => {
      const assignedToId = typeof o.assignedTo === 'string' ? o.assignedTo : (o.assignedTo?._id || o.assignedTo?.id);
      const mine = myUserId && assignedToId && String(assignedToId) === String(myUserId);
      return mine && (o.status || '').toLowerCase() === 'delivered';
    });
    const hasAnyNonDeliveredMine = orders.some((o) => {
      const assignedToId = typeof o.assignedTo === 'string' ? o.assignedTo : (o.assignedTo?._id || o.assignedTo?.id);
      const mine = myUserId && assignedToId && String(assignedToId) === String(myUserId);
      const s = (o.status || '').toLowerCase();
      return mine && s !== 'delivered' && s !== 'cancelled';
    });
    if (filter === 'all' && !hasAnyNonDeliveredMine && hasAnyDeliveredMine) {
      setFilter('delivered');
    }
  }, [orders, mode, hideDeliveredDefault, myUserId, filter]);

  // Loading spinner conditional return
  if (loading) {
    // This assumes the Preloader component exists and is a full-page loading screen
    return <Preloader />;
    // If Preloader is not desired, the simple spinner you commented out is an option:
    // return (
    //   <div className="flex items-center justify-center min-h-screen">
    //     <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
    //   </div>
    // );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-3xl shadow-2xl my-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl flex justify-center items-center gap-3">
          {mode === 'take' ? (
            <>
              <FaBoxOpen className="text-green-400" /> Take Orders
            </>
          ) : (
            <>
              <FaClipboardList className="text-green-300" /> Order Management
            </>
          )}
        </h1>
        <p className="text-gray-300 mt-2 text-center">
          {mode === 'take' ? 'Browse available orders and take one to work on' : 'Manage and track your assigned orders'}
        </p>
        {showFinishedSummary && mode === "mine" && (
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <FaCheckCircle className="mr-1" /> Finished: {finishedCount}
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-100">
          <nav className="-mb-px flex flex-wrap gap-4">
            {(mode === 'take'
              ? [
                { key: "all", label: "All", icon: <FaBoxOpen /> },
                { key: "confirmed", label: "Confirmed", icon: <FaClipboardList /> },
                { key: "shipped", label: "Shipped", icon: <FaTruck /> },
              ] // hide Delivered in take mode
              : [
                { key: "all", label: "All", icon: <FaBoxOpen /> },
                { key: "confirmed", label: "Confirmed", icon: <FaClipboardList /> },
                { key: "shipped", label: "Shipped", icon: <FaTruck /> },
                { key: "delivered", label: "Delivered", icon: <FaCheckCircle /> },
              ]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition ${filter === tab.key
                  ? "border-green-400 text-green-400"
                  : "border-transparent text-gray-300 hover:text-white hover:border-white/30"
                  }`}
                title={`Show ${tab.label} orders`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="capitalize">{tab.label}</span>
                <span className="text-xs text-gray-400">
                  (
                  {
                    tab.key === "all"
                      ? modeFiltered.filter((o) =>
                        !(mode === "mine" && hideDeliveredDefault && (o.status || "").toLowerCase() === "delivered")
                      ).length
                      : modeFiltered.filter((o) => (o.status || "").toLowerCase() === tab.key).length
                  }
                  )
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 text-black transition hover:shadow-2xl hover:-translate-y-1">

              {/* Header: ID & Date */}
              <div className="flex justify-between items-start mb-4 border-b border-black/10 pb-3">
                <div>
                  <div className="text-lg font-bold text-black">
                    #{order._id?.slice(-6)}
                  </div>
                  <div className="text-sm text-black/60">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    <span className="inline-flex items-center gap-1">{statusIcon(order.status)} {order.status}</span>
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FaUser className="text-blue-600" />
                  <span className="font-semibold">{order.buyer?.fullName || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-black/70">
                  <FaEnvelope className="text-gray-600" />
                  <span>{order.buyer?.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-black/70">
                  <FaPhone className="text-green-600" />
                  <span>{order.buyer?.phone || "N/A"}</span>
                </div>
                {order.buyer?.alternatePhone && (
                  <div className="flex items-center gap-2 text-sm text-black/70">
                    <FaPhone className="text-green-600" />
                    <span>Alt: {order.buyer?.alternatePhone}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="mb-4 p-3 bg-white/30 rounded-lg border border-white/40">
                <div className="flex items-start gap-2 text-sm text-black/80">
                  <FaMapMarkerAlt className="text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{order.address?.street || ""}</p>
                    {order.address?.street2 && <p className="font-medium">{order.address?.street2}</p>}
                    <p>
                      {order.address?.city}{order.address?.city ? ", " : ""}
                      {order.address?.district}{order.address?.district ? ", " : ""}
                      {order.address?.state}{order.address?.state ? ", " : ""}
                      {order.address?.country || "India"}
                    </p>
                    <p>{order.address?.zip || order.address?.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Amount & Items */}
              <div className="flex justify-between items-center mb-6 text-sm font-medium">
                <div className="flex items-center gap-1 text-black">
                  <FaBoxOpen className="text-orange-600" /> {order.products?.length || 0} Items
                </div>
                <div className="flex items-center gap-1 text-xl font-bold text-white">
                  <FaRupeeSign className="text-yellow-600" /> {order.total}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {getActionButton(order)}

                <button
                  onClick={() => toggleExpand(order._id)}
                  className="w-full py-2 text-sm font-medium text-black/70 hover:text-black bg-black/5 hover:bg-black/10 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <FaInfoCircle className="text-purple-600" /> {expanded === order._id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {expanded === order._id && (
                <div className="mt-4 pt-4 border-t border-black/10 animate-fadeIn">
                  <h4 className="text-sm font-bold text-black mb-2">Products</h4>
                  <ul className="space-y-2 mb-4">
                    {(order.products || []).map((p, idx) => (
                      <li key={idx} className="text-sm text-black/80 flex justify-between bg-white/40 p-2 rounded">
                        <span>{p.product?.name || p.name || 'Item'}</span>
                        <span className="font-semibold">x {p.quantity || p.qty || p.count || 1}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-sm font-bold text-black mb-2">Status History</h4>
                  <ol className="border-l-2 border-black/20 pl-4 space-y-3">
                    {(order.statusHistory || []).map((h, i) => (
                      <li key={i} className="text-xs text-black/70">
                        <div className="font-semibold text-black">{h.status}</div>
                        <div>{formatDateTime(h.updatedAt || h.changedAt)}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <FaClipboardList className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">
              No orders found
            </h3>
            <p className="mt-1 text-gray-300">
              {filter === "all"
                ? (mode === 'mine' ? "You have no orders yet." : "No orders available.")
                : `No ${filter} orders found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;