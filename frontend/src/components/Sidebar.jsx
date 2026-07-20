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

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";

// Navigation Items
const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardRoundedIcon />,
  },
  {
    label: "Products",
    path: "/products",
    icon: <Inventory2RoundedIcon />,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: <WarehouseRoundedIcon />,
  },
  {
    label: "Suppliers",
    path: "/suppliers",
    icon: <LocalShippingRoundedIcon />,
  },
  {
    label: "Retailers",
    path: "/retailers",
    icon: <StorefrontRoundedIcon />,
  },
  {
    label: "Sales",
    path: "/sales",
    icon: <PointOfSaleRoundedIcon />,
  },
  {
    label: "Product Suppliers",
    path: "/product-suppliers",
    icon: <LinkRoundedIcon />,
  },
  {
    label: "Weight Configurations",
    path: "/weight-configurations",
    icon: <TuneRoundedIcon />,
  },
  {
    label: "Weightages",
    path: "/weightages",
    icon: <PsychologyRoundedIcon />,
  },
  {
    label: "Human Evaluations",
    path: "/human-evaluations",
    icon: <RateReviewRoundedIcon />,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: <ReceiptLongRoundedIcon />,
  },
  {
    label: "AI Recommendations",
    path: "/ai-recommendations",
    icon: <InsightsRoundedIcon />,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: <AssessmentRoundedIcon />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsRoundedIcon />,
  },
];

const APP_VERSION = "v1.0";

function Sidebar({ width = 260 }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        display: {
          xs: "none",
          md: "block",
        },
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          background:
            "linear-gradient(180deg, rgba(17,24,39,0.98) 0%, rgba(11,17,32,0.98) 100%)",
          backdropFilter: "blur(12px)",
          borderRight:
            "1px solid rgba(148,163,184,0.08)",
        },
      }}
    >
      {/* Logo */}
      <Toolbar
        sx={{
          px: 3,
          py: 2.5,
          minHeight: "auto !important",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg,#3B82F6,#8B5CF6)",
              boxShadow:
                "0 6px 18px rgba(59,130,246,.35)",
            }}
          >
            <AutoAwesomeIcon
              sx={{
                color: "#fff",
                fontSize: 22,
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              SKUDynamic
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              AI Based Product Sourcing
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider
        sx={{
          mx: 2,
          borderColor:
            "rgba(148,163,184,.1)",
        }}
      />

      {/* Navigation */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 2,
          py: 2,
        }}
      >
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 1.5,
                color: "text.secondary",
                transition: ".25s",

                "&:hover": {
                  backgroundColor:
                    "rgba(59,130,246,.08)",
                  color: "text.primary",
                  transform: "translateX(3px)",
                },

                "&.active": {
                  background:
                    "rgba(59,130,246,.16)",
                  color: "#60A5FA",

                  "& .MuiListItemIcon-root": {
                    color: "#60A5FA",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 2,
          pb: 2.5,
        }}
      >
        <Divider
          sx={{
            mb: 1.5,
            borderColor:
              "rgba(148,163,184,.1)",
          }}
        />

        <Typography
          variant="caption"
          sx={{
            color: "text.disabled",
            px: 1.5,
          }}
        >
          {APP_VERSION}
        </Typography>
      </Box>
    </Drawer>
  );
}

export default Sidebar;