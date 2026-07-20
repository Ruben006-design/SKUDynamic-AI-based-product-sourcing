import { useEffect, useState } from "react";

import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";

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

function Reports() {
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

      setAnalytics(analyticsData);
      setWeightages(weightagesData);
      setProducts(productsData);
      setInventories(inventoryData);
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
      a.download = "orders.csv";

      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <LoadingSpinner />;
    return (
    <Box>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 5,
          background:
            "linear-gradient(135deg,#2563EB,#4F46E5,#7C3AED)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography variant="h3" fontWeight={800}>
          Reports & Analytics
        </Typography>

        <Typography
          sx={{
            mt: 1,
            opacity: 0.9,
            fontSize: 18,
          }}
        >
          AI Powered Inventory Intelligence Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="h4" fontWeight={800}>
              {products.length}
            </Typography>
            <Typography variant="body2">
              Products
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="h4" fontWeight={800}>
              {weightages.length}
            </Typography>
            <Typography variant="body2">
              AI Weightages
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="h4" fontWeight={800}>
              {analytics.total_orders ?? 0}
            </Typography>
            <Typography variant="body2">
              Orders
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="h4" fontWeight={800}>
              {inventories.length}
            </Typography>
            <Typography variant="body2">
              Inventory
            </Typography>
          </Grid>

          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleExport}
              sx={{
                bgcolor: "white",
                color: "#2563EB",
                fontWeight: 700,
                px: 4,
                "&:hover": {
                  bgcolor: "#F8FAFC",
                },
              }}
            >
              Export AI Report
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* KPI Cards */}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard
            title="Products"
            value={products.length}
            icon={<AnalyticsRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard
            title="Weightages"
            value={weightages.length}
            icon={<AnalyticsRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard
            title="Orders"
            value={analytics.total_orders ?? 0}
            icon={<AnalyticsRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard
            title="Inventory"
            value={inventories.length}
            icon={<AnalyticsRoundedIcon />}
          />
        </Grid>
      </Grid>

      {/* AI Insights */}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderRadius: 4,
              background:
                "linear-gradient(135deg,#1E293B,#111827)",
            }}
          >
            <CardContent>
              <Typography color="text.secondary">
                Average Recommendation
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {weightages.length
                  ? (
                      weightages.reduce(
                        (sum, w) =>
                          sum + Number(w.recommendation_score),
                        0
                      ) / weightages.length
                    ).toFixed(2)
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderRadius: 4,
              background:
                "linear-gradient(135deg,#1E293B,#111827)",
            }}
          >
            <CardContent>
              <Typography color="text.secondary">
                AI Model
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
              >
                Gemini 2.5 Flash
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderRadius: 4,
              background:
                "linear-gradient(135deg,#1E293B,#111827)",
            }}
          >
            <CardContent>
              <Typography color="text.secondary">
                Approved Orders
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {analytics.approved_orders ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderRadius: 4,
              background:
                "linear-gradient(135deg,#1E293B,#111827)",
            }}
          >
            <CardContent>
              <Typography color="text.secondary">
                Rejected Orders
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {analytics.rejected_orders ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}

      <Card
        sx={{
          mt: 4,
          borderRadius: 5,
          background:
            "linear-gradient(135deg,#111827,#1E293B)",
          border:
            "1px solid rgba(255,255,255,.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <ReportsCharts
            analytics={analytics}
            weightages={weightages}
            inventories={inventories}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default Reports;