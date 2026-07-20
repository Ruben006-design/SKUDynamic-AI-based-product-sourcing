import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  Chip,
  LinearProgress,
  Grid,
  Box,
} from "@mui/material";

import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";

const factors = [
  {
    label: "Sales Volume",
    key: "sales_volume_weight",
  },
  {
    label: "Lead Time",
    key: "lead_time_weight",
  },
  {
    label: "Supplier Quality",
    key: "supplier_quality_weight",
  },
  {
    label: "Popularity",
    key: "popularity_weight",
  },
  {
    label: "Weather",
    key: "weather_weight",
  },
  {
    label: "Festival Demand",
    key: "festival_demand_weight",
  },
  {
    label: "Durability",
    key: "durability_weight",
  },
  {
    label: "Expiry",
    key: "expiry_weight",
  },
];

function WeightageViewDialog({
  open,
  onClose,
  weightage,
}) {
  if (!weightage) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
        },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <PsychologyRoundedIcon
            color="primary"
            sx={{ fontSize: 34 }}
          />

          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
            >
              AI Weightage Report
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              AI generated product analysis
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Recommendation Score
            </Typography>

            <Typography
              variant="h3"
              fontWeight={700}
            >
              {(
                weightage.recommendation_score *
                100
              ).toFixed(1)}
              %
            </Typography>

            <LinearProgress
              variant="determinate"
              value={
                weightage.recommendation_score *
                100
              }
              sx={{
                mt: 2,
                height: 10,
                borderRadius: 8,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              AI Model
            </Typography>

            <Chip
              color="primary"
              label={
                weightage.llm_model_used
              }
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Generated
            </Typography>

            <Typography mt={1}>
              {new Date(
                weightage.generated_at
              ).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography
          variant="h6"
          fontWeight={700}
          mb={3}
        >
          AI Weight Distribution
        </Typography>

        <Stack spacing={3}>
          {factors.map((factor) => {
            const value =
              Number(
                weightage[factor.key]
              ) || 0;

            return (
              <Stack
                key={factor.key}
                spacing={1}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography>
                    {factor.label}
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    {(value * 100).toFixed(1)}
                    %
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={value * 100}
                  sx={{
                    height: 10,
                    borderRadius: 10,
                  }}
                />
              </Stack>
            );
          })}
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 4 }}>
            <Typography
              color="text.secondary"
            >
              Product ID
            </Typography>

            <Typography>
              {weightage.product_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <Typography
              color="text.secondary"
            >
              Retailer ID
            </Typography>

            <Typography>
              {weightage.retailer_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <Typography
              color="text.secondary"
            >
              Config ID
            </Typography>

            <Typography>
              {weightage.config_id}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WeightageViewDialog;