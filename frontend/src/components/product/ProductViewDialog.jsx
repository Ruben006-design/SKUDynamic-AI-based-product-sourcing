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

function ProductViewDialog({
  open,
  onClose,
  product,
}) {
  if (!product) return null;

  const DetailItem = ({
    label,
    value,
  }) => (
    <Grid size={{ xs: 12, md: 6 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mt: 0.5,
          fontWeight: 500,
        }}
      >
        {value || "-"}
      </Typography>
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Product Details
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ mt: 2 }}>
        <Grid
          container
          spacing={3}
        >
          <DetailItem
            label="Product ID"
            value={product.product_id}
          />

          <DetailItem
            label="Retailer ID"
            value={product.retailer_id}
          />

          <DetailItem
            label="Product Name"
            value={product.product_name}
          />

          <DetailItem
            label="Category"
            value={product.category}
          />

          <DetailItem
            label="SKU Code"
            value={product.sku_code}
          />

          <DetailItem
            label="Unit Cost"
            value={product.unit_cost}
          />

          <DetailItem
            label="Durability (Days)"
            value={product.durability_days}
          />

          <DetailItem
            label="Expiry Date"
            value={product.expiry_date}
          />

          <DetailItem
            label="Created At"
            value={product.created_at}
          />
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

export default ProductViewDialog;