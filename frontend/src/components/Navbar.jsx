import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

import { useThemeMode } from "../context/ThemeContext";

function Navbar({ height = 64, sidebarWidth = 260 }) {
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
        background:
          mode === "dark"
            ? "rgba(17,24,39,0.82)"
            : "rgba(255,255,255,0.82)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar
        sx={{
          height,
          display: "flex",
          justifyContent: "space-between",
          px: 4,
        }}
      >
        {/* Left */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Dashboard
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            AI Product Recommendation Platform
          </Typography>
        </Box>

        {/* Center Search */}
        <TextField
          placeholder="Search products, suppliers, orders..."
          variant="outlined"
          size="small"
          sx={{
            width: 380,
            "& .MuiOutlinedInput-root": {
              borderRadius: 4,
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Right */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge
                badgeContent={5}
                color="error"
              >
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip
            title={
              mode === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                transition: "0.4s",
                "&:hover": {
                  transform: "rotate(180deg)",
                },
              }}
            >
              {mode === "dark" ? (
                <LightModeRoundedIcon />
              ) : (
                <DarkModeRoundedIcon />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton color="inherit">
              <SettingsRoundedIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              ml: 2,
            }}
          >
            <Avatar
              sx={{
                background:
                  "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                fontWeight: 700,
              }}
            >
              R
            </Avatar>

            <Box>
              <Typography
                sx={{
                  fontWeight: 600,
                }}
              >
                Ruben Raj
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Administrator
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;