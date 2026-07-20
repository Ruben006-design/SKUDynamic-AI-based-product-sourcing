import { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Chip,
  Avatar,
  Skeleton,
  Button,
  Divider,
} from "@mui/material";

import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

function statusColor(status) {
  switch ((status || "").toLowerCase()) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
}

function relativeTime(dateString) {
  if (!dateString) return "Unknown";

  const now = new Date();
  const date = new Date(dateString);

  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";

  if (diff < 3600)
    return `${Math.floor(diff / 60)} mins ago`;

  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hrs ago`;

  return date.toLocaleDateString();
}

function RecentOrders({
  loading = false,
  orders = [],
  products = [],
  suppliers = [],
}) {
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

  if (loading) {
    return (
      <Card
        sx={{
          borderRadius: 5,
          height: "100%",
        }}
      >
        <CardContent>
          <Skeleton
            variant="text"
            width={180}
            height={35}
          />

          {[1, 2, 3].map((item) => (
            <Box
              key={item}
              mt={3}
            >
              <Skeleton height={30} />
              <Skeleton width="70%" />
              <Skeleton width="50%" />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 5,
        height: "100%",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        transition: ".3s",

        "&:hover": {
          boxShadow: "0 20px 45px rgba(0,0,0,.12)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h6"
            fontWeight={800}
          >
            Recent Orders
          </Typography>

          <Button
            endIcon={<ArrowForwardRoundedIcon />}
            size="small"
          >
            View All
          </Button>
        </Stack>

        {orders.length === 0 ? (
          <Stack
            alignItems="center"
            spacing={2}
            py={5}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 60,
                height: 60,
              }}
            >
              <Inventory2RoundedIcon />
            </Avatar>

            <Typography
              variant="body1"
              fontWeight={600}
            >
              No Orders Available
            </Typography>

            <Typography
              color="text.secondary"
              textAlign="center"
            >
              AI recommendations will appear here after
              generating reorder suggestions.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {orders.slice(0, 5).map((order, index) => (
              <Box key={order.order_list_id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    transition: ".25s",

                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 48,
                        height: 48,
                      }}
                    >
                      <ShoppingBagRoundedIcon />
                    </Avatar>

                    <Box>
                      <Typography
                        fontWeight={700}
                      >
                        {productMap[
                          order.product_id
                        ] || "Unknown Product"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {supplierMap[
                          order.preferred_supplier_id
                        ] || "Unknown Supplier"}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Qty:{" "}
                        {order.recommended_order_qty} Units
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    spacing={1}
                    alignItems="flex-end"
                  >
                    <Chip
                      size="small"
                      color={statusColor(
                        order.status
                      )}
                      label={order.status}
                    />

                    <Chip
                      size="small"
                      variant="outlined"
                      label={`AI ${Number(
                        order.final_score
                      ).toFixed(1)}%`}
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {relativeTime(
                        order.generated_at
                      )}
                    </Typography>
                  </Stack>
                </Stack>

                {index !== orders.length - 1 && (
                  <Divider />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentOrders;