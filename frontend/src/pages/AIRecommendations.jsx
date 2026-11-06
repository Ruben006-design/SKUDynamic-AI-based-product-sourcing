import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Stack,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import AIRecommendationCenter from "../components/dashboard/AIRecommendationCenter";
import {
  getProducts,
  getRetailers,
  getWeightConfigs,
} from "../services/dashboardService";

function AIRecommendations() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [weightConfigs, setWeightConfigs] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, retailersData, configsData] = await Promise.all([
          getProducts(),
          getRetailers(),
          getWeightConfigs(),
        ]);

        setProducts(productsData || []);
        setRetailers(retailersData || []);
        setWeightConfigs(configsData || []);
      } catch {
        // Silently handled — components degrade gracefully
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" fontWeight={700}>
          AI Reordering Recommendation Engine
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 800 }}>
          Generate inventory replenishment decisions using automated 8-factor statistical weight
          calibration, supplier lead-time optimization, and demand positioning.
        </Typography>
      </Box>

      {/* AI Workspace */}
      <AIRecommendationCenter
        retailers={retailers}
        weightConfigs={weightConfigs}
        products={products}
      />

      {/* Methodology Architecture Cards */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: "primary.main",
                  }}
                >
                  <AutoAwesomeRoundedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Dynamic Weight Calibration
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: "block" }}>
                Evaluates sales velocity, supplier quality, and stock durability against configured business
                rules to assign normalized factor weights summing exactly to 1.0.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.secondary.main, 0.12),
                    color: "secondary.main",
                  }}
                >
                  <TuneRoundedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Lead-Time Aware Positioning
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: "block" }}>
                Calculates exact inventory position (On-Hand + On-Order − Backorders) and prevents over-ordering
                by subtracting inbound shipments from replenishment targets.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: "success.main",
                  }}
                >
                  <AnalyticsRoundedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Multi-Criteria Sourcing
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: "block" }}>
                Selects the top-performing supplier based on minimum order quantity (MOQ), unit cost,
                historical delivery reliability, and confirmed transit lead time.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AIRecommendations;
