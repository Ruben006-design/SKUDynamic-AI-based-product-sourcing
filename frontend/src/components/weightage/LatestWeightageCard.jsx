import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Stack,
  Box,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";

function LatestWeightageCard({ weightage }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!weightage) return null;

  const rawScore = Number(weightage.recommendation_score) || 0;
  // Normalized 0-100 scale handling
  const normalizedScore = rawScore > 1 ? rawScore : rawScore * 100;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2.5}
          flexWrap="wrap"
          gap={1.5}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: "secondary.main",
              }}
            >
              <PsychologyRoundedIcon fontSize="small" />
            </Box>
            <div>
              <Typography variant="subtitle1" fontWeight={700}>
                Latest AI Weight Calibration
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Evaluated for Product #{weightage.product_id}
              </Typography>
            </div>
          </Stack>

          <Chip
            label={weightage.llm_model_used || "Statistical Engine"}
            size="small"
            color="primary"
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
        </Stack>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Recommendation Score
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, color: "primary.main" }}>
                {normalizedScore.toFixed(1)}
                <Typography component="span" variant="body2" color="text.secondary"> / 100</Typography>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(normalizedScore, 100)}
                sx={{
                  mt: 1.5,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: "primary.main",
                  },
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Dominant Demand Factor
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                Sales Volume Velocity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Weight: {(Number(weightage.sales_volume_weight) * 100).toFixed(1)}% contribution
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Supplier Lead Time Impact
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                Lead Time Weight
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Weight: {(Number(weightage.lead_time_weight) * 100).toFixed(1)}% contribution
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default LatestWeightageCard;
