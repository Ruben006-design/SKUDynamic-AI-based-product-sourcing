import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

function LowStockCard({ inventories = [], products = [] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const productMap = {};
  products.forEach((product) => {
    productMap[product.product_id] = product;
  });

  const lowStockItems = inventories
    .map((inventory) => {
      const reorderPoint = inventory.reorder_point > 0 ? inventory.reorder_point : 1;
      const percentage = Math.min(
        Math.round((inventory.current_stock / reorderPoint) * 100),
        100
      );

      let status = "Healthy";
      let colorType = "success";

      if (percentage <= 30) {
        status = "Critical";
        colorType = "error";
      } else if (percentage <= 70) {
        status = "Low Stock";
        colorType = "warning";
      }

      return {
        ...inventory,
        percentage,
        status,
        colorType,
        productName:
          productMap[inventory.product_id]?.product_name ??
          `Product #${inventory.product_id}`,
      };
    })
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 5);

  return (
    <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" mb={0.5}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.warning.main, 0.12),
              color: "warning.main",
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Low Stock Alerts
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Items approaching reorder thresholds
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1.8 }} />

        {lowStockItems.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              All inventory levels are above reorder thresholds.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {lowStockItems.map((item) => {
              const barColor =
                item.colorType === "error"
                  ? theme.palette.error.main
                  : item.colorType === "warning"
                  ? theme.palette.warning.main
                  : theme.palette.success.main;

              return (
                <Box key={item.inventory_id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: "60%" }}>
                      {item.productName}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {item.current_stock} / {item.reorder_point} units
                      </Typography>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          borderRadius: 1,
                          bgcolor: alpha(barColor, isDark ? 0.15 : 0.1),
                          color: barColor,
                          border: `1px solid ${alpha(barColor, 0.25)}`,
                        }}
                      />
                    </Stack>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.06)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        backgroundColor: barColor,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default LowStockCard;
