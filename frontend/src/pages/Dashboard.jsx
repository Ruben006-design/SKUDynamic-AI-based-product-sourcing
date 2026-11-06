import { useEffect, useState } from "react";
import {
  CircularProgress,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import InventoryCategoryChart from "../components/charts/InventoryCategoryChart";
import OrderSummaryChart from "../components/charts/OrderSummaryChart";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import KPICard from "../components/dashboard/KPICard";
import RecentOrders from "../components/dashboard/RecentOrders";
import LowStockCard from "../components/dashboard/LowStockCard";
import AIQuickActions from "../components/dashboard/AIQuickActions";
import {
  getProducts,
  getSuppliers,
  getInventories,
  getOrderAnalytics,
  getOrders,
  getRetailers,
  getWeightConfigs,
} from "../services/dashboardService";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [orders, setOrders] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [weightConfigs, setWeightConfigs] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          getProducts(),
          getSuppliers(),
          getInventories(),
          getOrderAnalytics(),
          getOrders(),
          getRetailers(),
          getWeightConfigs(),
        ]);

        if (results[0].status === "fulfilled") setProducts(results[0].value || []);
        if (results[1].status === "fulfilled") setSuppliers(results[1].value || []);
        if (results[2].status === "fulfilled") setInventories(results[2].value || []);
        if (results[3].status === "fulfilled") setAnalytics(results[3].value || {});
        if (results[4].status === "fulfilled") setOrders(results[4].value || []);
        if (results[5].status === "fulfilled") setRetailers(results[5].value || []);
        if (results[6].status === "fulfilled") setWeightConfigs(results[6].value || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={36} color="primary" />
        <Typography variant="body2" color="text.secondary">
          Connecting to inventory service...
        </Typography>
      </Box>
    );
  }

  // Calculate total stock on hand across inventory records
  const totalStockOnHand = inventories.reduce(
    (acc, curr) => acc + (Number(curr.current_stock) || 0),
    0
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Hero Welcome Banner */}
      <WelcomeBanner />

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Managed SKUs"
            value={products.length}
            icon={<Inventory2RoundedIcon />}
            color="#3B82F6"
            subtitle={`${products.length} active catalog items`}
            badgeText="Catalog Live"
            badgeColor="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Total Stock On-Hand"
            value={totalStockOnHand.toLocaleString()}
            icon={<WarehouseRoundedIcon />}
            color="#10B981"
            subtitle={`${inventories.length} inventory tracks`}
            badgeText="Stock Tracked"
            badgeColor="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Active Suppliers"
            value={suppliers.length}
            icon={<LocalShippingRoundedIcon />}
            color="#8B5CF6"
            subtitle="Verified sourcing vendors"
            badgeText="Sourcing Active"
            badgeColor="secondary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Procurement Orders"
            value={orders.length}
            icon={<ReceiptLongRoundedIcon />}
            color="#F59E0B"
            subtitle={`${analytics.pending_orders ?? 0} awaiting review`}
            badgeText={analytics.pending_orders ? `${analytics.pending_orders} Pending` : "Up to date"}
            badgeColor={analytics.pending_orders ? "warning" : "default"}
          />
        </Grid>
      </Grid>

      {/* Inventory Alerts & Recent Orders */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <LowStockCard inventories={inventories} products={products} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <RecentOrders
            loading={false}
            orders={orders}
            products={products}
            suppliers={suppliers}
          />
        </Grid>
      </Grid>

      {/* Analytics Visualizations */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OrderSummaryChart analytics={analytics} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <InventoryCategoryChart products={products} />
        </Grid>
      </Grid>

      {/* AI Quick Actions Module */}
      <AIQuickActions />
    </Box>
  );
}

export default Dashboard;
