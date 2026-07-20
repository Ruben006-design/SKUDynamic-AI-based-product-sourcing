import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";

import MuiAlert from "@mui/material/Alert";

import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";


import {
  getWeightages,
  getWeightage,
  deleteWeightage,
  validateWeightage,
} from "../services/weightageService";

import { getProducts } from "../services/productService";
import { getRetailers } from "../services/retailerService";
import { getWeightConfigs } from "../services/weightConfigService";

import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";

import LatestWeightageCard from "../components/weightage/LatestWeightageCard";
import WeightDistributionCard from "../components/weightage/WeightDistributionCard";
import WeightageViewDialog from "../components/weightage/WeightageViewDialog";

function Weightages() {
  const [weightages, setWeightages] = useState([]);
  const [filteredWeightages, setFilteredWeightages] =
    useState([]);

  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [configs, setConfigs] = useState([]);

  const [latestWeightage, setLatestWeightage] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewDialog, setViewDialog] =
    useState(false);

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [selectedWeightage, setSelectedWeightage] =
    useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
    useEffect(() => {
    loadWeightages();
  }, []);

  async function loadWeightages() {
    try {
      setLoading(true);

      const [
        weightageData,
        productData,
        retailerData,
        configData,
      ] = await Promise.all([
        getWeightages(),
        getProducts(),
        getRetailers(),
        getWeightConfigs(),
      ]);

      setProducts(productData);
      setRetailers(retailerData);
      setConfigs(configData);

      // Create lookup maps
      const productMap = Object.fromEntries(
        productData.map((p) => [
          p.product_id,
          p.product_name,
        ])
      );

      const retailerMap = Object.fromEntries(
        retailerData.map((r) => [
          r.retailer_id,
          r.retailer_name,
        ])
      );

      const configMap = Object.fromEntries(
        configData.map((c) => [
          c.config_id,
          c.config_name,
        ])
      );

      // Enrich weightages with readable names
      const enrichedWeightages =
        weightageData.map((w) => ({
          ...w,
          product_name:
            productMap[w.product_id] ??
            `#${w.product_id}`,

          retailer_name:
            retailerMap[w.retailer_id] ??
            `#${w.retailer_id}`,

          config_name:
            configMap[w.config_id] ??
            `#${w.config_id}`,
        }));

      setWeightages(enrichedWeightages);
      setFilteredWeightages(
        enrichedWeightages
      );

      if (enrichedWeightages.length > 0) {
        setLatestWeightage(
          enrichedWeightages[0]
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load AI weightages."
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

  const handleSearch = (value) => {
    const search = value.toLowerCase();

    setFilteredWeightages(
      weightages.filter(
        (w) =>
          w.product_name
            ?.toLowerCase()
            .includes(search) ||
          w.retailer_name
            ?.toLowerCase()
            .includes(search) ||
          w.config_name
            ?.toLowerCase()
            .includes(search) ||
          w.llm_model_used
            ?.toLowerCase()
            .includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const data = await getWeightage(
        row.weightage_id
      );

      // Preserve enriched names
      setSelectedWeightage({
        ...data,
        product_name: row.product_name,
        retailer_name: row.retailer_name,
        config_name: row.config_name,
      });

      setViewDialog(true);
    } catch {
      showMessage(
        "Unable to fetch weightage.",
        "error"
      );
    }
  }

  async function handleValidate(row) {
    try {
      await validateWeightage(
        row.weightage_id
      );

      showMessage(
        "AI Weightage validated successfully."
      );
    } catch {
      showMessage(
        "Validation failed.",
        "error"
      );
    }
  }

  function handleDelete(row) {
    setSelectedWeightage(row);
    setDeleteDialog(true);
  }

  async function confirmDelete() {
    try {
      await deleteWeightage(
        selectedWeightage.weightage_id
      );

      showMessage(
        "Weightage deleted successfully."
      );

      setDeleteDialog(false);

      loadWeightages();
    } catch {
      showMessage(
        "Delete failed.",
        "error"
      );
    }
  }
    const columns = [
    {
      field: "weightage_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "product_name",
      headerName: "Product",
      flex: 1,
    },
    {
      field: "retailer_name",
      headerName: "Retailer",
      flex: 1,
    },
    {
      field: "config_name",
      headerName: "Configuration",
      flex: 1,
    },
    {
      field: "recommendation_score",
      headerName: "AI Score",
      width: 150,
      renderCell: (params) => (
        <Chip
          color={
            params.value >= 0.8
              ? "success"
              : params.value >= 0.6
              ? "warning"
              : "error"
          }
          label={`${(
            params.value * 100
          ).toFixed(1)}%`}
        />
      ),
    },
    {
      field: "llm_model_used",
      headerName: "LLM Model",
      flex: 1,
      renderCell: (params) => (
        <Chip
          color="primary"
          label={`🧠 ${params.value}`}
        />
      ),
    },
    {
      field: "generated_at",
      headerName: "Generated At",
      flex: 1,
      valueFormatter: (value) =>
        new Date(value).toLocaleString(),
    },
    {
      field: "validate",
      headerName: "Validate",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={
            <VerifiedRoundedIcon />
          }
          onClick={() =>
            handleValidate(params.row)
          }
        >
          Validate
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="AI Weightages"
        subtitle="View, validate and analyze AI-generated product weightages."
        icon={<PsychologyRoundedIcon />}
        action={
          <Button
            variant="contained"
            color="secondary"
            startIcon={
              <PsychologyRoundedIcon />
            }
            disableElevation
          >
            AI Intelligence
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
        placeholder="Search AI weightages..."
        onSearch={handleSearch}
      />

      {/* Latest AI Summary */}

      <LatestWeightageCard
        weightage={latestWeightage}
      />

      {/* Weight Distribution */}

      <WeightDistributionCard
        weightage={latestWeightage}
      />

      {/* Weightage History */}

      <Box mt={3}>
        {filteredWeightages.length === 0 ? (
          <EmptyState
            title="No Weightages"
            subtitle="No AI-generated weightages available."
          />
        ) : (
          <EntityTable
            rows={filteredWeightages}
            columns={columns}
            getRowId={(row) =>
              row.weightage_id
            }
            loading={loading}
            onView={handleView}
            onDelete={handleDelete}
          />
        )}
      </Box>

      {/* View Dialog */}

      <WeightageViewDialog
        open={viewDialog}
        onClose={() =>
          setViewDialog(false)
        }
        weightage={selectedWeightage}
      />

      {/* Delete Confirmation */}

      <ConfirmDialog
        open={deleteDialog}
        title="Delete AI Weightage"
        message={`Delete AI Weightage #${selectedWeightage?.weightage_id}?`}
        onClose={() =>
          setDeleteDialog(false)
        }
        onConfirm={confirmDelete}
      />

      {/* Snackbar */}

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

export default Weightages;