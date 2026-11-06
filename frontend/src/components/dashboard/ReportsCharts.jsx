import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
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

function ReportsCharts({ analytics = {}, weightages = [] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const approved = analytics.approved_orders ?? 0;
  const pending = analytics.pending_orders ?? 0;
  const rejected = analytics.rejected_orders ?? 0;

  const pieData = [
    { name: "Approved", value: approved, color: "#10B981" },
    { name: "Pending", value: pending, color: "#F59E0B" },
    { name: "Rejected", value: rejected, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  const fallbackPie = pieData.length > 0 ? pieData : [{ name: "No Data", value: 1, color: "#64748B" }];

  const scoreData = weightages.slice(0, 10).map((w) => {
    const raw = Number(w.recommendation_score) || 0;
    const score = raw > 1 ? raw : raw * 100;
    return {
      product: `SKU #${w.product_id}`,
      score: Number(score.toFixed(1)),
    };
  });

  return (
    <Grid container spacing={2.5}>
      {/* 1. Order Status Breakdown */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ borderRadius: 3, height: "100%", border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <div>
                <Typography variant="subtitle1" fontWeight={700}>
                  Order Disposition Breakdown
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Status breakdown of procurement workflow
                </Typography>
              </div>
              <Chip label="Real-time" size="small" sx={{ fontSize: "0.7rem", height: 20 }} />
            </Stack>

            <Box height={280} sx={{ mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fallbackPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {fallbackPie.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 2. Top Recommendation Scores */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Card sx={{ borderRadius: 3, height: "100%", border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <div>
                <Typography variant="subtitle1" fontWeight={700}>
                  Top AI Reordering Scores by SKU
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  8-factor composite scores (0–100 scale; scores above 70 indicate urgent replenishment)
                </Typography>
              </div>
              <Chip label="Top 10 SKUs" size="small" color="primary" sx={{ fontSize: "0.7rem", height: 20 }} />
            </Stack>

            <Box height={280} sx={{ mt: 1 }}>
              {scoreData.length === 0 ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography variant="body2" color="text.secondary">
                    No weightage records calculated yet.
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.08 : 0.4} />
                    <XAxis
                      dataKey="product"
                      fontSize={11}
                      tickLine={false}
                      stroke={theme.palette.text.secondary}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[0, 100]}
                      fontSize={11}
                      tickLine={false}
                      stroke={theme.palette.text.secondary}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                        borderColor: theme.palette.divider,
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(val) => [`${val} / 100`, "Score"]}
                    />
                    <Bar
                      dataKey="score"
                      radius={[6, 6, 0, 0]}
                      fill={theme.palette.primary.main}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default ReportsCharts;
