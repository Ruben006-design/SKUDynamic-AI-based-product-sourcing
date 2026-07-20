import { createTheme } from "@mui/material/styles";

/**
 * SKUDynamic - Enterprise Dark SaaS Theme
 * Used globally via <ThemeProvider theme={theme} />
 */
const theme = createTheme({
  spacing: 8,

  palette: {
    mode: "dark",
    primary: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#8B5CF6",
      light: "#A78BFA",
      dark: "#7C3AED",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
      contrastText: "#111827",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#38BDF8",
      light: "#7DD3FC",
      dark: "#0EA5E9",
      contrastText: "#111827",
    },
    background: {
      default: "#0B1120",
      paper: "#111827",
    },
    text: {
      primary: "#E5E7EB",
      secondary: "#94A3B8",
      disabled: "#64748B",
    },
    divider: "rgba(148, 163, 184, 0.12)",
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: ['"Inter"', '"Roboto"', '"Helvetica"', '"Arial"', "sans-serif"].join(","),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
    caption: { fontWeight: 400 },
    overline: { fontWeight: 500 },
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#111827",
          backgroundImage: "none",
          borderRadius: 12,
          border: "1px solid rgba(148, 163, 184, 0.08)",
          boxShadow:
            "0 1px 2px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#111827",
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 8,
          paddingBottom: 8,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: "rgba(148, 163, 184, 0.24)",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0B1120",
          borderRight: "1px solid rgba(148, 163, 184, 0.08)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0B1120",
          backgroundImage: "none",
          boxShadow: "none",
          borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "rgba(148, 163, 184, 0.04)",
            "& fieldset": {
              borderColor: "rgba(148, 163, 184, 0.16)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(148, 163, 184, 0.32)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3B82F6",
            },
          },
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
        },
        head: {
          fontWeight: 600,
          color: "#94A3B8",
          backgroundColor: "#0B1120",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
        filled: {
          backgroundColor: "rgba(148, 163, 184, 0.12)",
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1E293B",
          color: "#E5E7EB",
          fontSize: 12,
          fontWeight: 500,
          borderRadius: 8,
          border: "1px solid rgba(148, 163, 184, 0.12)",
        },
        arrow: {
          color: "#1E293B",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111827",
          backgroundImage: "none",
          borderRadius: 16,
          border: "1px solid rgba(148, 163, 184, 0.08)",
        },
      },
    },
  },
});

export default theme;