import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";

function OrderAnalyticsCard({ analytics }) {
  const theme = useTheme();

  if (!analytics) return null;

  const total = analytics.total_orders ?? 0;
  const pending = analytics.pending_orders ?? 0;
  const approved = analytics.approved_orders ?? 0;
  const rejected = analytics.rejected_orders ?? 0;

  return (
    <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <ReceiptLongRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Total Orders
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700}>
                {total}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <PendingActionsRoundedIcon sx={{ fontSize: 16, color: "warning.main" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Pending Review
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {pending}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16, color: "success.main" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Approved
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {approved}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.subtle", border: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <HighlightOffRoundedIcon sx={{ fontSize: 16, color: "error.main" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Rejected
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700} color="error.main">
                {rejected}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default OrderAnalyticsCard;
