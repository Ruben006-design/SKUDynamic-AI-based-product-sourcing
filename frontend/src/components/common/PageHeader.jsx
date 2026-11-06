import {
  Box,
  Typography,
  Stack,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

function PageHeader({
  title,
  subtitle,
  icon,
  action,
}) {
  const theme = useTheme();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={2}
      mb={3}
    >
      <Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
              }}
            >
              {icon}
            </Box>
          )}

          <Typography
            variant="h5"
            fontWeight={700}
            letterSpacing="-0.015em"
          >
            {title}
          </Typography>
        </Stack>

        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, maxWidth: 850 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {action && (
        <Box sx={{ flexShrink: 0 }}>
          {action}
        </Box>
      )}
    </Stack>
  );
}

export default PageHeader;
