import {
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Divider,
} from "@mui/material";

const factors = [
  {
    key: "sales_volume_weight",
    label: "Sales Volume",
  },
  {
    key: "lead_time_weight",
    label: "Lead Time",
  },
  {
    key: "supplier_quality_weight",
    label: "Supplier Quality",
  },
  {
    key: "popularity_weight",
    label: "Popularity",
  },
  {
    key: "weather_weight",
    label: "Weather",
  },
  {
    key: "festival_demand_weight",
    label: "Festival Demand",
  },
  {
    key: "durability_weight",
    label: "Durability",
  },
  {
    key: "expiry_weight",
    label: "Expiry",
  },
];

function WeightDistributionCard({ weightage }) {
  if (!weightage) return null;

  return (
    <Card
      sx={{
        mt: 3,
        borderRadius: 5,
        background:
          "linear-gradient(135deg,#111827,#1E293B)",
        border:
          "1px solid rgba(255,255,255,.08)",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          mb={3}
        >
          AI Weight Distribution
        </Typography>

        <Stack spacing={3}>
          {factors.map((factor, index) => {
            const value =
              Number(weightage[factor.key]) || 0;

            return (
              <Stack
                key={factor.key}
                spacing={1}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography fontWeight={500}>
                    {factor.label}
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    {(value * 100).toFixed(1)}%
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={value * 100}
                  sx={{
                    height: 10,
                    borderRadius: 10,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 10,
                    },
                  }}
                />

                {index !==
                  factors.length - 1 && (
                  <Divider
                    sx={{
                      borderColor:
                        "rgba(255,255,255,.05)",
                    }}
                  />
                )}
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default WeightDistributionCard;