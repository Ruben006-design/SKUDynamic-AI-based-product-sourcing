import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Snackbar,
  Chip,
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
  const [filteredRetailers, setFilteredRetailers] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [viewDialog, setViewDialog] =
    useState(false);

  const [selectedRetailer, setSelectedRetailer] =
    useState(null);

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

      setRetailers(data);
      setFilteredRetailers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load retailers.");
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

    setFilteredRetailers(
      retailers.filter(
        (retailer) =>
          retailer.retailer_name
            ?.toLowerCase()
            .includes(search) ||
          retailer.industry_type
            ?.toLowerCase()
            .includes(search) ||
          retailer.contact_email
            ?.toLowerCase()
            .includes(search) ||
          retailer.plan_tier
            ?.toLowerCase()
            .includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const retailer = await getRetailer(
        row.retailer_id
      );

      setSelectedRetailer(retailer);
      setViewDialog(true);
    } catch (err) {
      showMessage(
        "Unable to fetch retailer.",
        "error"
      );
    }
  }

  function handleEdit(row) {
    setSelectedRetailer(row);
    setOpenDialog(true);
  }

  async function handleSave(form) {
    try {
      if (selectedRetailer) {
        await updateRetailer(
          selectedRetailer.retailer_id,
          form
        );

        showMessage(
          "Retailer updated successfully."
        );
      } else {
        await createRetailer(form);

        showMessage(
          "Retailer created successfully."
        );
      }

      setOpenDialog(false);
      setSelectedRetailer(null);

      loadRetailers();
    } catch (err) {
      console.error(err);

      showMessage(
        "Operation failed.",
        "error"
      );
    }
  }
    const columns = [
    {
      field: "retailer_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "retailer_name",
      headerName: "Retailer",
      flex: 1.3,
    },
    {
      field: "industry_type",
      headerName: "Industry",
      flex: 1,
    },
    {
      field: "contact_email",
      headerName: "Email",
      flex: 1.5,
    },
    {
      field: "plan_tier",
      headerName: "Plan",
      width: 150,
      renderCell: (params) => {
        const value = params.value;

        let color = "default";

        if (value === "enterprise") {
          color = "secondary";
        } else if (value === "growth") {
          color = "primary";
        }

        return (
          <Chip
            label={
              value.charAt(0).toUpperCase() +
              value.slice(1)
            }
            color={color}
            size="small"
          />
        );
      },
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      valueFormatter: (value) =>
        new Date(value).toLocaleDateString(),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Retailers"
        subtitle="Manage retailers using SKUDynamic."
        icon={<StorefrontRoundedIcon />}
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

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <SearchBar
        placeholder="Search retailers..."
        onSearch={handleSearch}
      />

      {filteredRetailers.length === 0 ? (
        <EmptyState
          title="No Retailers"
          subtitle="No retailer records found."
        />
      ) : (
        <EntityTable
          rows={filteredRetailers}
          columns={columns}
          getRowId={(row) => row.retailer_id}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          showDelete={false}
        />
      )}

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

export default Retailers;