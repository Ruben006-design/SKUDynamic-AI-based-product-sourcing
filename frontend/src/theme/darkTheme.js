import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3B82F6",
    },
    secondary: {
      main: "#8B5CF6",
    },
    background: {
      default: "#0B1120",
      paper: "#111827",
    },
  },
});

export default darkTheme;