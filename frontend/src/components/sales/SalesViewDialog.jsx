import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Box,
  Chip,
} from "@mui/material";

function DetailItem({ label, value }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.5,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        fontWeight={600}
      >
        {value ?? "-"}
      </Typography>
    </Box>
  );
}

function SalesViewDialog({
  open,
  onClose,
  sale,
  products = [],
  retailers = [],
}) {
  if (!sale) return null;

  const product =
    products.find(
      (p) =>
        p.product_id === sale.product_id
    )?.product_name || sale.product_id;

  const retailer =
    retailers.find(
      (r) =>
        r.retailer_id === sale.retailer_id
    )?.retailer_name || sale.retailer_id;

  let chipColor = "error";
  let chipLabel = "Low";

  if (sale.popularity_score >= 8) {
    chipColor = "success";
    chipLabel = "High";
  } else if (sale.popularity_score >= 5) {
    chipColor = "warning";
    chipLabel = "Medium";
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Sale Details
      </DialogTitle>

      <DialogContent dividers>
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
            Sale #{sale.sale_id}
          </Typography>

          <Chip
            color={chipColor}
            label={`${chipLabel} Popularity`}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Product"
              value={product}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Retailer"
              value={retailer}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Sale Date"
              value={new Date(
                sale.sale_date
              ).toLocaleDateString()}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Quantity Sold"
              value={sale.quantity_sold}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Revenue"
              value={`₹${Number(
                sale.revenue
              ).toLocaleString()}`}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Popularity Score"
              value={sale.popularity_score}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <DetailItem
              label="Sales Channel"
              value={sale.sales_channel}
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

export default SalesViewDialog;