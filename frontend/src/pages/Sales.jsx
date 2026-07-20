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
  const [filteredSales, setFilteredSales] =
    useState([]);

  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [viewDialog, setViewDialog] =
    useState(false);

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [selectedSale, setSelectedSale] =
    useState(null);

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

      const [
        salesData,
        productData,
        retailerData,
      ] = await Promise.all([
        getSales(),
        getProducts(),
        getRetailers(),
      ]);

      setSales(salesData);
      setFilteredSales(salesData);

      setProducts(productData);
      setRetailers(retailerData);
    } catch (err) {
      console.error(err);
      setError("Failed to load sales.");
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

  const getProductName = (id) =>
    products.find(
      (p) => p.product_id === id
    )?.product_name || id;

  const getRetailerName = (id) =>
    retailers.find(
      (r) => r.retailer_id === id
    )?.retailer_name || id;

  const handleSearch = (value) => {
    const search = value.toLowerCase();

    setFilteredSales(
      sales.filter(
        (sale) =>
          getProductName(sale.product_id)
            .toLowerCase()
            .includes(search) ||
          getRetailerName(
            sale.retailer_id
          )
            .toLowerCase()
            .includes(search) ||
          sale.sales_channel
            ?.toLowerCase()
            .includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const sale = await getSale(
        row.sale_id
      );

      setSelectedSale(sale);
      setViewDialog(true);
    } catch {
      showMessage(
        "Unable to fetch sale.",
        "error"
      );
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

  async function handleSave(form) {
    try {
      if (selectedSale) {
        await updateSale(
          selectedSale.sale_id,
          form
        );

        showMessage(
          "Sale updated successfully."
        );
      } else {
        await createSale(form);

        showMessage(
          "Sale created successfully."
        );
      }

      setOpenDialog(false);
      setSelectedSale(null);

      loadSales();
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
      await deleteSale(
        selectedSale.sale_id
      );

      showMessage(
        "Sale deleted successfully."
      );

      setDeleteDialog(false);

      loadSales();
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
      field: "sale_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "product_id",
      headerName: "Product",
      flex: 1,
      valueGetter: (_, row) =>
        getProductName(row.product_id),
    },
    {
      field: "retailer_id",
      headerName: "Retailer",
      flex: 1,
      valueGetter: (_, row) =>
        getRetailerName(
          row.retailer_id
        ),
    },
    {
      field: "sale_date",
      headerName: "Date",
      width: 140,
      valueGetter: (_, row) =>
        new Date(
          row.sale_date
        ).toLocaleDateString(),
    },
        {
      field: "quantity_sold",
      headerName: "Quantity",
      width: 120,
    },
    {
      field: "revenue",
      headerName: "Revenue",
      width: 140,
      valueGetter: (_, row) =>
        `₹${Number(row.revenue).toLocaleString()}`,
    },
    {
      field: "popularity_score",
      headerName: "Popularity",
      width: 150,
      renderCell: (params) => {
        const score = Number(params.value);

        let color = "error";
        let label = `Low (${score})`;

        if (score >= 8) {
          color = "success";
          label = `High (${score})`;
        } else if (score >= 5) {
          color = "warning";
          label = `Medium (${score})`;
        }

        return (
          <Chip
            label={label}
            color={color}
            size="small"
          />
        );
      },
    },
    {
      field: "sales_channel",
      headerName: "Channel",
      flex: 1,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Sales"
        subtitle="Manage product sales records."
        icon={<PointOfSaleRoundedIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedSale(null);
              setOpenDialog(true);
            }}
          >
            Add Sale
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
        placeholder="Search sales..."
        onSearch={handleSearch}
      />

      {filteredSales.length === 0 ? (
        <EmptyState
          title="No Sales"
          subtitle="No sales records found."
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
        onClose={() =>
          setViewDialog(false)
        }
        sale={selectedSale}
        products={products}
        retailers={retailers}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Sale"
        message={`Delete Sale #${selectedSale?.sale_id}?`}
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

export default Sales;