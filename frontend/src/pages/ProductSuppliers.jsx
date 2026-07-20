import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";

import MuiAlert from "@mui/material/Alert";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";

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

  const [productSuppliers, setProductSuppliers] =
    useState([]);

  const [
    filteredProductSuppliers,
    setFilteredProductSuppliers,
  ] = useState([]);

  const [products, setProducts] =
    useState([]);

  const [suppliers, setSuppliers] =
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
    selectedProductSupplier,
    setSelectedProductSupplier,
  ] = useState(null);

  const [snackbar, setSnackbar] =
    useState({
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

      const [
        productSupplierData,
        productData,
        supplierData,
      ] = await Promise.all([
        getProductSuppliers(),
        getProducts(),
        getSuppliers(),
      ]);

      setProductSuppliers(productSupplierData);
      setFilteredProductSuppliers(productSupplierData);

      setProducts(productData);
      setSuppliers(supplierData);

    } catch (err) {

      console.error(err);

      setError(
        "Failed to load Product Suppliers."
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

    const search =
      value.toLowerCase();

    setFilteredProductSuppliers(
      productSuppliers.filter((ps) => {

        const product =
          products.find(
            (p) =>
              p.product_id ===
              ps.product_id
          );

        const supplier =
          suppliers.find(
            (s) =>
              s.supplier_id ===
              ps.supplier_id
          );

        return (
          product?.product_name
            ?.toLowerCase()
            .includes(search) ||

          supplier?.supplier_name
            ?.toLowerCase()
            .includes(search)
        );

      })
    );
  };

  async function handleView(row) {

    try {

      const data =
        await getProductSupplier(
          row.product_supplier_id
        );

      setSelectedProductSupplier(data);

      setViewDialog(true);

    } catch {

      showMessage(
        "Unable to fetch details.",
        "error"
      );

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

        await updateProductSupplier(
          selectedProductSupplier.product_supplier_id,
          form
        );

        showMessage(
          "Product Supplier updated successfully."
        );

      } else {

        await createProductSupplier(form);

        showMessage(
          "Product Supplier created successfully."
        );

      }

      setOpenDialog(false);

      setSelectedProductSupplier(null);

      loadProductSuppliers();

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

      await deleteProductSupplier(
        selectedProductSupplier.product_supplier_id
      );

      showMessage(
        "Product Supplier deleted successfully."
      );

      setDeleteDialog(false);

      loadProductSuppliers();

    } catch {

      showMessage(
        "Delete failed.",
        "error"
      );

    }

  }
    const columns = [
    {
      field: "product_supplier_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "product_name",
      headerName: "Product",
      flex: 1,
      valueGetter: (_, row) =>
        products.find(
          (p) => p.product_id === row.product_id
        )?.product_name || row.product_id,
    },
    {
      field: "supplier_name",
      headerName: "Supplier",
      flex: 1,
      valueGetter: (_, row) =>
        suppliers.find(
          (s) => s.supplier_id === row.supplier_id
        )?.supplier_name || row.supplier_id,
    },
    {
      field: "negotiated_price",
      headerName: "Negotiated Price",
      width: 170,
      valueFormatter: (value) =>
        `₹ ${Number(value).toLocaleString()}`,
    },
    {
      field: "is_preferred",
      headerName: "Preferred",
      width: 120,
      valueFormatter: (value) =>
        value ? "Yes" : "No",
    },
    {
      field: "contract_end",
      headerName: "Contract Ends",
      width: 150,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Product Suppliers"
        subtitle="Manage product and supplier relationships."
        icon={<HandshakeRoundedIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedProductSupplier(null);
              setOpenDialog(true);
            }}
          >
            Add Product Supplier
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <SearchBar
        placeholder="Search product suppliers..."
        onSearch={handleSearch}
      />

      {filteredProductSuppliers.length === 0 ? (
        <EmptyState
          title="No Product Suppliers"
          subtitle="No relationships found."
        />
      ) : (
        <EntityTable
          rows={filteredProductSuppliers}
          columns={columns}
          getRowId={(row) =>
            row.product_supplier_id
          }
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ProductSupplierDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedProductSupplier(null);
        }}
        onSave={handleSave}
        productSupplier={
          selectedProductSupplier
        }
        products={products}
        suppliers={suppliers}
      />

      <ProductSupplierViewDialog
        open={viewDialog}
        onClose={() =>
          setViewDialog(false)
        }
        productSupplier={
          selectedProductSupplier
        }
        products={products}
        suppliers={suppliers}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Product Supplier"
        message={`Delete this product supplier relationship?`}
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

export default ProductSuppliers;