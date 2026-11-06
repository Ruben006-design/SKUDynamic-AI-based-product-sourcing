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
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

import {
  getProductSuppliers,
  getProductSupplier,
  createProductSupplier,
  updateProductSupplier,
  deleteProductSupplier,
} from "../services/productSupplierService";
import { getProducts } from "../services/productService";
import { getSuppliers } from "../services/supplierService";

import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";

import ProductSupplierDialog from "../components/productSupplier/ProductSupplierDialog";
import ProductSupplierViewDialog from "../components/productSupplier/ProductSupplierViewDialog";

function ProductSuppliers() {
  const [productSuppliers, setProductSuppliers] = useState([]);
  const [filteredProductSuppliers, setFilteredProductSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedProductSupplier, setSelectedProductSupplier] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadProductSuppliers();
  }, []);

  async function loadProductSuppliers() {
    try {
      setLoading(true);
      const [psData, productData, supplierData] = await Promise.all([
        getProductSuppliers(),
        getProducts(),
        getSuppliers(),
      ]);

      setProducts(productData || []);
      setSuppliers(supplierData || []);

      const productMap = Object.fromEntries(
        (productData || []).map((p) => [p.product_id, p.product_name])
      );
      const supplierMap = Object.fromEntries(
        (supplierData || []).map((s) => [s.supplier_id, s.supplier_name])
      );

      const enriched = (psData || []).map((ps) => ({
        ...ps,
        product_name: productMap[ps.product_id] ?? `Product #${ps.product_id}`,
        supplier_name: supplierMap[ps.supplier_id] ?? `Supplier #${ps.supplier_id}`,
      }));

      setProductSuppliers(enriched);
      setFilteredProductSuppliers(enriched);
    } catch (err) {
      console.error(err);
      setError("Failed to load product supplier mappings.");
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
    setFilteredProductSuppliers(
      productSuppliers.filter(
        (ps) =>
          ps.product_name?.toLowerCase().includes(search) ||
          ps.supplier_name?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const ps = await getProductSupplier(row.product_supplier_id);
      setSelectedProductSupplier({
        ...ps,
        product_name: row.product_name,
        supplier_name: row.supplier_name,
      });
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch mapping details.", "error");
    }
  }

  function handleEdit(row) {
    setSelectedProductSupplier(row);
    setOpenDialog(true);
  }

  function handleDelete(row) {
    setSelectedProductSupplier(row);
    setDeleteDialog(true);
  }

  async function handleSave(form) {
    try {
      if (selectedProductSupplier) {
        await updateProductSupplier(selectedProductSupplier.product_supplier_id, form);
        showMessage("Mapping updated successfully.");
      } else {
        await createProductSupplier(form);
        showMessage("Mapping created successfully.");
      }
      setOpenDialog(false);
      setSelectedProductSupplier(null);
      loadProductSuppliers();
    } catch {
      showMessage("Operation failed.", "error");
    }
  }

  async function confirmDelete() {
    try {
      await deleteProductSupplier(selectedProductSupplier.product_supplier_id);
      showMessage("Mapping removed.");
      setDeleteDialog(false);
      loadProductSuppliers();
    } catch {
      showMessage("Delete failed.", "error");
    }
  }

  const columns = [
    {
      field: "product_supplier_id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "product_name",
      headerName: "Product SKU",
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "supplier_name",
      headerName: "Sourcing Partner",
      flex: 1.2,
    },
    {
      field: "negotiated_price",
      headerName: "Contracted Cost",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          ${Number(params.value || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "is_preferred",
      headerName: "Priority",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Preferred" : "Alternate"}
          color={params.value ? "success" : "default"}
          size="small"
          sx={{ fontWeight: 600, borderRadius: 1.5, height: 22 }}
        />
      ),
    },
    {
      field: "contract_end",
      headerName: "Contract Expiration",
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
        title="Product-Supplier Mapping"
        subtitle="Manage supplier contracts, negotiated pricing schedules, and primary sourcing preference for each product"
        icon={<LinkRoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedProductSupplier(null);
              setOpenDialog(true);
            }}
          >
            Assign Supplier to SKU
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
              Contract Mappings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredProductSuppliers.length} active supplier-to-product relationships
            </Typography>
          </Box>
          <SearchBar placeholder="Search by SKU or supplier..." onSearch={handleSearch} />
        </Stack>

        {filteredProductSuppliers.length === 0 ? (
          <EmptyState
            title="No Sourcing Mappings Found"
            subtitle="No supplier-product relationships match your search criteria."
          />
        ) : (
          <EntityTable
            rows={filteredProductSuppliers}
            columns={columns}
            getRowId={(row) => row.product_supplier_id}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Box>

      {/* Dialogs */}
      <ProductSupplierDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedProductSupplier(null);
        }}
        onSave={handleSave}
        productSupplier={selectedProductSupplier}
        products={products}
        suppliers={suppliers}
      />

      <ProductSupplierViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        productSupplier={selectedProductSupplier}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Remove Sourcing Mapping"
        message="Are you sure you want to delete this supplier association?"
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

export default ProductSuppliers;
