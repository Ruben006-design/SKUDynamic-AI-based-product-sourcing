import { Box, CircularProgress } from "@mui/material";

function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "300px",
      }}
    >
      <CircularProgress size={45} />
    </Box>
  );
}

export default LoadingSpinner;