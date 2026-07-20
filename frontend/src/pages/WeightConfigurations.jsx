import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Snackbar,
  Chip,
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
  const [filteredConfigs, setFilteredConfigs] =
    useState([]);

  const [retailers, setRetailers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedConfig, setSelectedConfig] =
    useState(null);

  const [openDialog, setOpenDialog] =
    useState(false);

  const [viewDialog, setViewDialog] =
    useState(false);

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [snackbar, setSnackbar] =
    useState({
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

      const [configData, retailerData] =
        await Promise.all([
          getWeightConfigs(),
          getRetailers(),
        ]);

      setConfigs(configData);
      setFilteredConfigs(configData);
      setRetailers(retailerData);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load weight configurations."
      );
    } finally {
      setLoading(false);
    }
  }

  const showMessage = (
    message,
    severity = "success"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  function handleSearch(value) {
    const search =
      value.toLowerCase();

    setFilteredConfigs(
      configs.filter(
        (c) =>
          c.config_name
            ?.toLowerCase()
            .includes(search)
      )
    );
  }

  async function handleView(row) {
    try {
      const config =
        await getWeightConfig(
          row.config_id
        );

      setSelectedConfig(config);
      setViewDialog(true);
    } catch {
      showMessage(
        "Unable to fetch configuration.",
        "error"
      );
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

  async function handleSave(form) {
    try {
      if (selectedConfig) {
        await updateWeightConfig(
          selectedConfig.config_id,
          form
        );

        showMessage(
          "Configuration updated successfully."
        );
      } else {
        await createWeightConfig(
          form
        );

        showMessage(
          "Configuration created successfully."
        );
      }

      setOpenDialog(false);
      setSelectedConfig(null);

      loadConfigs();
    } catch (err) {
      console.error(err);

      showMessage(
        "Operation failed.",
        "error"
      );
    }
  }

  async function confirmDelete() {
    try {
      await deleteWeightConfig(
        selectedConfig.config_id
      );

      showMessage(
        "Configuration deleted successfully."
      );

      setDeleteDialog(false);

      loadConfigs();
    } catch (err) {
      console.error(err);

      showMessage(
        "Delete failed.",
        "error"
      );
    }
  }
    const columns = [
    {
      field: "config_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "config_name",
      headerName: "Configuration",
      flex: 1,
    },
    {
      field: "retailer_id",
      headerName: "Retailer",
      flex: 1,
      renderCell: (params) => {
        const retailer = retailers.find(
          (r) =>
            r.retailer_id === params.value
        );

        return retailer
          ? retailer.retailer_name
          : params.value;
      },
    },
    {
      field: "sales_volume_w",
      headerName: "Sales",
      width: 90,
    },
    {
      field: "lead_time_w",
      headerName: "Lead",
      width: 90,
    },
    {
      field: "supplier_quality_w",
      headerName: "Supplier",
      width: 100,
    },
    {
      field: "popularity_w",
      headerName: "Popularity",
      width: 110,
    },
    {
      field: "is_active",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          size="small"
          label={
            params.value
              ? "Active"
              : "Inactive"
          }
          color={
            params.value
              ? "success"
              : "default"
          }
        />
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Weight Configurations"
        subtitle="Manage AI decision weight profiles."
        icon={<TuneRoundedIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedConfig(null);
              setOpenDialog(true);
            }}
          >
            Add Configuration
          </Button>
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <SearchBar
        placeholder="Search configurations..."
        onSearch={handleSearch}
      />

      {filteredConfigs.length === 0 ? (
        <EmptyState
          title="No Configurations"
          subtitle="No AI weight configurations found."
        />
      ) : (
        <EntityTable
          rows={filteredConfigs}
          columns={columns}
          getRowId={(row) =>
            row.config_id
          }
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

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
        onClose={() =>
          setViewDialog(false)
        }
        config={selectedConfig}
        retailers={retailers}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Configuration"
        message={`Delete "${selectedConfig?.config_name}" ?`}
        onClose={() =>
          setDeleteDialog(false)
        }
        onConfirm={confirmDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default WeightConfigurations;