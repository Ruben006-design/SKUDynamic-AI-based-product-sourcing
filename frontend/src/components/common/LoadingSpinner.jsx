import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

function LoadingSpinner({
  message = "Loading..."
}) {
  return (
    <Box
      sx={{
        height: "60vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress size={50} />

      <Typography color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default LoadingSpinner;