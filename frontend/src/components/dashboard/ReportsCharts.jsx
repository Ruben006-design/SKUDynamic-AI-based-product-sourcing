import {
  Grid,
  Paper,
  Typography,
  Box,
} from "@mui/material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

function ReportsCharts({
  analytics,
  weightages,
}) {
  const pieData = [
    {
      name: "Approved",
      value: analytics.approved_orders ?? 0,
    },
    {
      name: "Rejected",
      value: analytics.rejected_orders ?? 0,
    },
  ];

  const scoreData = weightages.map((w) => ({
    product: `P${w.product_id}`,
    score: Number(w.recommendation_score),
  }));

  return (
    <Grid container spacing={4}>
      {/* Order Status */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            height: "100%",
            borderRadius: 4,
            background:
              "linear-gradient(145deg,#1E293B,#111827)",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            mb={3}
          >
            Order Status
          </Typography>

          <Box height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={5}
                >
                  <Cell fill="#22C55E" />
                  <Cell fill="#EF4444" />
                </Pie>

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  height={40}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Recommendation Scores */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            height: "100%",
            borderRadius: 4,
            background:
              "linear-gradient(145deg,#1E293B,#111827)",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            mb={3}
          >
            Recommendation Scores
          </Typography>

          <Box height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                />

                <XAxis
                  dataKey="product"
                  tick={{ fill: "#CBD5E1" }}
                />

                <YAxis
                  tick={{ fill: "#CBD5E1" }}
                />

                <Tooltip />

                <Bar
                  dataKey="score"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default ReportsCharts;