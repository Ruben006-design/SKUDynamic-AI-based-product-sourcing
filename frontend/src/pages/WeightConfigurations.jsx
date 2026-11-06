import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";

import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import {
  getWeightConfigs,
  getWeightConfig,
  createWeightConfig,
  updateWeightConfig,
  deleteWeightConfig,
} from "../services/weightConfigService";
import { getRetailers } from "../services/retailerService";

import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";

import WeightConfigDialog from "../components/weightConfig/WeightConfigDialog";
import WeightConfigViewDialog from "../components/weightConfig/WeightConfigViewDialog";

function WeightConfigurations() {
  const [configs, setConfigs] = useState([]);
  const [filteredConfigs, setFilteredConfigs] = useState([]);
  const [retailers, setRetailers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    try {
      setLoading(true);
      const [configData, retailerData] = await Promise.all([
        getWeightConfigs(),
        getRetailers(),
      ]);

      setConfigs(configData || []);
      setFilteredConfigs(configData || []);
      setRetailers(retailerData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load weight configurations.");
    } finally {
      setLoading(false);
    }
  }

  const showMessage = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSearch = (value) => {
    const search = value.toLowerCase();
    setFilteredConfigs(
      configs.filter(
        (c) =>
          c.config_name?.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const config = await getWeightConfig(row.config_id);
      setSelectedConfig(config);
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch configuration details.", "error");
    }
  }

  function handleEdit(row) {
    setSelectedConfig(row);
    setOpenDialog(true);
  }

  function handleDelete(row) {
    setSelectedConfig(row);
    setDeleteDialog(true);
  }

  async function handleSave(data) {
    try {
      if (selectedConfig) {
        await updateWeightConfig(selectedConfig.config_id, data);
        showMessage("Configuration updated successfully.");
      } else {
        await createWeightConfig(data);
        showMessage("Configuration created successfully.");
      }
      setOpenDialog(false);
      setSelectedConfig(null);
      loadConfigs();
    } catch {
      showMessage("Failed to save configuration.", "error");
    }
  }

  async function confirmDelete() {
    try {
      await deleteWeightConfig(selectedConfig.config_id);
      showMessage("Configuration deleted.");
      setDeleteDialog(false);
      loadConfigs();
    } catch {
      showMessage("Delete failed.", "error");
    }
  }

  const columns = [
    {
      field: "config_id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "config_name",
      headerName: "Weight Rule Name",
      flex: 1.3,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "retailer_id",
      headerName: "Assigned Facility",
      flex: 1,
      renderCell: (params) => {
        const retailer = retailers.find((r) => r.retailer_id === params.value);
        return retailer ? retailer.retailer_name : `#${params.value}`;
      },
    },
    {
      field: "sales_volume_w",
      headerName: "Sales Wt",
      width: 100,
      valueFormatter: (value) => `${(Number(value || 0) * 100).toFixed(0)}%`,
    },
    {
      field: "lead_time_w",
      headerName: "Lead Wt",
      width: 100,
      valueFormatter: (value) => `${(Number(value || 0) * 100).toFixed(0)}%`,
    },
    {
      field: "supplier_quality_w",
      headerName: "Supplier Wt",
      width: 110,
      valueFormatter: (value) => `${(Number(value || 0) * 100).toFixed(0)}%`,
    },
    {
      field: "is_active",
      headerName: "State",
      width: 110,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value ? "Active" : "Archived"}
          color={params.value ? "success" : "default"}
          sx={{ fontWeight: 600, borderRadius: 1.5, height: 22 }}
        />
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="Weight Configuration Rules"
        subtitle="Define calibration profiles and baseline weights across sales, lead time, supplier reliability, and seasonality"
        icon={<TuneRoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedConfig(null);
              setOpenDialog(true);
            }}
          >
            Create Rule Profile
          </Button>
        }
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Calibration Rule Directory
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredConfigs.length} configuration profiles active
            </Typography>
          </Box>
          <SearchBar placeholder="Search rule profiles..." onSearch={handleSearch} />
        </Stack>

        {filteredConfigs.length === 0 ? (
          <EmptyState
            title="No Configurations Found"
            subtitle="No weight configurations match your search criteria."
          />
        ) : (
          <EntityTable
            rows={filteredConfigs}
            columns={columns}
            getRowId={(row) => row.config_id}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Box>

      {/* Dialogs */}
      <WeightConfigDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedConfig(null);
        }}
        onSave={handleSave}
        config={selectedConfig}
        retailers={retailers}
      />

      <WeightConfigViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        config={selectedConfig}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Weight Configuration"
        message={`Delete configuration profile "${selectedConfig?.config_name}"?`}
        onClose={() => setDeleteDialog(false)}
        onConfirm={confirmDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default WeightConfigurations;
