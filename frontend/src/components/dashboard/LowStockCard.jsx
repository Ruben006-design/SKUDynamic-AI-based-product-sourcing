import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

function LowStockCard({ inventories = [], products = [] }) {
  const productMap = {};

  products.forEach((product) => {
    productMap[product.product_id] = product;
  });

  const lowStockItems = inventories
    .map((inventory) => {
      const percentage = Math.min(
        (inventory.current_stock / inventory.reorder_point) * 100,
        100
      );

      let status = "Healthy";
      let color = "success";

      if (percentage <= 30) {
        status = "Critical";
        color = "error";
      } else if (percentage <= 70) {
        status = "Low";
        color = "warning";
      }

      return {
        ...inventory,
        percentage,
        status,
        color,
        productName:
          productMap[inventory.product_id]?.product_name ??
          `Product #${inventory.product_id}`,
      };
    })
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 5);

  return (
    <Card
      sx={{
        borderRadius: 5,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        transition: ".3s",

        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 20px 40px rgba(0,0,0,.18)",
        },
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          mb={3}
        >
          <WarningAmberRoundedIcon color="warning" />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Low Stock Alerts
          </Typography>
        </Stack>

        <Stack spacing={3}>
          {lowStockItems.map((item) => (
            <Box key={item.inventory_id}>
              <Stack
                direction="row"
                justifyContent="space-between"
                mb={1}
              >
                <Typography
                  fontWeight={600}
                >
                  {item.productName}
                </Typography>

                <Chip
                  label={item.status}
                  color={item.color}
                  size="small"
                />
              </Stack>

              <LinearProgress
                variant="determinate"
                value={item.percentage}
                sx={{
                  height: 10,
                  borderRadius: 10,
                  mb: 1,
                }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Stock: {item.current_stock}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Reorder: {item.reorder_point}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default LowStockCard;