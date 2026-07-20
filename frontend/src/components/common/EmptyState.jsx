import {
  Box,
  Typography,
} from "@mui/material";

import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

function EmptyState({
  title = "No Data Found",
  subtitle = "There is nothing to display.",
}) {
  return (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
      }}
    >
      <Inventory2RoundedIcon
        sx={{
          fontSize: 70,
          color: "text.secondary",
        }}
      />

      <Typography
        variant="h5"
        fontWeight={700}
        mt={2}
      >
        {title}
      </Typography>

      <Typography
        color="text.secondary"
        mt={1}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}

export default EmptyState;