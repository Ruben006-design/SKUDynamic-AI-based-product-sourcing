import { useEffect, useState } from "react";
import {
  CircularProgress,
  Alert,
  Box,
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

        console.log("Products:", results[0]);
        console.log("Suppliers:", results[1]);
        console.log("Inventories:", results[2]);
        console.log("Analytics:", results[3]);
        console.log("Orders:", results[4]);
        console.log("Retailers:", results[5]);
        console.log("Weight Configs:", results[6]);
        console.log(results);

        if (results[0].status === "fulfilled") {
          setProducts(results[0].value);
        } else {
          console.error("Products API failed", results[0].reason);
        }

        if (results[1].status === "fulfilled") {
          setSuppliers(results[1].value);
        } else {
          console.error("Suppliers API failed", results[1].reason);
        }

        if (results[2].status === "fulfilled") {
          setInventories(results[2].value);
        } else {
          console.error("Inventories API failed", results[2].reason);
        }
        if (results[3].status === "fulfilled") {
          setAnalytics(results[3].value);
        } else {
          console.error("Analytics API failed", results[3].reason);
        }

        if (results[4].status === "fulfilled") {
          setOrders(results[4].value);
        } else {
          console.error("Orders API failed", results[4].reason);
        }
        if (results[5].status === "fulfilled") {
          setRetailers(results[5].value);
        } else {
          console.error("Retailers API failed", results[5].reason);
        }

        if (results[6].status === "fulfilled") {
          setWeightConfigs(results[6].value);
        } else {
          console.error("Weight Config API failed", results[6].reason);
        }

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);
  console.log("Products State:", products);
  console.log("Retailers State:", retailers);
  console.log("WeightConfigs State:", weightConfigs);
  if (loading) {
    return (
      <Box
        sx={{
          height: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
    return (
    <>
      {error && <Alert severity="error">{error}</Alert>}

      <WelcomeBanner />

      {/* KPI Cards */}
      <Grid container spacing={3} mt={1}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Products"
            value={products.length}
            icon={<Inventory2RoundedIcon />}
            color="#3B82F6"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Inventory"
            value={inventories.length}
            icon={<WarehouseRoundedIcon />}
            color="#10B981"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Suppliers"
            value={suppliers.length}
            icon={<LocalShippingRoundedIcon />}
            color="#8B5CF6"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Orders"
            value={analytics?.total_orders ?? 0}
            icon={<ReceiptLongRoundedIcon />}
            color="#F59E0B"
          />
        </Grid>
      </Grid>
      {/* AI Quick Actions */}
      <AIQuickActions />

      {/* Charts */}
      <Grid container spacing={3} mt={4}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <InventoryCategoryChart
            products={products}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <OrderSummaryChart
            analytics={analytics}
          />
        </Grid>
      </Grid>

      {/* Bottom Widgets */}
      <Grid container spacing={3} mt={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <RecentOrders
            loading={loading}
            orders={orders}
            products={products}
            suppliers={suppliers}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <LowStockCard
            inventories={inventories}
            products={products}
          />
        </Grid>
      </Grid>
    </>
  );
}
export default Dashboard;
