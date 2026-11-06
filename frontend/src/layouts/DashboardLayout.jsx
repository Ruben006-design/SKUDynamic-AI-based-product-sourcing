import { useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const SIDEBAR_WIDTH = 260;
const NAVBAR_HEIGHT = 64;

/**
 * DashboardLayout
 * Persistent shell for all application pages.
 * Supports desktop fixed sidebar, responsive mobile drawer, and sticky top navbar.
 */
function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar with desktop and mobile support */}
      <Sidebar
        width={SIDEBAR_WIDTH}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          marginLeft: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          transition: (theme) =>
            theme.transitions.create("margin-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
        }}
      >
        {/* Sticky Navbar */}
        <Navbar
          height={NAVBAR_HEIGHT}
          sidebarWidth={SIDEBAR_WIDTH}
          onMenuToggle={handleDrawerToggle}
        />

        {/* Spacer to offset content below the fixed navbar */}
        <Toolbar sx={{ minHeight: `${NAVBAR_HEIGHT}px !important` }} />

        {/* Page content wrapper */}
        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            maxWidth: 1600,
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2.5, md: 3.5 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
