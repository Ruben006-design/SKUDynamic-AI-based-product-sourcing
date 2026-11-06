import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

function LoadingSpinner({
  message = "Loading...",
}) {
  return (
    <Box
      sx={{
        minHeight: "50vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 1.8,
      }}
    >
      <CircularProgress size={32} thickness={4} color="primary" />
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
}

export default LoadingSpinner;
