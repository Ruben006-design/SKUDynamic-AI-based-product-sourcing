import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";

import MuiAlert from "@mui/material/Alert";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { getRetailers } from "../services/retailerService";
import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProductDialog from "../components/product/ProductDialog";
import ProductViewDialog from "../components/product/ProductViewDialog";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";


function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [viewDialog, setViewDialog] =
    useState(false);

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);
  const [retailers, setRetailers] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadProducts();
  }, []);
  async function loadProducts() {
    try {
      setLoading(true);

      const [productData, retailerData] =
        await Promise.all([
          getProducts(),
          getRetailers(),
        ]);

      setProducts(productData);
      setFilteredProducts(productData);

      setRetailers(retailerData);

    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
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

    setFilteredProducts(
      products.filter(
        (p) =>
          p.product_name
            ?.toLowerCase()
            .includes(search) ||
          p.category
            ?.toLowerCase()
            .includes(search) ||
          p.sku_code
            ?.toLowerCase()
            .includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const product = await getProduct(
        row.product_id
      );

      setSelectedProduct(product);
      setViewDialog(true);
    } catch (err) {
      showMessage(
        "Unable to fetch product.",
        "error"
      );
    }
  }

  function handleEdit(row) {
    setSelectedProduct(row);
    setOpenDialog(true);
  }

  function handleDelete(row) {
    setSelectedProduct(row);
    setDeleteDialog(true);
  }

  async function handleSave(form) {
    try {
      if (selectedProduct) {
        await updateProduct(
          selectedProduct.product_id,
          form
        );

        showMessage(
          "Product updated successfully."
        );
      } else {
        await createProduct(form);

        showMessage(
          "Product created successfully."
        );
      }

      setOpenDialog(false);
      setSelectedProduct(null);

      loadProducts();
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
      await deleteProduct(
        selectedProduct.product_id
      );

      showMessage(
        "Product deleted successfully."
      );

      setDeleteDialog(false);

      loadProducts();
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
      field: "product_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "product_name",
      headerName: "Product",
      flex: 1,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
    },
    {
      field: "sku_code",
      headerName: "SKU",
      flex: 1,
    },
    {
      field: "unit_cost",
      headerName: "Cost",
      width: 120,
    },
    {
      field: "durability_days",
      headerName: "Durability",
      width: 140,
    },
  ];
    if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle="Manage all products in SKUDynamic."
        icon={<Inventory2RoundedIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedProduct(null);
              setOpenDialog(true);
            }}
          >
            Add Product
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
        placeholder="Search products..."
        onSearch={handleSearch}
      />

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No Products"
          subtitle="No products found."
        />
      ) : (
        <EntityTable
          rows={filteredProducts}
          columns={columns}
          getRowId={(row) => row.product_id}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Product Add/Edit Dialog */}

      <ProductDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedProduct(null);
        }}
        onSave={handleSave}
        product={selectedProduct}
        retailers={retailers}
      />

      {/* Product View Dialog */}

      <ProductViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        product={selectedProduct}
      />

      {/* Delete Confirmation */}

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Product"
        message={`Delete "${selectedProduct?.product_name}" ?`}
        onClose={() => setDeleteDialog(false)}
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

export default Products;