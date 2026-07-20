import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Snackbar,
  Chip,
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
  const [evaluations, setEvaluations] =
    useState([]);

  const [
    filteredEvaluations,
    setFilteredEvaluations,
  ] = useState([]);

  const [weightages, setWeightages] =
    useState([]);

  const [retailers, setRetailers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [viewDialog, setViewDialog] =
    useState(false);

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [
    selectedEvaluation,
    setSelectedEvaluation,
  ] = useState(null);

  const [snackbar, setSnackbar] =
    useState({
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

      const [
        evaluationData,
        weightageData,
        retailerData,
      ] = await Promise.all([
        getEvaluations(),
        getWeightages(),
        getRetailers(),
      ]);

      const retailerMap =
        Object.fromEntries(
          retailerData.map((r) => [
            r.retailer_id,
            r.retailer_name,
          ])
        );

      const enriched =
        evaluationData.map((e) => ({
          ...e,
          retailer_name:
            retailerMap[e.retailer_id] ??
            `#${e.retailer_id}`,
        }));

      setEvaluations(enriched);
      setFilteredEvaluations(enriched);

      setWeightages(weightageData);
      setRetailers(retailerData);
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load evaluations."
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

    setFilteredEvaluations(
      evaluations.filter(
        (e) =>
          e.field_name
            ?.toLowerCase()
            .includes(search) ||
          e.retailer_name
            ?.toLowerCase()
            .includes(search) ||
          e.evaluated_by
            ?.toLowerCase()
            .includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const data =
        await getEvaluation(
          row.eval_id
        );

      setSelectedEvaluation({
        ...data,
        retailer_name:
          row.retailer_name,
      });

      setViewDialog(true);
    } catch {
      showMessage(
        "Unable to fetch evaluation.",
        "error"
      );
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

  async function handleSave(form) {
    try {
      if (selectedEvaluation) {
        await updateEvaluation(
          selectedEvaluation.eval_id,
          form
        );

        showMessage(
          "Evaluation updated successfully."
        );
      } else {
        await createEvaluation(form);

        showMessage(
          "Evaluation created successfully."
        );
      }

      setOpenDialog(false);
      setSelectedEvaluation(null);

      loadEvaluations();
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
      await deleteEvaluation(
        selectedEvaluation.eval_id
      );

      showMessage(
        "Evaluation deleted successfully."
      );

      setDeleteDialog(false);

      loadEvaluations();
    } catch {
      showMessage(
        "Delete failed.",
        "error"
      );
    }
  }
    const columns = [
    {
      field: "eval_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "weightage_id",
      headerName: "Weightage",
      width: 120,
    },
    {
      field: "retailer_name",
      headerName: "Retailer",
      flex: 1,
    },
    {
      field: "field_name",
      headerName: "Field",
      flex: 1,
      renderCell: (params) => (
        <Chip
          color="primary"
          label={params.value}
          size="small"
        />
      ),
    },
    {
      field: "old_value",
      headerName: "Old Value",
      width: 120,
    },
    {
      field: "new_value",
      headerName: "New Value",
      width: 120,
    },
    {
      field: "evaluated_by",
      headerName: "Evaluated By",
      flex: 1,
    },
    {
      field: "evaluated_at",
      headerName: "Evaluated At",
      flex: 1,
      valueFormatter: (value) =>
        new Date(value).toLocaleString(),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Human Evaluations"
        subtitle="Review and override AI-generated recommendations."
        icon={<RateReviewRoundedIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedEvaluation(null);
              setOpenDialog(true);
            }}
          >
            Add Evaluation
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
        placeholder="Search evaluations..."
        onSearch={handleSearch}
      />

      <Box mt={3}>
        {filteredEvaluations.length === 0 ? (
          <EmptyState
            title="No Evaluations"
            subtitle="No human evaluations found."
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
        onClose={() =>
          setViewDialog(false)
        }
        evaluation={selectedEvaluation}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Evaluation"
        message={`Delete evaluation #${selectedEvaluation?.eval_id}?`}
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

export default HumanEvaluations;