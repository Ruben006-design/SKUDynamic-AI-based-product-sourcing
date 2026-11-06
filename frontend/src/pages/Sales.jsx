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
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";

import {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
} from "../services/salesService";

import { getProducts } from "../services/productService";
import { getRetailers } from "../services/retailerService";

import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";

import SalesDialog from "../components/sales/SalesDialog";
import SalesViewDialog from "../components/sales/SalesViewDialog";

function Sales() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      setLoading(true);
      const [salesData, productData, retailerData] = await Promise.all([
        getSales(),
        getProducts(),
        getRetailers(),
      ]);

      setProducts(productData || []);
      setRetailers(retailerData || []);

      const productMap = Object.fromEntries(
        (productData || []).map((p) => [p.product_id, p.product_name])
      );
      const retailerMap = Object.fromEntries(
        (retailerData || []).map((r) => [r.retailer_id, r.retailer_name])
      );

      const enriched = (salesData || []).map((s) => ({
        ...s,
        product_name: productMap[s.product_id] ?? `Product #${s.product_id}`,
        retailer_name: retailerMap[s.retailer_id] ?? `Retailer #${s.retailer_id}`,
      }));

      setSales(enriched);
      setFilteredSales(enriched);
    } catch (err) {
      console.error(err);
      setError("Failed to load sales transaction logs.");
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
    setFilteredSales(
      sales.filter(
        (s) =>
          s.product_name?.toLowerCase().includes(search) ||
          s.retailer_name?.toLowerCase().includes(search) ||
          s.sales_channel?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const sale = await getSale(row.sale_id);
      setSelectedSale({
        ...sale,
        product_name: row.product_name,
        retailer_name: row.retailer_name,
      });
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch sale record.", "error");
    }
  }

  function handleEdit(row) {
    setSelectedSale(row);
    setOpenDialog(true);
  }

  function handleDelete(row) {
    setSelectedSale(row);
    setDeleteDialog(true);
  }

  async function handleSave(data) {
    try {
      if (selectedSale) {
        await updateSale(selectedSale.sale_id, data);
        showMessage("Sale record updated successfully.");
      } else {
        await createSale(data);
        showMessage("Sale recorded successfully.");
      }
      setOpenDialog(false);
      loadSales();
    } catch {
      showMessage("Failed to save sale.", "error");
    }
  }

  async function confirmDelete() {
    try {
      await deleteSale(selectedSale.sale_id);
      showMessage("Sale record deleted.");
      setDeleteDialog(false);
      loadSales();
    } catch {
      showMessage("Delete failed.", "error");
    }
  }

  const columns = [
    {
      field: "sale_id",
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
      field: "retailer_name",
      headerName: "Retailer",
      flex: 1,
    },
    {
      field: "sale_date",
      headerName: "Date",
      width: 120,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
    {
      field: "quantity_sold",
      headerName: "Qty Sold",
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value} units
        </Typography>
      ),
    },
    {
      field: "revenue",
      headerName: "Gross Revenue",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="primary.main">
          ${Number(params.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      field: "popularity_score",
      headerName: "Popularity Index",
      width: 150,
      renderCell: (params) => {
        const score = Number(params.value || 0);
        const color = score >= 8 ? "success" : score >= 5 ? "warning" : "default";
        return (
          <Chip
            label={`${score} / 10`}
            color={color}
            size="small"
            sx={{ fontWeight: 600, borderRadius: 1.5, height: 22 }}
          />
        );
      },
    },
    {
      field: "sales_channel",
      headerName: "Channel",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value || "In-Store"}
          size="small"
          variant="outlined"
          sx={{ fontSize: "0.72rem", height: 22 }}
        />
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="Sales Velocity & Transaction History"
        subtitle="Log of historical product transactions powering the 90-day daily sales observation engine"
        icon={<PointOfSaleRoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedSale(null);
              setOpenDialog(true);
            }}
          >
            Record Sale
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
              Transaction Ledger
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredSales.length} historical transactions recorded
            </Typography>
          </Box>
          <SearchBar placeholder="Search product, retailer, or channel..." onSearch={handleSearch} />
        </Stack>

        {filteredSales.length === 0 ? (
          <EmptyState
            title="No Sales Records Found"
            subtitle="No sales transactions matching your search query."
          />
        ) : (
          <EntityTable
            rows={filteredSales}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.sale_id}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Box>

      {/* Dialogs */}
      <SalesDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedSale(null);
        }}
        onSave={handleSave}
        sale={selectedSale}
        products={products}
        retailers={retailers}
      />

      <SalesViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        sale={selectedSale}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Sale Record"
        message={`Delete transaction #${selectedSale?.sale_id}? This affects average daily sales calculation.`}
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

export default Sales;
