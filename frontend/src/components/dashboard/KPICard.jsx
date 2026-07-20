import {
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Box,
  Chip,
} from "@mui/material";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

function KPICard({
  title,
  value,
  icon,
  color = "#3B82F6",
}) {
  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 5,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        background: "background.paper",
        transition: "all .35s ease",

        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 45px rgba(0,0,0,.15)",
        },

        "&::before": {
          content: '""',
          position: "absolute",
          width: 190,
          height: 190,
          top: -80,
          right: -80,
          borderRadius: "50%",
          background: color,
          opacity: 0.08,
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h3"
              sx={{
                mt: 1,
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              {value}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              mt={2}
            >
              <Chip
                size="small"
                color="success"
                icon={<TrendingUpRoundedIcon />}
                label="+5% Today"
              />

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Updated just now
              </Typography>
            </Stack>
          </Box>

          <Avatar
            sx={{
              width: 68,
              height: 68,
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
              boxShadow: `0 10px 30px ${color}55`,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default KPICard;