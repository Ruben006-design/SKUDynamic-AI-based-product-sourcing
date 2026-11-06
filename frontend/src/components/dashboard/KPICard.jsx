import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Chip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

function KPICard({
  title,
  value,
  icon,
  color = "#3B82F6",
  subtitle,
  badgeText,
  badgeColor = "default",
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: alpha(color, 0.4),
          boxShadow: isDark
            ? `0 8px 24px ${alpha(color, 0.12)}`
            : `0 8px 24px ${alpha(color, 0.08)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontSize: "0.72rem",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                mb: 0.5,
                fontWeight: 700,
                lineHeight: 1.15,
                color: "text.primary",
              }}
            >
              {value ?? 0}
            </Typography>

            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(color, isDark ? 0.15 : 0.1),
              color: color,
              border: `1px solid ${alpha(color, 0.2)}`,
            }}
          >
            {icon}
          </Box>
        </Stack>

        {badgeText && (
          <Stack direction="row" alignItems="center" spacing={1} mt={2}>
            <Chip
              size="small"
              color={badgeColor}
              label={badgeText}
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 600,
                borderRadius: 1,
              }}
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default KPICard;
