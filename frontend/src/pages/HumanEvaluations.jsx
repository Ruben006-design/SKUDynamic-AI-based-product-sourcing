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

import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import {
  getEvaluations,
  getEvaluation,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from "../services/humanEvaluationService";

import { getWeightages } from "../services/weightageService";
import { getRetailers } from "../services/retailerService";

import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import HumanEvaluationDialog from "../components/humanEvaluation/HumanEvaluationDialog";
import HumanEvaluationViewDialog from "../components/humanEvaluation/HumanEvaluationViewDialog";

function HumanEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [weightages, setWeightages] = useState([]);
  const [retailers, setRetailers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadEvaluations();
  }, []);

  async function loadEvaluations() {
    try {
      setLoading(true);

      const [evaluationData, weightageData, retailerData] = await Promise.all([
        getEvaluations(),
        getWeightages(),
        getRetailers(),
      ]);

      const retailerMap = Object.fromEntries(
        (retailerData || []).map((r) => [r.retailer_id, r.retailer_name])
      );

      const enriched = (evaluationData || []).map((e) => ({
        ...e,
        retailer_name: retailerMap[e.retailer_id] ?? `#${e.retailer_id}`,
      }));

      setEvaluations(enriched);
      setFilteredEvaluations(enriched);
      setWeightages(weightageData || []);
      setRetailers(retailerData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load human evaluations.");
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
    setFilteredEvaluations(
      evaluations.filter(
        (e) =>
          e.retailer_name?.toLowerCase().includes(search) ||
          e.field_name?.toLowerCase().includes(search) ||
          e.evaluated_by?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const evaluation = await getEvaluation(row.eval_id);
      setSelectedEvaluation({
        ...evaluation,
        retailer_name: row.retailer_name,
      });
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch evaluation record.", "error");
    }
  }

  function handleEdit(row) {
    setSelectedEvaluation(row);
    setOpenDialog(true);
  }

  function handleDelete(row) {
    setSelectedEvaluation(row);
    setDeleteDialog(true);
  }

  async function handleSave(data) {
    try {
      if (selectedEvaluation) {
        await updateEvaluation(selectedEvaluation.eval_id, data);
        showMessage("Evaluation updated successfully.");
      } else {
        await createEvaluation(data);
        showMessage("Human feedback evaluation saved.");
      }
      setOpenDialog(false);
      loadEvaluations();
    } catch {
      showMessage("Failed to save evaluation.", "error");
    }
  }

  async function confirmDelete() {
    try {
      await deleteEvaluation(selectedEvaluation.eval_id);
      showMessage("Evaluation deleted.");
      setDeleteDialog(false);
      loadEvaluations();
    } catch {
      showMessage("Delete failed.", "error");
    }
  }

  const columns = [
    {
      field: "eval_id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "weightage_id",
      headerName: "Weight Profile",
      width: 120,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
          #{params.value}
        </Typography>
      ),
    },
    {
      field: "retailer_name",
      headerName: "Retail Facility",
      flex: 1,
    },
    {
      field: "field_name",
      headerName: "Adjusted Parameter",
      flex: 1.2,
      renderCell: (params) => (
        <Chip
          variant="outlined"
          color="primary"
          label={params.value}
          size="small"
          sx={{ fontWeight: 600, fontSize: "0.72rem", height: 22 }}
        />
      ),
    },
    {
      field: "old_value",
      headerName: "Previous Value",
      width: 130,
      valueFormatter: (value) => Number(value || 0).toFixed(4),
    },
    {
      field: "new_value",
      headerName: "Human Override",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="secondary.main">
          {Number(params.value || 0).toFixed(4)}
        </Typography>
      ),
    },
    {
      field: "evaluated_by",
      headerName: "Specialist",
      flex: 1,
    },
    {
      field: "evaluated_at",
      headerName: "Evaluation Date",
      flex: 1,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="Human-in-the-Loop Feedback"
        subtitle="Auditable manual overrides and specialist tuning applied to AI-calibrated weights"
        icon={<RateReviewRoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedEvaluation(null);
              setOpenDialog(true);
            }}
          >
            Submit Feedback
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
              Feedback Evaluation Logs
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredEvaluations.length} expert override records active
            </Typography>
          </Box>
          <SearchBar placeholder="Search by parameter, specialist, or facility..." onSearch={handleSearch} />
        </Stack>

        {filteredEvaluations.length === 0 ? (
          <EmptyState
            title="No Evaluation Records Found"
            subtitle="No human overrides match your search query."
          />
        ) : (
          <EntityTable
            rows={filteredEvaluations}
            columns={columns}
            getRowId={(row) => row.eval_id}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Box>

      {/* Dialogs */}
      <HumanEvaluationDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedEvaluation(null);
        }}
        onSave={handleSave}
        evaluation={selectedEvaluation}
        weightages={weightages}
        retailers={retailers}
      />

      <HumanEvaluationViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        evaluation={selectedEvaluation}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Human Feedback"
        message="Are you sure you want to delete this evaluation override?"
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

export default HumanEvaluations;
