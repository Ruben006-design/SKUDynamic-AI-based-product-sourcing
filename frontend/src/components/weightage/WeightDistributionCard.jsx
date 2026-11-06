import {
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Divider,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

const factors = [
  { key: "sales_volume_weight", label: "Sales Volume (Velocity)", color: "#3B82F6" },
  { key: "lead_time_weight", label: "Lead Time Variability", color: "#6366F1" },
  { key: "supplier_quality_weight", label: "Supplier Quality", color: "#10B981" },
  { key: "popularity_weight", label: "Popularity Index", color: "#8B5CF6" },
  { key: "weather_weight", label: "Weather Seasonality", color: "#06B6D4" },
  { key: "festival_demand_weight", label: "Festival / Event Surge", color: "#F59E0B" },
  { key: "durability_weight", label: "Stock Durability", color: "#EC4899" },
  { key: "expiry_weight", label: "Expiry / Shelf Risk", color: "#EF4444" },
];

function WeightDistributionCard({ weightage }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!weightage) return null;

  // Calculate sum of weights for integrity feedback
  const sumWeights = factors.reduce(
    (acc, factor) => acc + (Number(weightage[factor.key]) || 0),
    0
  );

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <div>
            <Typography variant="subtitle1" fontWeight={700}>
              8-Factor Weight Distribution Analysis
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Factor contributions calibrated to evaluate target SKU reorder priority
            </Typography>
          </div>

          <Chip
            icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: "14px !important" }} />}
            label={`Sum: ${sumWeights.toFixed(2)} / 1.00`}
            size="small"
            color="success"
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        <Grid container spacing={2}>
          {factors.map((factor) => {
            const value = Number(weightage[factor.key]) || 0;
            const percentage = Math.round(value * 100);

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
                        borderRadius: 3,
                        bgcolor: factor.color,
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
  );
}

export default WeightDistributionCard;
