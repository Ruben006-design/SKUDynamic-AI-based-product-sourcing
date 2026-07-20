import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Stack,
} from "@mui/material";

import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";

function LatestWeightageCard({ weightage }) {
  if (!weightage) return null;

  return (
    <Card
      sx={{
        borderRadius: 5,
        background:
          "linear-gradient(135deg,#0F172A,#1E293B)",
        border:
          "1px solid rgba(255,255,255,.08)",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <PsychologyRoundedIcon
              sx={{
                fontSize: 42,
                color: "#6366F1",
              }}
            />

            <div>
              <Typography
                variant="h5"
                fontWeight={700}
              >
                Latest AI Weightage
              </Typography>

              <Typography color="text.secondary">
                Most recent AI analysis
              </Typography>
            </div>
          </Stack>

          <Chip
            label={weightage.llm_model_used}
            color="primary"
          />
        </Stack>

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
                weightage.recommendation_score * 100
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
                borderRadius: 10,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              color="text.secondary"
            >
              Product ID
            </Typography>

            <Typography variant="h5">
              {weightage.product_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              color="text.secondary"
            >
              Generated
            </Typography>

            <Typography>
              {new Date(
                weightage.generated_at
              ).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default LatestWeightageCard;