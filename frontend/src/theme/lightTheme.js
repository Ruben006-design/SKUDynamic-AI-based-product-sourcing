import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563EB",
    },
    secondary: {
      main: "#7C3AED",
    },
    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },
  },
});

export default lightTheme;