import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Chip,
  Box,
} from "@mui/material";

function DetailItem({ label, value }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.5,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography variant="body1" fontWeight={600}>
        {value ?? "-"}
      </Typography>
    </Box>
  );
}

function InventoryViewDialog({
  open,
  onClose,
  inventory,
}) {
  if (!inventory) return null;

  const health =
    inventory.current_stock <= inventory.reorder_point
      ? {
          label: "Low Stock",
          color: "error",
        }
      : {
          label: "Healthy",
          color: "success",
        };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Inventory Details
      </DialogTitle>

      <DialogContent dividers>

        {/* Header */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Inventory #{inventory.inventory_id}
          </Typography>

          <Chip
            label={health.label}
            color={health.color}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Basic Information */}

        <Typography
          variant="subtitle1"
          fontWeight={700}
          gutterBottom
        >
          Basic Information
        </Typography>

        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Inventory ID"
              value={inventory.inventory_id}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Product ID"
              value={inventory.product_id}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Retailer ID"
              value={inventory.retailer_id}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Last Updated"
              value={new Date(
                inventory.last_updated
              ).toLocaleString()}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Inventory */}

        <Typography
          variant="subtitle1"
          fontWeight={700}
          gutterBottom
        >
          Inventory Metrics
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem
              label="Current Stock"
              value={inventory.current_stock}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem
              label="Reserved Stock"
              value={inventory.reserved_stock}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem
              label="Safety Stock"
              value={inventory.safety_stock}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Reorder Point"
              value={inventory.reorder_point}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="EOQ"
              value={inventory.eoq}
            />
          </Grid>
        </Grid>

      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
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

export default InventoryViewDialog;