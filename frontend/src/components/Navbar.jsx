import { useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Chip,
  Stack,
  Breadcrumbs,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

import { useThemeMode } from "../context/ThemeContext";

// Route title mapping for breadcrumbs
const ROUTE_META = {
  "/dashboard": { section: "Overview", title: "Dashboard" },
  "/reports": { section: "Overview", title: "Reports & Analytics" },
  "/ai-recommendations": { section: "Intelligence", title: "AI Recommendations" },
  "/weightages": { section: "Intelligence", title: "AI Weightages" },
  "/weight-configurations": { section: "Intelligence", title: "Weight Configurations" },
  "/human-evaluations": { section: "Intelligence", title: "Human Evaluations" },
  "/products": { section: "Supply Chain", title: "Products" },
  "/inventory": { section: "Supply Chain", title: "Inventory" },
  "/suppliers": { section: "Supply Chain", title: "Suppliers" },
  "/retailers": { section: "Supply Chain", title: "Retailers" },
  "/product-suppliers": { section: "Supply Chain", title: "Product Supplier Mapping" },
  "/orders": { section: "Operations", title: "Order Management" },
  "/sales": { section: "Operations", title: "Sales History" },
  "/settings": { section: "Operations", title: "Settings" },
};

function Navbar({ height = 64, sidebarWidth = 260, onMenuToggle }) {
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const location = useLocation();
  const isDark = theme.palette.mode === "dark";

  const currentRoute = ROUTE_META[location.pathname] || {
    section: "Platform",
    title: "Overview",
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
        bgcolor: isDark ? alpha("#090D16", 0.85) : alpha("#FFFFFF", 0.85),
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          height,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Left Side: Mobile Menu + Dynamic Breadcrumbs */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuToggle}
            sx={{ display: { md: "none" } }}
          >
            <MenuRoundedIcon fontSize="small" />
          </IconButton>

          <Box>
            <Breadcrumbs
              separator={<NavigateNextRoundedIcon sx={{ fontSize: 14, color: "text.disabled" }} />}
              aria-label="breadcrumb"
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500, fontSize: "0.75rem" }}
              >
                {currentRoute.section}
              </Typography>
              <Typography
                variant="caption"
                color="text.primary"
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              >
                {currentRoute.title}
              </Typography>
            </Breadcrumbs>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2} sx={{ fontSize: { xs: "1rem", sm: "1.15rem" } }}>
              {currentRoute.title}
            </Typography>
          </Box>
        </Stack>

        {/* Right Side: System Status, Theme Toggle & Profile */}
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
          {/* Engine Status Pill */}
          <Chip
            icon={<VerifiedRoundedIcon sx={{ fontSize: "14px !important", color: "success.main" }} />}
            label="Local AI Ready"
            size="small"
            variant="outlined"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              height: 26,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "text.secondary",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
              bgcolor: isDark ? alpha("#10B981", 0.08) : alpha("#10B981", 0.06),
            }}
          />

          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === "dark" ? "Light" : "Dark"} mode`}>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              size="small"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                width: 36,
                height: 36,
              }}
            >
              {mode === "dark" ? (
                <LightModeRoundedIcon fontSize="small" sx={{ color: "warning.main" }} />
              ) : (
                <DarkModeRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
              )}
            </IconButton>
          </Tooltip>

          {/* User Badge */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.2}
            sx={{
              pl: 1,
              py: 0.5,
              borderRadius: 2,
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "primary.main",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              SK
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                Procurement Lead
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.7rem" }}>
                Admin Context
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
