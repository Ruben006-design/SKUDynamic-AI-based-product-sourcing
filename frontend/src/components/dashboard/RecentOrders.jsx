import { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Chip,
  Skeleton,
  Button,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import OrderStatusChip from "../order/OrderStatusChip";

function relativeTime(dateString) {
  if (!dateString) return "Recent";

  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

function RecentOrders({
  loading = false,
  orders = [],
  products = [],
  suppliers = [],
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.product_id] = p.product_name;
    });
    return map;
  }, [products]);

  const supplierMap = useMemo(() => {
    const map = {};
    suppliers.forEach((s) => {
      map[s.supplier_id] = s.supplier_name;
    });
    return map;
  }, [suppliers]);

  const displayedOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, height: "100%" }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width={160} height={28} />
          {[1, 2, 3, 4].map((item) => (
            <Box key={item} mt={2}>
              <Skeleton height={20} />
              <Skeleton width="60%" height={16} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Recent Orders
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Latest procurement activity
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: "14px !important" }} />}
            onClick={() => navigate("/orders")}
            sx={{ fontSize: "0.78rem", py: 0.5, px: 1 }}
          >
            All Orders
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {displayedOrders.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No recent orders found.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.8}>
            {displayedOrders.map((order) => {
              const productName = productMap[order.product_id] || `Product #${order.product_id}`;
              const supplierName = supplierMap[order.supplier_id] || `Supplier #${order.supplier_id}`;

              return (
                <Stack
                  key={order.order_id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "background.subtle",
                        color: "text.secondary",
                        flexShrink: 0,
                      }}
                    >
                      <Inventory2RoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{ fontSize: "0.85rem", color: "text.primary" }}
                      >
                        {productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", fontSize: "0.72rem" }}>
                        {supplierName} • {order.order_quantity} units
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center" flexShrink={0}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.72rem" }}>
                      {relativeTime(order.created_at)}
                    </Typography>
                    <OrderStatusChip status={order.order_status} />
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentOrders;
