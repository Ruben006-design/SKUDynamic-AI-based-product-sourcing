import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Snackbar,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import {
  generatePrompt,
  generateWeightage,
  generateBatchWeightage,
  generateRecommendation,
  generateBatchRecommendation,
} from "../../services/aiRecommendationService";

const FACTOR_LABELS = [
  { key: "sales_volume_weight", label: "Sales Volume (Velocity)", color: "#3B82F6" },
  { key: "lead_time_weight", label: "Lead Time Variability", color: "#6366F1" },
  { key: "supplier_quality_weight", label: "Supplier Reliability", color: "#10B981" },
  { key: "popularity_weight", label: "Product Popularity", color: "#8B5CF6" },
  { key: "weather_weight", label: "Seasonal / Weather Factor", color: "#06B6D4" },
  { key: "festival_demand_weight", label: "Festival / Promo Demand", color: "#F59E0B" },
  { key: "durability_weight", label: "Stock Durability", color: "#EC4899" },
  { key: "expiry_weight", label: "Expiry & Shelf Risk", color: "#EF4444" },
];

function AIRecommendationCenter({
  retailers = [],
  weightConfigs = [],
  products = [],
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";

  const [retailer, setRetailer] = useState("");
  const [config, setConfig] = useState("");
  const [product, setProduct] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const [prompt, setPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [weightage, setWeightage] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [weightGenerated, setWeightGenerated] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  /* -----------------------------
     Generate Prompt
  ------------------------------ */
  const handleGeneratePrompt = async () => {
    if (!retailer || !config || !product) {
      showMessage("Please select Retailer, Weight Configuration, and Product.", "warning");
      return;
    }

    try {
      setLoading(true);
      setLoadingText("Constructing 8-factor statistical prompt...");
      const response = await generatePrompt({
        retailer_id: retailer,
        config_id: config,
        product_id: product,
      });

      setPrompt(response.prompt ?? JSON.stringify(response, null, 2));
      setShowPrompt(true);
      showMessage("Analytical prompt constructed successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Prompt generation failed. Verify database connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     Generate Weightage
  ------------------------------ */
  const handleGenerateWeightage = async () => {
    if (!retailer || !config || !product) {
      showMessage("Please select Retailer, Configuration, and Product.", "warning");
      return;
    }

    try {
      setLoading(true);
      setLoadingText("Running local statistical weightage optimizer...");
      const response = await generateWeightage(product, {
        retailer_id: retailer,
        config_id: config,
      });

      setWeightage(response);
      setWeightGenerated(true);
      showMessage("8-factor weight distribution calculated successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Weightage generation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     Generate Recommendation
  ------------------------------ */
  const handleGenerateRecommendation = async () => {
    if (!weightGenerated) {
      showMessage("Please generate weights first to evaluate the decision model.", "warning");
      return;
    }

    try {
      setLoading(true);
      setLoadingText("Calculating inventory position and optimal supplier selection...");
      const response = await generateRecommendation(product, {
        retailer_id: retailer,
        config_id: config,
      });

      setRecommendation(response);
      showMessage("Reordering recommendation formulated successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Recommendation calculation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     Generate Batch Recommendations
  ------------------------------ */
  const handleGenerateBatch = async () => {
    if (!retailer || !config) {
      showMessage("Please select Retailer and Configuration for batch analysis.", "warning");
      return;
    }

    try {
      setLoading(true);
      setLoadingText("Batch processing all products under selected scope...");
      const response = await generateBatchRecommendation({
        retailer_id: retailer,
        config_id: config,
      });

      setBatchResults(response);
      showMessage(`Batch complete: Processed ${response.total_products} SKUs with ${response.recommended_orders} reorder recommendations.`);
    } catch (error) {
      console.error(error);
      showMessage("Batch generation encountered an error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyPromptToClipboard = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      showMessage("Prompt copied to clipboard.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Scope Selection Card */}
      <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
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
              <PsychologyRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Intelligence Scope Configuration
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select your retailer, weight calibration rules, and SKU to run the decision engine
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Target Retailer"
                value={retailer}
                onChange={(e) => setRetailer(e.target.value)}
              >
                {retailers.map((r) => (
                  <MenuItem key={r.retailer_id} value={r.retailer_id}>
                    {r.retailer_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Weight Calibration Rule"
                value={config}
                onChange={(e) => setConfig(e.target.value)}
              >
                {weightConfigs.map((c) => (
                  <MenuItem key={c.config_id} value={c.config_id}>
                    {c.config_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Target Product (SKU)"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                {products.map((p) => (
                  <MenuItem key={p.product_id} value={p.product_id}>
                    {p.product_name} (ID: {p.product_id})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Action Button Pipeline */}
          <Stack
            direction="row"
            spacing={1.5}
            mt={3}
            flexWrap="wrap"
            alignItems="center"
            gap={1}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<CodeRoundedIcon />}
              disabled={loading}
              onClick={handleGeneratePrompt}
            >
              View Prompt
            </Button>

            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AutoAwesomeRoundedIcon />}
              disabled={loading}
              onClick={handleGenerateWeightage}
            >
              1. Compute Weightages
            </Button>

            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<PlayArrowRoundedIcon />}
              disabled={loading || !weightGenerated}
              onClick={handleGenerateRecommendation}
            >
              2. Formulate Recommendation
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<AssessmentRoundedIcon />}
              disabled={loading}
              onClick={handleGenerateBatch}
            >
              Batch Run All Products
            </Button>
          </Stack>

          {loading && (
            <Box mt={3} p={2} sx={{ bgcolor: "background.subtle", borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={20} color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {loadingText || "Processing intelligence pipeline..."}
                </Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 2. Prompt Viewer (Collapsible) */}
      {prompt && (
        <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CodeRoundedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Engine Analytical Input Prompt
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={copyPromptToClipboard} startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}>
                  Copy
                </Button>
                <Button size="small" onClick={() => setShowPrompt((p) => !p)}>
                  {showPrompt ? "Hide" : "Show"}
                </Button>
              </Stack>
            </Stack>

            <Collapse in={showPrompt}>
              <Box
                sx={{
                  mt: 1.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? "#090D16" : "#F1F5F9",
                  fontFamily: "monospace",
                  fontSize: "0.82rem",
                  whiteSpace: "pre-wrap",
                  maxHeight: 280,
                  overflowY: "auto",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {prompt}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* 3. Weightage Output Card */}
      {weightage && (
        <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
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
                  <AutoAwesomeRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Calibrated 8-Factor Weight Distribution
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Model: {weightage.llm_model_used || "Local Statistical Engine"} • Product #{weightage.product_id}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={`Score: ${(Number(weightage.recommendation_score) > 1 ? Number(weightage.recommendation_score) : Number(weightage.recommendation_score) * 100).toFixed(1)} / 100`}
                color="primary"
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              {FACTOR_LABELS.map((factor) => {
                const val = Number(weightage[factor.key]) || 0;
                const percentage = Math.round(val * 100);

                return (
                  <Grid key={factor.key} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: "background.subtle",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: "70%" }}>
                          {factor.label}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color={factor.color}>
                          {percentage}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: factor.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 4. Recommendation Output Card */}
      {recommendation && (
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${
              recommendation.reorder_required
                ? alpha(theme.palette.warning.main, 0.4)
                : alpha(theme.palette.success.main, 0.4)
            }`,
            bgcolor: "background.paper",
            boxShadow: isDark
              ? "0 8px 30px rgba(0,0,0,0.3)"
              : "0 8px 30px rgba(15,23,42,0.06)",
          }}
        >
          <CardContent sx={{ p: 3.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={2}>
              <Box>
                <Stack direction="row" spacing={1.2} alignItems="center" mb={0.5}>
                  <Chip
                    icon={
                      recommendation.reorder_required ? (
                        <WarningAmberRoundedIcon sx={{ fontSize: "16px !important" }} />
                      ) : (
                        <CheckCircleRoundedIcon sx={{ fontSize: "16px !important" }} />
                      )
                    }
                    label={
                      recommendation.reorder_required
                        ? "REORDER REQUIRED"
                        : "STOCK LEVEL HEALTHY"
                    }
                    color={recommendation.reorder_required ? "warning" : "success"}
                    sx={{ fontWeight: 700, borderRadius: 1.5, px: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Generated: {new Date(recommendation.generated_at).toLocaleString()}
                  </Typography>
                </Stack>

                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                  {recommendation.product_name}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color={recommendation.reorder_required ? "primary" : "inherit"}
                onClick={() => navigate("/orders")}
                sx={{ px: 2.5, py: 1 }}
              >
                Go to Order Management
              </Button>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* Recommendation Metrics Grid */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    Recommended Order Quantity
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color={recommendation.reorder_required ? "primary.main" : "text.secondary"} sx={{ mt: 0.5 }}>
                    {recommendation.reorder_quantity} <Typography component="span" variant="body2" color="text.secondary">units</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Computed via Target Stock − Inventory Position
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    Recommendation Score
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="secondary.main" sx={{ mt: 0.5 }}>
                    {(Number(recommendation.recommendation_score) > 1 ? Number(recommendation.recommendation_score) : Number(recommendation.recommendation_score) * 100).toFixed(1)}
                    <Typography component="span" variant="body2" color="text.secondary"> / 100</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Weighted 8-factor composite threshold
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    Selected Supplier
                  </Typography>
                  <Typography variant="h6" fontWeight={700} noWrap sx={{ mt: 0.5 }}>
                    {recommendation.supplier_name || "Primary Sourcing Partner"}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                    <LocalShippingRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      Est. Lead Time: {recommendation.estimated_lead_time} days
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 5. Batch Results Table (If Batch Executed) */}
      {batchResults && (
        <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Batch Recommendation Summary
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Processed {batchResults.total_products} products • {batchResults.recommended_orders} recommended orders
                </Typography>
              </Box>
              <Chip
                label={`${batchResults.recommended_orders} Reorders Required`}
                color="warning"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Reorder Decision</TableCell>
                    <TableCell align="right">Qty (Units)</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell align="right">Lead Time</TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batchResults.recommendations.map((rec) => (
                    <TableRow key={rec.product_id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{rec.product_name}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={rec.reorder_required ? "Reorder" : "Adequate"}
                          color={rec.reorder_required ? "warning" : "success"}
                          sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {rec.reorder_quantity}
                      </TableCell>
                      <TableCell>{rec.supplier_name}</TableCell>
                      <TableCell align="right">{rec.estimated_lead_time}d</TableCell>
                      <TableCell align="right">
                        {(Number(rec.recommendation_score) > 1 ? Number(rec.recommendation_score) : Number(rec.recommendation_score) * 100).toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default AIRecommendationCenter;
