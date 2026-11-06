import { useState } from "react";
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
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { useThemeMode } from "../context/ThemeContext";
import api from "../services/api";

function Settings() {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const isDark = theme.palette.mode === "dark";

  const [autoReorderApproval, setAutoReorderApproval] = useState(false);
  const [procurementKey, setProcurementKey] = useState("sk-procurement-dev-key");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  function showMessage(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  async function handleExportCSV() {
    try {
      const response = await api.get("/order-list/export/csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "orders_audit_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showMessage("Orders exported successfully.");
    } catch {
      showMessage("Export failed. Ensure backend service is reachable.", "error");
    }
  }

  const copyKeyToClipboard = () => {
    navigator.clipboard.writeText(procurementKey);
    showMessage("Procurement API key copied to clipboard.");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
          }}
        >
          <SettingsRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            System Preferences & Security
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage appearance, procurement credentials, and environment parameters
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2.5}>
        {/* 1. Appearance & Theme Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                {mode === "dark" ? (
                  <DarkModeRoundedIcon fontSize="small" color="primary" />
                ) : (
                  <LightModeRoundedIcon fontSize="small" color="primary" />
                )}
                <div>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Interface Appearance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toggle high-contrast dark mode or clean light mode
                  </Typography>
                </div>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center" py={1}>
                <div>
                  <Typography variant="body2" fontWeight={600}>
                    Dark Mode
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mode === "dark"
                      ? "Currently using Obsidian dark theme"
                      : "Currently using crisp SaaS light theme"}
                  </Typography>
                </div>
                <Switch checked={mode === "dark"} onChange={toggleTheme} color="primary" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Security & Procurement Auth */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <SecurityRoundedIcon fontSize="small" color="primary" />
                <div>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Procurement Authorization Key
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bearer token required to approve or reject replenishment orders
                  </Typography>
                </div>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                size="small"
                label="Active Authorization Token"
                value={procurementKey}
                onChange={(e) => setProcurementKey(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={copyKeyToClipboard}
                          startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                        >
                          Copy
                        </Button>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Passed in <Typography component="span" variant="caption" sx={{ fontFamily: "monospace", color: "primary.main" }}>Authorization: Bearer &lt;token&gt;</Typography> header during approvals.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 3. System Architecture Diagnostics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <StorageRoundedIcon fontSize="small" color="primary" />
                <div>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Environment Diagnostics
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Live system integration parameters
                  </Typography>
                </div>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">FastAPI Service URL</Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ fontFamily: "monospace" }}>http://127.0.0.1:8000</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Database Target</Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ fontFamily: "monospace" }}>ai_product_reordering (MySQL)</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">AI Engine Mode</Typography>
                  <Chip label="Local Statistical (Zero API Dependency)" size="small" color="success" sx={{ height: 20, fontSize: "0.68rem" }} />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Platform Build</Typography>
                  <Typography variant="caption" fontWeight={600}>Phase E Production Ready</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 4. Data Maintenance & Exports */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <PsychologyRoundedIcon fontSize="small" color="primary" />
                <div>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Data Maintenance & Audit
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Export order archives and audit records
                  </Typography>
                </div>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Export complete order and approval transition records formatted for executive audit and spreadsheet analysis.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={handleExportCSV}
                  sx={{ width: "fit-content" }}
                >
                  Download Order Audit CSV
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Settings;
