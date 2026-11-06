import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";

function WelcomeBanner() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";

  // Dynamic greeting based on client time
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3.5,
        p: { xs: 3, md: 3.5 },
        bgcolor: isDark ? alpha("#0F172A", 0.95) : "#FFFFFF",
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isDark
          ? "0 4px 20px rgba(0, 0, 0, 0.25)"
          : "0 2px 12px rgba(15, 23, 42, 0.05)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={3}
      >
        <Box sx={{ maxWidth: 720 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: "14px !important" }} />}
              label="Local Statistical Engine Active"
              color="success"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.72rem",
                height: 24,
                borderRadius: 1.5,
              }}
            />
            <Chip
              icon={<StorageRoundedIcon sx={{ fontSize: "14px !important" }} />}
              label="Live MySQL Operational"
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.72rem",
                height: 24,
                borderRadius: 1.5,
                borderColor: theme.palette.divider,
              }}
            />
          </Stack>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "text.primary",
              mb: 1,
            }}
          >
            {greeting}, Operations Team
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              fontSize: "0.9rem",
            }}
          >
            Monitor inventory health, review real-time stock levels, and generate automated
            8-factor supplier reorder recommendations with verified lead-time demand calculations.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexShrink={0}>
          <Button
            variant="outlined"
            onClick={() => navigate("/orders")}
            sx={{ px: 2.2, py: 1 }}
          >
            View Orders
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AutoAwesomeRoundedIcon />}
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate("/ai-recommendations")}
            sx={{ px: 2.5, py: 1 }}
          >
            Run Recommendations
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default WelcomeBanner;
