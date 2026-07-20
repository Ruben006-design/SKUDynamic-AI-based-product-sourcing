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

function ProductSupplierViewDialog({
  open,
  onClose,
  productSupplier,
  products = [],
  suppliers = [],
}) {
  if (!productSupplier) return null;

  const product = products.find(
    (p) =>
      p.product_id === productSupplier.product_id
  );

  const supplier = suppliers.find(
    (s) =>
      s.supplier_id ===
      productSupplier.supplier_id
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Product Supplier Details
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Product
            </Typography>

            <Typography variant="body1">
              {product?.product_name ??
                productSupplier.product_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Supplier
            </Typography>

            <Typography variant="body1">
              {supplier?.supplier_name ??
                productSupplier.supplier_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Negotiated Price
            </Typography>

            <Typography>
              ₹
              {Number(
                productSupplier.negotiated_price
              ).toLocaleString()}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Preferred
            </Typography>

            <Chip
              label={
                productSupplier.is_preferred
                  ? "Yes"
                  : "No"
              }
              color={
                productSupplier.is_preferred
                  ? "success"
                  : "default"
              }
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Contract Start
            </Typography>

            <Typography>
              {
                productSupplier.contract_start
              }
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Contract End
            </Typography>

            <Typography>
              {productSupplier.contract_end}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Product Supplier ID
            </Typography>

            <Typography>
              {
                productSupplier.product_supplier_id
              }
            </Typography>
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

export default ProductSupplierViewDialog;