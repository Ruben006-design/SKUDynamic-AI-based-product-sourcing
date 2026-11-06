import { NavLink } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

// Logically grouped navigation sections
const NAV_GROUPS = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: <DashboardRoundedIcon fontSize="small" /> },
      { label: "Reports & Analytics", path: "/reports", icon: <AssessmentRoundedIcon fontSize="small" /> },
    ],
  },
  {
    group: "AI Intelligence",
    items: [
      {
        label: "AI Recommendations",
        path: "/ai-recommendations",
        icon: <AutoAwesomeRoundedIcon fontSize="small" />,
        badge: "AI",
      },
      {
        label: "AI Weightages",
        path: "/weightages",
        icon: <PsychologyRoundedIcon fontSize="small" />,
      },
      {
        label: "Weight Configs",
        path: "/weight-configurations",
        icon: <TuneRoundedIcon fontSize="small" />,
      },
      {
        label: "Human Evaluation",
        path: "/human-evaluations",
        icon: <RateReviewRoundedIcon fontSize="small" />,
      },
    ],
  },
  {
    group: "Supply Chain",
    items: [
      { label: "Products", path: "/products", icon: <Inventory2RoundedIcon fontSize="small" /> },
      { label: "Inventory", path: "/inventory", icon: <WarehouseRoundedIcon fontSize="small" /> },
      { label: "Suppliers", path: "/suppliers", icon: <LocalShippingRoundedIcon fontSize="small" /> },
      { label: "Retailers", path: "/retailers", icon: <StorefrontRoundedIcon fontSize="small" /> },
      { label: "Supplier Mapping", path: "/product-suppliers", icon: <LinkRoundedIcon fontSize="small" /> },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Orders", path: "/orders", icon: <ReceiptLongRoundedIcon fontSize="small" /> },
      { label: "Sales History", path: "/sales", icon: <PointOfSaleRoundedIcon fontSize="small" /> },
      { label: "Settings", path: "/settings", icon: <SettingsRoundedIcon fontSize="small" /> },
    ],
  },
];

function SidebarContent({ onNavigate }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.paper" }}>
      {/* Brand Header */}
      <Toolbar
        sx={{
          px: 2.5,
          py: 2,
          minHeight: "64px !important",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              color: "primary.main",
            }}
          >
            <HubRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                SKUDynamic
              </Typography>
              <Chip
                label="AI"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: "primary.main",
                  borderRadius: 1,
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.72rem" }}>
              Product Sourcing Platform
            </Typography>
          </Box>
        </Stack>
      </Toolbar>

      {/* Navigation Sections */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 1.5,
          py: 2,
        }}
      >
        {NAV_GROUPS.map((section, idx) => (
          <Box key={section.group} sx={{ mb: idx === NAV_GROUPS.length - 1 ? 0 : 2.5 }}>
            <Typography
              variant="overline"
              sx={{
                px: 1.5,
                mb: 0.8,
                display: "block",
                color: "text.disabled",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              {section.group}
            </Typography>
            <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
              {section.items.map((item) => (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  onClick={onNavigate}
                  sx={{
                    borderRadius: 2,
                    py: 0.85,
                    px: 1.5,
                    color: "text.secondary",
                    fontSize: "0.85rem",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.04)",
                      color: "text.primary",
                      "& .MuiListItemIcon-root": {
                        color: "primary.main",
                      },
                    },
                    "&.active": {
                      bgcolor: isDark ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                      fontWeight: 600,
                      "& .MuiListItemIcon-root": {
                        color: "primary.main",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 6,
                        bottom: 6,
                        width: 3.5,
                        borderRadius: "0 4px 4px 0",
                        bgcolor: "primary.main",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: "text.secondary",
                      transition: "color 0.15s ease",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.85rem",
                      fontWeight: "inherit",
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.secondary.main, 0.15),
                        color: "secondary.main",
                        borderRadius: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* System Status Pill at Sidebar Bottom */}
      <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: isDark ? alpha("#1E293B", 0.5) : "#F8FAFC",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16, color: "success.main" }} />
            <Typography variant="caption" fontWeight={600} color="text.primary">
              Local Optimization Engine
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.7rem" }}>
            100% Offline & Competition Ready
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function Sidebar({ width = 260, mobileOpen = false, onMobileClose }) {
  return (
    <>
      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            borderLeft: "none",
            borderTop: "none",
            borderBottom: "none",
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Mobile Responsive Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
          },
        }}
      >
        <SidebarContent onNavigate={onMobileClose} />
      </Drawer>
    </>
  );
}

export default Sidebar;
