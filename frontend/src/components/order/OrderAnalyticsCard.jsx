import {
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

function OrderAnalyticsCard({
  analytics,
}) {
  if (!analytics) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          Order Analytics
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography
              variant="caption"
            >
              Total Orders
            </Typography>

            <Typography variant="h5">
              {analytics.total_orders ??
                0}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography
              variant="caption"
            >
              Pending
            </Typography>

            <Typography
              variant="h5"
              color="warning.main"
            >
              {analytics.pending_orders ??
                0}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography
              variant="caption"
            >
              Approved
            </Typography>

            <Typography
              variant="h5"
              color="success.main"
            >
              {analytics.approved_orders ??
                0}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography
              variant="caption"
            >
              Rejected
            </Typography>

            <Typography
              variant="h5"
              color="error.main"
            >
              {analytics.rejected_orders ??
                0}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default OrderAnalyticsCard;