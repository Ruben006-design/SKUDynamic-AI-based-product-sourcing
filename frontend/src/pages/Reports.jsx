import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";

import {
  getOrderAnalytics,
  exportOrdersCSV,
} from "../services/orderService";
import { getWeightages } from "../services/weightageService";
import { getProducts } from "../services/productService";
import { getInventories } from "../services/inventoryService";

import LoadingSpinner from "../components/common/LoadingSpinner";
import KPICard from "../components/dashboard/KPICard";
import ReportsCharts from "../components/dashboard/ReportsCharts";
import PageHeader from "../components/common/PageHeader";

function Reports() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [weightages, setWeightages] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const [
        analyticsData,
        weightagesData,
        productsData,
        inventoryData,
      ] = await Promise.all([
        getOrderAnalytics(),
        getWeightages(),
        getProducts(),
        getInventories(),
      ]);

      setAnalytics(analyticsData || {});
      setWeightages(weightagesData || []);
      setProducts(productsData || []);
      setInventories(inventoryData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const blob = await exportOrdersCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders_export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <LoadingSpinner />;

  const totalOrders = analytics.total_orders || 0;
  const approvedOrders = analytics.approved_orders || 0;
  const pendingOrders = analytics.pending_orders || 0;
  const rejectedOrders = analytics.rejected_orders || 0;

  const approvalRate =
    totalOrders > 0 ? Math.round((approvedOrders / totalOrders) * 100) : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <PageHeader
        title="Procurement & Sourcing Analytics"
        subtitle="Comprehensive breakdown of order approvals, stock turnover, and AI scoring metrics"
        icon={<AssessmentRoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExport}
          >
            Export Orders CSV
          </Button>
        }
      />

      {/* KPI Performance Bar */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Total Procurement Orders"
            value={totalOrders}
            icon={<AssessmentRoundedIcon />}
            color="#3B82F6"
            subtitle="Logged replenishment orders"
            badgeText={`${totalOrders} Processed`}
            badgeColor="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Approval Efficiency"
            value={`${approvalRate}%`}
            icon={<CheckCircleOutlineRoundedIcon />}
            color="#10B981"
            subtitle={`${approvedOrders} approved by procurement`}
            badgeText="Operational"
            badgeColor="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Pending Review"
            value={pendingOrders}
            icon={<PendingActionsRoundedIcon />}
            color="#F59E0B"
            subtitle="Requires manager sign-off"
            badgeText={pendingOrders > 0 ? "Action Required" : "Cleared"}
            badgeColor={pendingOrders > 0 ? "warning" : "default"}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Calibrated Weightages"
            value={weightages.length}
            icon={<CheckCircleOutlineRoundedIcon />}
            color="#8B5CF6"
            subtitle="Active SKU score profiles"
            badgeText="Local Engine"
            badgeColor="secondary"
          />
        </Grid>
      </Grid>

      {/* Visual Analytics Charts */}
      <ReportsCharts analytics={analytics} weightages={weightages} />
    </Box>
  );
}

export default Reports;
