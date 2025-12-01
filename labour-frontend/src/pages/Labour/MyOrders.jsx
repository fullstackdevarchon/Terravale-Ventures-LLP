import React, { useState, useEffect } from "react";

import OrderList from "./OrderList";
import Preloader from "../../components/Preloader";

const MyOrders = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching or setup time (e.g., API call)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds preloader display

    return () => clearTimeout(timer);
  }, []);

  // // Show preloader first
  // if (loading) {
  //   return <Preloader />;
  // }

  // Main content after preloader disappears
  return (
    <OrderList
      mode="mine"
      hideDeliveredDefault={true}
      showFinishedSummary={true}
    />
  );
};

export default MyOrders;
