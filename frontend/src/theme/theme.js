import { createTheme, alpha } from "@mui/material/styles";

/**
 * SKUDynamic AI - Premium Enterprise Design System
 * Inspired by Linear, Stripe, and modern enterprise AI platforms.
 */

const typography = {
  fontFamily: [
    '"Inter"',
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
  ].join(","),
  h1: { fontWeight: 700, letterSpacing: "-0.025em" },
  h2: { fontWeight: 700, letterSpacing: "-0.02em" },
  h3: { fontWeight: 700, letterSpacing: "-0.02em" },
  h4: { fontWeight: 600, letterSpacing: "-0.015em", fontSize: "1.65rem" },
  h5: { fontWeight: 600, letterSpacing: "-0.01em", fontSize: "1.25rem" },
  h6: { fontWeight: 600, letterSpacing: "-0.005em", fontSize: "1.05rem" },
  subtitle1: { fontWeight: 500, letterSpacing: "-0.005em", fontSize: "0.95rem" },
  subtitle2: { fontWeight: 500, fontSize: "0.875rem" },
  body1: { fontSize: "0.925rem", lineHeight: 1.6 },
  body2: { fontSize: "0.85rem", lineHeight: 1.55 },
  button: {
    fontWeight: 600,
    textTransform: "none",
    letterSpacing: "0.01em",
  },
  caption: { fontSize: "0.75rem", letterSpacing: "0.01em" },
  overline: { fontWeight: 600, letterSpacing: "0.08em", fontSize: "0.7rem", textTransform: "uppercase" },
};

export function createAppTheme(mode = "dark") {
  const isDark = mode === "dark";

  const palette = {
    mode,
    primary: {
      main: isDark ? "#3B82F6" : "#2563EB",
      light: isDark ? "#60A5FA" : "#3B82F6",
      dark: isDark ? "#2563EB" : "#1D4ED8",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: isDark ? "#8B5CF6" : "#7C3AED",
      light: isDark ? "#A78BFA" : "#8B5CF6",
      dark: isDark ? "#7C3AED" : "#6D28D9",
      contrastText: "#FFFFFF",
    },
    success: {
      main: isDark ? "#10B981" : "#059669",
      light: isDark ? "#34D399" : "#10B981",
      dark: isDark ? "#059669" : "#047857",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: isDark ? "#F59E0B" : "#D97706",
      light: isDark ? "#FBBF24" : "#F59E0B",
      dark: isDark ? "#D97706" : "#B45309",
      contrastText: isDark ? "#111827" : "#FFFFFF",
    },
    error: {
      main: isDark ? "#EF4444" : "#DC2626",
      light: isDark ? "#F87171" : "#EF4444",
      dark: isDark ? "#DC2626" : "#B91C1C",
      contrastText: "#FFFFFF",
    },
    info: {
      main: isDark ? "#0EA5E9" : "#0284C7",
      light: isDark ? "#38BDF8" : "#0EA5E9",
      dark: isDark ? "#0284C7" : "#0369A1",
      contrastText: "#FFFFFF",
    },
    background: {
      default: isDark ? "#090D16" : "#F8FAFC",
      paper: isDark ? "#0F172A" : "#FFFFFF",
      subtle: isDark ? "#1E293B" : "#F1F5F9",
    },
    text: {
      primary: isDark ? "#F8FAFC" : "#0F172A",
      secondary: isDark ? "#94A3B8" : "#64748B",
      disabled: isDark ? "#475569" : "#94A3B8",
    },
    divider: isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(15, 23, 42, 0.08)",
  };

  return createTheme({
    palette,
    typography,
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            color: palette.text.primary,
            scrollbarColor: isDark ? "#334155 #0F172A" : "#CBD5E1 #F1F5F9",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: isDark ? "#334155" : "#CBD5E1",
            },
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            borderRadius: 14,
            border: `1px solid ${palette.divider}`,
            boxShadow: isDark
              ? "0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)"
              : "0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: palette.background.paper,
            border: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            padding: "8px 16px",
            fontSize: "0.875rem",
            transition: "all 0.18s ease-in-out",
          },
          containedPrimary: {
            backgroundColor: palette.primary.main,
            "&:hover": {
              backgroundColor: palette.primary.dark,
              boxShadow: `0 4px 14px ${alpha(palette.primary.main, 0.35)}`,
            },
          },
          outlined: {
            borderColor: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(15, 23, 42, 0.15)",
            "&:hover": {
              borderColor: palette.primary.main,
              backgroundColor: alpha(palette.primary.main, 0.05),
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: "all 0.15s ease-in-out",
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.05)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
            fontSize: "0.75rem",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isDark ? alpha("#0F172A", 0.6) : "#FFFFFF",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(15, 23, 42, 0.12)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: palette.primary.main,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: palette.primary.main,
              borderWidth: "1.5px",
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? alpha("#1E293B", 0.5) : "#F8FAFC",
            "& .MuiTableCell-head": {
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: palette.text.secondary,
              borderBottom: `1px solid ${palette.divider}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: palette.divider,
            fontSize: "0.85rem",
            padding: "12px 16px",
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${palette.divider}`,
            borderRadius: 12,
            backgroundColor: palette.background.paper,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: isDark ? alpha("#1E293B", 0.45) : "#F8FAFC",
              borderBottom: `1px solid ${palette.divider}`,
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: palette.text.secondary,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${palette.divider}`,
              fontSize: "0.85rem",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(15, 23, 42, 0.02)",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: `1px solid ${palette.divider}`,
              backgroundColor: isDark ? alpha("#0F172A", 0.6) : "#FAFAFA",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${palette.divider}`,
            boxShadow: isDark
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.65)"
              : "0 25px 50px -12px rgba(15, 23, 42, 0.2)",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? "#1E293B" : "#0F172A",
            color: "#F8FAFC",
            fontSize: "0.75rem",
            fontWeight: 500,
            borderRadius: 6,
            padding: "5px 10px",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "transparent"}`,
          },
        },
      },
    },
  });
}

export const lightTheme = createAppTheme("light");
export const darkTheme = createAppTheme("dark");
export default darkTheme;
