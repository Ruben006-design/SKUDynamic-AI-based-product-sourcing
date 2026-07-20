import {
  Paper,
  Typography,
  Box,
  Stack,
  Chip,
} from "@mui/material";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function OrderSummaryChart({ analytics }) {
  const approved = analytics?.approved_orders || 0;
  const rejected = analytics?.rejected_orders || 0;

  const total =
    analytics?.total_orders ||
    approved + rejected;

  const pending = Math.max(
    total - approved - rejected,
    0
  );

  const data = [
    {
      name: "Approved",
      value: approved,
      color: "#22C55E",
    },
    {
      name: "Pending",
      value: pending,
      color: "#F59E0B",
    },
    {
      name: "Rejected",
      value: rejected,
      color: "#EF4444",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 5,
        height: 420,
        border: "1px solid",
        borderColor: "divider",
        transition: ".3s",

        "&:hover": {
          boxShadow:
            "0 20px 45px rgba(0,0,0,.12)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={800}
          >
            Order Analytics
          </Typography>

          <Typography
            color="text.secondary"
            variant="body2"
          >
            Live order insights
          </Typography>
        </Box>

        <Chip
          icon={<TrendingUpRoundedIcon />}
          label="Live"
          color="success"
        />
      </Stack>

      <Typography
        variant="h3"
        fontWeight={800}
      >
        {total}
      </Typography>

      <Typography
        color="text.secondary"
        mb={3}
      >
        Total Orders
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        mb={3}
        flexWrap="wrap"
      >
        <Chip
          label={`Approved ${approved}`}
          color="success"
        />

        <Chip
          label={`Pending ${pending}`}
          color="warning"
        />

        <Chip
          label={`Rejected ${rejected}`}
          color="error"
        />
      </Stack>

      <Box
        sx={{
          height: 210,
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.08}
            />

            <XAxis dataKey="name" />

            <YAxis
              allowDecimals={false}
            />

            <Tooltip />

            <Bar
              dataKey="value"
              radius={[12, 12, 0, 0]}
              fill="#3B82F6"
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default OrderSummaryChart;