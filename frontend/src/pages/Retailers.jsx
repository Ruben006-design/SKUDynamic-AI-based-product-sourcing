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

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import {
  getRetailers,
  getRetailer,
  createRetailer,
  updateRetailer,
} from "../services/retailerService";

import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";

import RetailerDialog from "../components/retailer/RetailerDialog";
import RetailerViewDialog from "../components/retailer/RetailerViewDialog";

function Retailers() {
  const [retailers, setRetailers] = useState([]);
  const [filteredRetailers, setFilteredRetailers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadRetailers();
  }, []);

  async function loadRetailers() {
    try {
      setLoading(true);
      const data = await getRetailers();
      setRetailers(data || []);
      setFilteredRetailers(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load retailers.");
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
    setFilteredRetailers(
      retailers.filter(
        (r) =>
          r.retailer_name?.toLowerCase().includes(search) ||
          r.industry_type?.toLowerCase().includes(search) ||
          r.contact_email?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const retailer = await getRetailer(row.retailer_id);
      setSelectedRetailer(retailer);
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch retailer details.", "error");
    }
  }

  function handleEdit(row) {
    setSelectedRetailer(row);
    setOpenDialog(true);
  }

  async function handleSave(data) {
    try {
      if (selectedRetailer) {
        await updateRetailer(selectedRetailer.retailer_id, data);
        showMessage("Retailer updated successfully.");
      } else {
        await createRetailer(data);
        showMessage("Retailer created successfully.");
      }
      setOpenDialog(false);
      loadRetailers();
    } catch {
      showMessage("Failed to save retailer.", "error");
    }
  }

  const columns = [
    {
      field: "retailer_id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "retailer_name",
      headerName: "Retailer / Entity",
      flex: 1.3,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "industry_type",
      headerName: "Sector / Vertical",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value || "Retail"}
          size="small"
          variant="outlined"
          sx={{ fontSize: "0.72rem", height: 22 }}
        />
      ),
    },
    {
      field: "contact_email",
      headerName: "Billing & Contact Email",
      flex: 1.4,
    },
    {
      field: "plan_tier",
      headerName: "Service Tier",
      width: 140,
      renderCell: (params) => {
        const value = (params.value || "standard").toLowerCase();
        return (
          <Chip
            label={value.charAt(0).toUpperCase() + value.slice(1)}
            color={value === "enterprise" ? "secondary" : "primary"}
            size="small"
            sx={{ fontWeight: 600, borderRadius: 1.5, height: 22 }}
          />
        );
      },
    },
    {
      field: "created_at",
      headerName: "Onboarding Date",
      flex: 1,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : "Active"),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="Retail Client Entities"
        subtitle="Manage business units, enterprise retailers, subscription tiers, and inventory tenant scopes"
        icon={<StorefrontRoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedRetailer(null);
              setOpenDialog(true);
            }}
          >
            Add Retailer
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
              Registered Retail Accounts
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredRetailers.length} tenant facilities configured
            </Typography>
          </Box>
          <SearchBar placeholder="Search by name, sector, or email..." onSearch={handleSearch} />
        </Stack>

        {filteredRetailers.length === 0 ? (
          <EmptyState
            title="No Retailers Found"
            subtitle="No retail client entities matching your search query."
          />
        ) : (
          <EntityTable
            rows={filteredRetailers}
            columns={columns}
            getRowId={(row) => row.retailer_id}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            showActions={true}
          />
        )}
      </Box>

      {/* Dialogs */}
      <RetailerDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedRetailer(null);
        }}
        onSave={handleSave}
        retailer={selectedRetailer}
      />

      <RetailerViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        retailer={selectedRetailer}
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

export default Retailers;
