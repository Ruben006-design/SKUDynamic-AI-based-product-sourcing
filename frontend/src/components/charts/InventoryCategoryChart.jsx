import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Paper,
  Typography,
  Box,
} from "@mui/material";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
];

function InventoryCategoryChart({ products = [] }) {
  const grouped = {};

  products.forEach((p) => {
    const category = p.category || "Others";
    grouped[category] = (grouped[category] || 0) + 1;
  });

  const data = Object.keys(grouped).map((key) => ({
    name: key,
    value: grouped[key],
  }));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        height: 420,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 2,
        }}
      >
        Product Categories
      </Typography>

      <Box
        sx={{
          flex: 1,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={45}
              outerRadius={90}
              paddingAngle={3}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{
                fontSize: "13px",
                paddingTop: "15px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default InventoryCategoryChart;