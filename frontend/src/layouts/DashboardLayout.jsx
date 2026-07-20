import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// Layout constants
const SIDEBAR_WIDTH = 260;
const NAVBAR_HEIGHT = 64;

/**
 * DashboardLayout
 * Persistent shell for all authenticated app pages.
 * Composes a fixed sidebar, a sticky navbar, and a content
 * area that renders the active route via <Outlet />.
 */
function DashboardLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Sidebar width={SIDEBAR_WIDTH} />

      {/* Right side: navbar + main content */}
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
        <Navbar height={NAVBAR_HEIGHT} sidebarWidth={SIDEBAR_WIDTH} />

        {/* Spacer to offset content below the fixed navbar */}
        <Toolbar sx={{ minHeight: `${NAVBAR_HEIGHT}px !important` }} />

        {/* Page content */}
        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: "100%",
              borderRadius: 3,
              transition: (theme) =>
                theme.transitions.create(["box-shadow"], {
                  duration: theme.transitions.duration.short,
                }),
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;