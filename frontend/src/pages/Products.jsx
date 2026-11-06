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
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
      const [productData, retailerData] = await Promise.all([
        getProducts(),
        getRetailers(),
      ]);

      setProducts(productData || []);
      setFilteredProducts(productData || []);
      setRetailers(retailerData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load catalog products.");
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
    setFilteredProducts(
      products.filter(
        (p) =>
          p.product_name?.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search) ||
          p.sku_code?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const product = await getProduct(row.product_id);
      setSelectedProduct(product);
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch product details.", "error");
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
        await updateProduct(selectedProduct.product_id, form);
        showMessage("Product updated successfully.");
      } else {
        await createProduct(form);
        showMessage("Product created successfully.");
      }
      setOpenDialog(false);
      loadProducts();
    } catch {
      showMessage("Failed to save product.", "error");
    }
  }

  async function confirmDelete() {
    try {
      await deleteProduct(selectedProduct.product_id);
      showMessage("Product deleted successfully.");
      setDeleteDialog(false);
      loadProducts();
    } catch {
      showMessage("Failed to delete product.", "error");
    }
  }

  const columns = [
    {
      field: "product_id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "product_name",
      headerName: "Product Name",
      flex: 1.3,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value || "General"}
          size="small"
          variant="outlined"
          sx={{ fontSize: "0.72rem", height: 22 }}
        />
      ),
    },
    {
      field: "sku_code",
      headerName: "SKU Code",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "unit_cost",
      headerName: "Unit Cost",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          ${Number(params.value || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "durability_days",
      headerName: "Shelf Life",
      width: 130,
      valueFormatter: (value) => (value ? `${value} days` : "Indefinite"),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="Product Catalog"
        subtitle="Master directory of retail items, categories, SKU identification codes, and durability constraints"
        icon={<Inventory2RoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedProduct(null);
              setOpenDialog(true);
            }}
          >
            Add New Product
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
              Registered Products
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredProducts.length} items cataloged
            </Typography>
          </Box>
          <SearchBar placeholder="Search by name, category, or SKU..." onSearch={handleSearch} />
        </Stack>

        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No Products Found"
            subtitle="No catalog entries matching your search query."
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
      </Box>

      {/* Dialogs */}
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

      <ProductViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        product={selectedProduct}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Product"
        message={`Are you sure you want to delete ${selectedProduct?.product_name}? All associated inventory positions will be impacted.`}
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

export default Products;
