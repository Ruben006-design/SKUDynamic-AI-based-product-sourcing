import {
  Box,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

function EmptyState({
  title = "No Data Found",
  subtitle = "There are no records to display at this time.",
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: "center",
        borderRadius: 3,
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.subtle || "#1E293B", 0.3),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.text.disabled, 0.1),
          color: "text.secondary",
          mb: 1.5,
        }}
      >
        <InboxRoundedIcon sx={{ fontSize: 28 }} />
      </Box>

      <Typography
        variant="subtitle1"
        fontWeight={700}
        color="text.primary"
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5, maxWidth: 400 }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}

export default EmptyState;
