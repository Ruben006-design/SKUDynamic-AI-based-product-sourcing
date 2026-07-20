import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
} from "@mui/material";

import OrderStatusChip from "./OrderStatusChip";

function OrderViewDialog({
  open,
  onClose,
  order,
}) {
  if (!order) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Order Details
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Order ID
            </Typography>

            <Typography>
              {order.order_list_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Status
            </Typography>

            <OrderStatusChip
              status={order.status}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Product
            </Typography>

            <Typography>
              {order.product_name ??
                order.product_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Retailer
            </Typography>

            <Typography>
              {order.retailer_name ??
                order.retailer_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Preferred Supplier
            </Typography>

            <Typography>
              {order.supplier_name ??
                order.preferred_supplier_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Weightage
            </Typography>

            <Typography>
              #{order.weightage_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Recommended Quantity
            </Typography>

            <Typography>
              {order.recommended_order_qty}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Final Score
            </Typography>

            <Typography
              color="primary.main"
              fontWeight={700}
            >
              {order.final_score}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Justification Summary
            </Typography>

            <Typography>
              {order.justification_summary}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Approved By
            </Typography>

            <Typography>
              {order.approved_by || "-"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Approved At
            </Typography>

            <Typography>
              {order.approved_at
                ? new Date(
                    order.approved_at
                  ).toLocaleString()
                : "-"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Generated At
            </Typography>

            <Typography>
              {new Date(
                order.generated_at
              ).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrderViewDialog;