import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Snackbar,
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
  const [filteredSuppliers, setFilteredSuppliers] =
    useState([]);

  const [retailers, setRetailers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [viewDialog, setViewDialog] =
    useState(false);

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState(null);

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

      const [supplierData, retailerData] =
        await Promise.all([
          getSuppliers(),
          getRetailers(),
        ]);

      setSuppliers(supplierData);
      setFilteredSuppliers(supplierData);

      setRetailers(retailerData);
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers.");
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

    setFilteredSuppliers(
      suppliers.filter(
        (supplier) =>
          supplier.supplier_name
            ?.toLowerCase()
            .includes(search) ||
          supplier.contact_person
            ?.toLowerCase()
            .includes(search) ||
          supplier.email
            ?.toLowerCase()
            .includes(search) ||
          supplier.phone
            ?.toLowerCase()
            .includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const supplier = await getSupplier(
        row.supplier_id
      );

      setSelectedSupplier(supplier);
      setViewDialog(true);
    } catch (err) {
      showMessage(
        "Unable to fetch supplier.",
        "error"
      );
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

  async function handleSave(form) {
    try {
      if (selectedSupplier) {
        await updateSupplier(
          selectedSupplier.supplier_id,
          form
        );

        showMessage(
          "Supplier updated successfully."
        );
      } else {
        await createSupplier(form);

        showMessage(
          "Supplier created successfully."
        );
      }

      setOpenDialog(false);
      setSelectedSupplier(null);

      loadSuppliers();
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
      await deleteSupplier(
        selectedSupplier.supplier_id
      );

      showMessage(
        "Supplier deleted successfully."
      );

      setDeleteDialog(false);

      loadSuppliers();
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
      field: "supplier_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "supplier_name",
      headerName: "Supplier",
      flex: 1.2,
    },
    {
      field: "retailer_id",
      headerName: "Retailer",
      flex: 1,
      valueGetter: (_, row) => {
        const retailer = retailers.find(
          (r) => r.retailer_id === row.retailer_id
        );

        return (
          retailer?.retailer_name ??
          row.retailer_id
        );
      },
    },
    {
      field: "contact_person",
      headerName: "Contact Person",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.4,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "lead_time_days",
      headerName: "Lead Time (Days)",
      width: 150,
    },
    {
      field: "quality_score",
      headerName: "Quality Score",
      width: 140,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Suppliers"
        subtitle="Manage supplier information for SKUDynamic."
        icon={<LocalShippingRoundedIcon />}
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

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <SearchBar
        placeholder="Search suppliers..."
        onSearch={handleSearch}
      />

      {filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No Suppliers"
          subtitle="No supplier records found."
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
        retailers={retailers}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Supplier"
        message={`Delete "${selectedSupplier?.supplier_name}" ?`}
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

export default Suppliers;