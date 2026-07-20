import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Divider,
} from "@mui/material";

function Item({ label, value }) {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        fontWeight={600}
        sx={{ mt: 0.5 }}
      >
        {value}
      </Typography>
    </Grid>
  );
}

function WeightConfigViewDialog({
  open,
  onClose,
  config,
  retailers = [],
}) {
  if (!config) return null;

  const retailer =
    retailers.find(
      (r) =>
        r.retailer_id === config.retailer_id
    )?.retailer_name || config.retailer_id;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Weight Configuration Details
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Item
            label="Configuration Name"
            value={config.config_name}
          />

          <Item
            label="Retailer"
            value={retailer}
          />

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          <Item
            label="Sales Volume"
            value={config.sales_volume_w}
          />

          <Item
            label="Lead Time"
            value={config.lead_time_w}
          />

          <Item
            label="Supplier Quality"
            value={config.supplier_quality_w}
          />

          <Item
            label="Popularity"
            value={config.popularity_w}
          />

          <Item
            label="Weather"
            value={config.weather_w}
          />

          <Item
            label="Festival Demand"
            value={config.festival_demand_w}
          />

          <Item
            label="Durability"
            value={config.durability_w}
          />

          <Item
            label="Expiry"
            value={config.expiry_w}
          />

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Status
            </Typography>

            <br />

            <Chip
              label={
                config.is_active
                  ? "Active"
                  : "Inactive"
              }
              color={
                config.is_active
                  ? "success"
                  : "default"
              }
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WeightConfigViewDialog;