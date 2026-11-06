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
import { alpha, useTheme } from "@mui/material/styles";

import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useNavigate } from "react-router-dom";

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
  const theme = useTheme();
  const navigate = useNavigate();

  const [weightages, setWeightages] = useState([]);
  const [filteredWeightages, setFilteredWeightages] = useState([]);
  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [latestWeightage, setLatestWeightage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedWeightage, setSelectedWeightage] = useState(null);

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

      const [weightageData, productData, retailerData, configData] =
        await Promise.all([
          getWeightages(),
          getProducts(),
          getRetailers(),
          getWeightConfigs(),
        ]);

      setProducts(productData || []);
      setRetailers(retailerData || []);
      setConfigs(configData || []);

      const productMap = Object.fromEntries(
        (productData || []).map((p) => [p.product_id, p.product_name])
      );
      const retailerMap = Object.fromEntries(
        (retailerData || []).map((r) => [r.retailer_id, r.retailer_name])
      );
      const configMap = Object.fromEntries(
        (configData || []).map((c) => [c.config_id, c.config_name])
      );

      const enrichedWeightages = (weightageData || []).map((w) => ({
        ...w,
        product_name: productMap[w.product_id] ?? `Product #${w.product_id}`,
        retailer_name: retailerMap[w.retailer_id] ?? `Retailer #${w.retailer_id}`,
        config_name: configMap[w.config_id] ?? `Config #${w.config_id}`,
      }));

      setWeightages(enrichedWeightages);
      setFilteredWeightages(enrichedWeightages);

      if (enrichedWeightages.length > 0) {
        setLatestWeightage(enrichedWeightages[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load AI weightages.");
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
    setFilteredWeightages(
      weightages.filter(
        (item) =>
          item.product_name?.toLowerCase().includes(search) ||
          item.retailer_name?.toLowerCase().includes(search) ||
          item.config_name?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const fullWeightage = await getWeightage(row.weightage_id);
      setSelectedWeightage({
        ...fullWeightage,
        product_name: row.product_name,
        retailer_name: row.retailer_name,
        config_name: row.config_name,
      });
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch weightage details.", "error");
    }
  }

  async function handleValidate(row) {
    try {
      await validateWeightage(row.weightage_id);
      showMessage("AI Weightage verified successfully against 8-factor constraints.");
    } catch {
      showMessage("Validation failed.", "error");
    }
  }

  function handleDelete(row) {
    setSelectedWeightage(row);
    setDeleteDialog(true);
  }

  async function confirmDelete() {
    try {
      await deleteWeightage(selectedWeightage.weightage_id);
      showMessage("Weightage deleted successfully.");
      setDeleteDialog(false);
      loadWeightages();
    } catch {
      showMessage("Delete failed.", "error");
    }
  }

  const columns = [
    {
      field: "weightage_id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "product_name",
      headerName: "Target Product",
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "retailer_name",
      headerName: "Retailer",
      flex: 1,
    },
    {
      field: "config_name",
      headerName: "Weight Rule",
      flex: 1,
    },
    {
      field: "recommendation_score",
      headerName: "Score",
      width: 140,
      renderCell: (params) => {
        const raw = Number(params?.value ?? 0);
        const val = raw > 1 ? raw : raw * 100;
        return (
          <Chip
            size="small"
            color={val >= 70 ? "success" : val >= 45 ? "warning" : "error"}
            label={`${val.toFixed(1)} / 100`}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
        );
      },
    },
    {
      field: "llm_model_used",
      headerName: "Optimizer Model",
      flex: 1,
      renderCell: (params) => (
        <Chip
          variant="outlined"
          size="small"
          label={params.value || "Local Engine"}
          sx={{ fontWeight: 500, fontSize: "0.72rem" }}
        />
      ),
    },
    {
      field: "generated_at",
      headerName: "Calibrated At",
      flex: 1,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
    {
      field: "validate",
      headerName: "Validation",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          color="success"
          startIcon={<VerifiedRoundedIcon sx={{ fontSize: "14px !important" }} />}
          onClick={() => handleValidate(params.row)}
          sx={{ py: 0.4, px: 1, fontSize: "0.72rem" }}
        >
          Verify
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="AI Weight Calibration"
        subtitle="Calibrate and inspect 8-factor statistical weight profiles driving the reordering engine"
        icon={<PsychologyRoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => navigate("/ai-recommendations")}
          >
            Run New Calibration
          </Button>
        }
      />

      {error && <Alert severity="error">{error}</Alert>}

      {/* Latest AI Summary */}
      {latestWeightage && <LatestWeightageCard weightage={latestWeightage} />}

      {/* Weight Distribution */}
      {latestWeightage && <WeightDistributionCard weightage={latestWeightage} />}

      {/* Weightage History Table */}
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
              Calibration History
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Historical weight profiles across SKU and retailer configurations
            </Typography>
          </Box>
          <SearchBar onSearch={handleSearch} placeholder="Search product, retailer, or rule..." />
        </Stack>

        {filteredWeightages.length === 0 ? (
          <EmptyState
            title="No Weightages Found"
            subtitle="No weight calibration records found matching query."
          />
        ) : (
          <EntityTable
            rows={filteredWeightages}
            columns={columns}
            getRowId={(row) => row.weightage_id}
            loading={loading}
            onView={handleView}
            onDelete={handleDelete}
          />
        )}
      </Box>

      {/* View Dialog */}
      <WeightageViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        weightage={selectedWeightage}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete AI Weightage"
        message={`Delete AI Weightage #${selectedWeightage?.weightage_id}?`}
        onClose={() => setDeleteDialog(false)}
        onConfirm={confirmDelete}
      />

      {/* Snackbar */}
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

export default Weightages;
