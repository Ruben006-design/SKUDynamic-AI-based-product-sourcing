import { useEffect, useState } from "react";

import AIRecommendationCenter from "../components/dashboard/AIRecommendationCenter";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from "@mui/material";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";

import {
  getProducts,
  getRetailers,
  getWeightConfigs,
} from "../services/dashboardService";

function AIRecommendations() {
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [weightConfigs, setWeightConfigs] = useState([]);
  

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, retailersData, configsData] =
          await Promise.all([
            getProducts(),
            getRetailers(),
            getWeightConfigs(),
          ]);

        setProducts(productsData);
        setRetailers(retailersData);
        setWeightConfigs(configsData);

        console.log("Products:", productsData);
        console.log("Retailers:", retailersData);
        console.log("Weight Configs:", configsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800}>
          AI Recommendation Engine
        </Typography>

        <Typography color="text.secondary" mt={1}>
          Generate intelligent product reorder recommendations using
          AI-based weight analysis, supplier quality, inventory,
          popularity and demand prediction.
        </Typography>
      </Box>

      {/* AI Workspace */}
      <AIRecommendationCenter
        retailers={retailers}
        weightConfigs={weightConfigs}
        products={products}
      />

      {/* Information Cards */}
      <Grid container spacing={3} mt={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <AutoAwesomeRoundedIcon
                color="primary"
                sx={{ fontSize: 40 }}
              />

              <Typography variant="h5" fontWeight={700} mt={2}>
                AI Ready
              </Typography>

              <Typography color="text.secondary">
                Gemini AI engine connected successfully.
              </Typography>

              <Chip
                label="Online"
                color="success"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <PsychologyRoundedIcon
                color="secondary"
                sx={{ fontSize: 40 }}
              />

              <Typography variant="h5" fontWeight={700} mt={2}>
                Smart Prediction
              </Typography>

              <Typography color="text.secondary">
                Generates reorder decisions using inventory,
                sales, supplier and weight configuration.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <AnalyticsRoundedIcon
                color="success"
                sx={{ fontSize: 40 }}
              />

              <Typography variant="h5" fontWeight={700} mt={2}>
                Analytics
              </Typography>

              <Typography color="text.secondary">
                Visualize recommendation scores,
                reorder quantities and AI confidence.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AIRecommendations;