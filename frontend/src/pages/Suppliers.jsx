import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/supplierService";
import { getRetailers } from "../services/retailerService";

import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";

import SupplierDialog from "../components/supplier/SupplierDialog";
import SupplierViewDialog from "../components/supplier/SupplierViewDialog";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [retailers, setRetailers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const [supplierData, retailerData] = await Promise.all([
        getSuppliers(),
        getRetailers(),
      ]);

      setSuppliers(supplierData || []);
      setFilteredSuppliers(supplierData || []);
      setRetailers(retailerData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers.");
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
    setFilteredSuppliers(
      suppliers.filter(
        (s) =>
          s.supplier_name?.toLowerCase().includes(search) ||
          s.contact_person?.toLowerCase().includes(search) ||
          s.email?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const supplier = await getSupplier(row.supplier_id);
      setSelectedSupplier(supplier);
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch supplier details.", "error");
    }
  }

  function handleEdit(row) {
    setSelectedSupplier(row);
    setOpenDialog(true);
  }

  function handleDelete(row) {
    setSelectedSupplier(row);
    setDeleteDialog(true);
  }

  async function handleSave(data) {
    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.supplier_id, data);
        showMessage("Supplier updated successfully.");
      } else {
        await createSupplier(data);
        showMessage("Supplier created successfully.");
      }
      setOpenDialog(false);
      loadSuppliers();
    } catch {
      showMessage("Failed to save supplier.", "error");
    }
  }

  async function confirmDelete() {
    try {
      await deleteSupplier(selectedSupplier.supplier_id);
      showMessage("Supplier deleted successfully.");
      setDeleteDialog(false);
      loadSuppliers();
    } catch {
      showMessage("Delete failed.", "error");
    }
  }

  const columns = [
    {
      field: "supplier_id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "supplier_name",
      headerName: "Supplier Name",
      flex: 1.3,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "retailer_id",
      headerName: "Associated Retailer",
      flex: 1,
      valueGetter: (_, row) => {
        const retailer = retailers.find((r) => r.retailer_id === row.retailer_id);
        return retailer?.retailer_name ?? `#${row.retailer_id}`;
      },
    },
    {
      field: "contact_person",
      headerName: "Contact Lead",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email Address",
      flex: 1.3,
    },
    {
      field: "lead_time_days",
      headerName: "Lead Time",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `${params.value} days` : "—"}
        </Typography>
      ),
    },
    {
      field: "quality_score",
      headerName: "Quality Rating",
      width: 140,
      renderCell: (params) => {
        const score = Number(params.value ?? 0);
        return (
          <Chip
            size="small"
            color={score >= 80 ? "success" : score >= 60 ? "warning" : "default"}
            label={`${score} / 100`}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
        );
      },
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="Supplier Management"
        subtitle="Directory of approved manufacturing partners, distributor lead times, and reliability quality ratings"
        icon={<LocalShippingRoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedSupplier(null);
              setOpenDialog(true);
            }}
          >
            Add Supplier
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
              Verified Sourcing Vendors
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredSuppliers.length} active supplier records
            </Typography>
          </Box>
          <SearchBar placeholder="Search by name, contact, or email..." onSearch={handleSearch} />
        </Stack>

        {filteredSuppliers.length === 0 ? (
          <EmptyState
            title="No Suppliers Found"
            subtitle="No supplier entries match your search criteria."
          />
        ) : (
          <EntityTable
            rows={filteredSuppliers}
            columns={columns}
            getRowId={(row) => row.supplier_id}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Box>

      {/* Dialogs */}
      <SupplierDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedSupplier(null);
        }}
        onSave={handleSave}
        supplier={selectedSupplier}
        retailers={retailers}
      />

      <SupplierViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        supplier={selectedSupplier}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Supplier"
        message={`Delete supplier ${selectedSupplier?.supplier_name}? Active product associations may be removed.`}
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

export default Suppliers;
