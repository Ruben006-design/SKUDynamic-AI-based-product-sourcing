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

      <Typography variant="body1" fontWeight={600}>
        {value || "-"}
      </Typography>
    </Box>
  );
}

function SupplierViewDialog({
  open,
  onClose,
  supplier,
  retailers = [],
}) {
  if (!supplier) return null;

  const retailer = retailers.find(
    (r) => r.retailer_id === supplier.retailer_id
  );

  const quality =
    Number(supplier.quality_score) >= 0.9
      ? {
          label: "Excellent",
          color: "success",
        }
      : Number(supplier.quality_score) >= 0.75
      ? {
          label: "Good",
          color: "primary",
        }
      : {
          label: "Average",
          color: "warning",
        };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Supplier Details
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
            {supplier.supplier_name}
          </Typography>

          <Chip
            label={quality.label}
            color={quality.color}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant="subtitle1"
          fontWeight={700}
          gutterBottom
        >
          Supplier Information
        </Typography>

        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Supplier ID"
              value={supplier.supplier_id}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Retailer"
              value={
                retailer?.retailer_name ??
                supplier.retailer_id
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Supplier Name"
              value={supplier.supplier_name}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Contact Person"
              value={supplier.contact_person}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Email"
              value={supplier.email}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Phone"
              value={supplier.phone}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant="subtitle1"
          fontWeight={700}
          gutterBottom
        >
          Performance Metrics
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Lead Time (Days)"
              value={supplier.lead_time_days}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Quality Score"
              value={supplier.quality_score}
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

export default SupplierViewDialog;