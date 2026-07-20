import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Switch,
  Divider,
  Button,
  Chip,
} from "@mui/material";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

function Settings() {
  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={4}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg,#2563EB,#7C3AED)",
            boxShadow: "0 10px 30px rgba(37,99,235,.35)",
          }}
        >
          <SettingsRoundedIcon sx={{ color: "white", fontSize: 28 }} />
        </Box>

        <Box>
          <Typography variant="h4" fontWeight={800}>
            Settings
          </Typography>

          <Typography color="text.secondary">
            Manage application preferences, AI configuration and system behavior
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Appearance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 5, minHeight: 280 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <DarkModeRoundedIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Appearance
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600}>Dark Mode</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use the premium dark theme across the dashboard
                    </Typography>
                  </Box>
                  <Switch checked />
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600}>Enable Animations</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Smooth transitions and hover effects
                    </Typography>
                  </Box>
                  <Switch checked />
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600}>Compact Sidebar</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reduce sidebar width for more workspace
                    </Typography>
                  </Box>
                  <Switch />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 5, minHeight: 280 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <PsychologyRoundedIcon color="secondary" />
                <Typography variant="h6" fontWeight={700}>
                  AI Configuration
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>Gemini Model</Typography>
                  <Chip label="gemini-2.5-flash" color="success" />
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>Reorder Threshold</Typography>
                  <Chip label="55" color="primary" />
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600}>Auto Generate Orders</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create pending orders automatically when AI recommends a reorder
                    </Typography>
                  </Box>
                  <Switch checked />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Database */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 5 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <StorageRoundedIcon color="success" />
                <Typography variant="h6" fontWeight={700}>
                  Database
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Connection</Typography>
                  <Chip label="Connected" color="success" size="small" />
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Database</Typography>
                  <Typography fontWeight={600}>ai_product_reordering</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Environment</Typography>
                  <Chip label="Development" color="warning" size="small" />
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Last Sync</Typography>
                  <Typography fontWeight={600}>Just now</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Export & Backup */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 5 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <DownloadRoundedIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Export & Backup
                </Typography>
              </Stack>

              <Typography color="text.secondary" mb={3}>
                Export reports and create backups of your AI recommendation data.
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button variant="contained" startIcon={<DownloadRoundedIcon />}>
                  Export CSV
                </Button>

                <Button variant="outlined">
                  Backup Data
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* About */}
      <Card sx={{ mt: 3, borderRadius: 5 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <InfoRoundedIcon color="action" />
            <Typography variant="h6" fontWeight={700}>
              About SKUDynamic AI
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography color="text.secondary">Version</Typography>
              <Typography fontWeight={600}>v1.0.0</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography color="text.secondary">AI Engine</Typography>
              <Typography fontWeight={600}>Gemini 2.5 Flash</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography color="text.secondary">Frontend</Typography>
              <Typography fontWeight={600}>React + MUI</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography color="text.secondary">Backend</Typography>
              <Typography fontWeight={600}>FastAPI + MySQL</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Settings;