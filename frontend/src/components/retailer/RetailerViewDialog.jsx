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
        {value || "-"}
      </Typography>
    </Box>
  );
}

function RetailerViewDialog({
  open,
  onClose,
  retailer,
}) {
  if (!retailer) return null;

  const chipColor =
    retailer.plan_tier === "enterprise"
      ? "secondary"
      : retailer.plan_tier === "growth"
      ? "primary"
      : "default";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Retailer Details
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
            {retailer.retailer_name}
          </Typography>

          <Chip
            label={
              retailer.plan_tier
                .charAt(0)
                .toUpperCase() +
              retailer.plan_tier.slice(1)
            }
            color={chipColor}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Retailer ID"
              value={
                retailer.retailer_id
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Retailer Name"
              value={
                retailer.retailer_name
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Industry Type"
              value={
                retailer.industry_type
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Contact Email"
              value={
                retailer.contact_email
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Plan Tier"
              value={
                retailer.plan_tier
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailItem
              label="Created At"
              value={new Date(
                retailer.created_at
              ).toLocaleString()}
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
export default RetailerViewDialog;