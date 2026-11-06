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
import { alpha, useTheme } from "@mui/material/styles";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";

import {
  getInventories,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../services/inventoryService";

import { getProducts } from "../services/productService";
import { getRetailers } from "../services/retailerService";

import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";

import InventoryDialog from "../components/inventory/InventoryDialog";
import InventoryViewDialog from "../components/inventory/InventoryViewDialog";

function Inventory() {
  const theme = useTheme();

  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadInventories();
  }, []);

  async function loadInventories() {
    try {
      setLoading(true);

      const [inventoryData, productData, retailerData] = await Promise.all([
        getInventories(),
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

      const enriched = (inventoryData || []).map((inv) => ({
        ...inv,
        product_name: productMap[inv.product_id] ?? `Product #${inv.product_id}`,
        retailer_name: retailerMap[inv.retailer_id] ?? `Retailer #${inv.retailer_id}`,
      }));

      setInventories(enriched);
      setFilteredInventories(enriched);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory records.");
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
    setFilteredInventories(
      inventories.filter(
        (i) =>
          i.product_name?.toLowerCase().includes(search) ||
          i.retailer_name?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const inventory = await getInventory(row.inventory_id);
      setSelectedInventory({
        ...inventory,
        product_name: row.product_name,
        retailer_name: row.retailer_name,
      });
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch inventory details.", "error");
    }
  }

  function handleEdit(row) {
    setSelectedInventory(row);
    setOpenDialog(true);
  }

  function handleDelete(row) {
    setSelectedInventory(row);
    setDeleteDialog(true);
  }

  async function handleSave(data) {
    try {
      if (selectedInventory) {
        await updateInventory(selectedInventory.inventory_id, data);
        showMessage("Inventory record updated successfully.");
      } else {
        await createInventory(data);
        showMessage("Inventory record created successfully.");
      }
      setOpenDialog(false);
      loadInventories();
    } catch {
      showMessage("Failed to save inventory record.", "error");
    }
  }

  async function confirmDelete() {
    try {
      await deleteInventory(selectedInventory.inventory_id);
      showMessage("Inventory record deleted.");
      setDeleteDialog(false);
      loadInventories();
    } catch {
      showMessage("Delete failed.", "error");
    }
  }

  const columns = [
    {
      field: "inventory_id",
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
      headerName: "Retail Facility",
      flex: 1,
    },
    {
      field: "current_stock",
      headerName: "On-Hand Stock",
      width: 140,
      renderCell: (params) => {
        const stock = Number(params.value ?? 0);
        const reorderPt = Number(params.row.reorder_point ?? 0);
        const isLow = stock <= reorderPt;

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={700} color={isLow ? "warning.main" : "text.primary"}>
              {stock} units
            </Typography>
            {isLow && (
              <Chip
                label="Low"
                size="small"
                color="warning"
                sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
              />
            )}
          </Stack>
        );
      },
    },
    {
      field: "reorder_point",
      headerName: "Reorder Point",
      width: 130,
      valueFormatter: (value) => `${value ?? 0} units`,
    },
    {
      field: "safety_stock",
      headerName: "Safety Stock",
      width: 130,
      valueFormatter: (value) => `${value ?? 0} units`,
    },
    {
      field: "eoq",
      headerName: "EOQ Target",
      width: 120,
      valueFormatter: (value) => `${value ?? 0} units`,
    },
    {
      field: "last_updated",
      headerName: "Last Sync",
      flex: 1,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : "Live"),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="Inventory Tracking"
        subtitle="Live monitor of warehouse on-hand stock, reorder thresholds, safety reserves, and economic order quantities"
        icon={<WarehouseRoundedIcon color="primary" />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedInventory(null);
              setOpenDialog(true);
            }}
          >
            Add Inventory Track
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
              Stock Registry
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredInventories.length} stock allocations tracked
            </Typography>
          </Box>
          <SearchBar placeholder="Search by SKU or facility..." onSearch={handleSearch} />
        </Stack>

        {filteredInventories.length === 0 ? (
          <EmptyState
            title="No Inventory Records"
            subtitle="No inventory tracks match your search criteria."
          />
        ) : (
          <EntityTable
            rows={filteredInventories}
            columns={columns}
            getRowId={(row) => row.inventory_id}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Box>

      {/* Dialogs */}
      <InventoryDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedInventory(null);
        }}
        onSave={handleSave}
        inventory={selectedInventory}
        products={products}
        retailers={retailers}
      />

      <InventoryViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        inventory={selectedInventory}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Inventory Allocation"
        message={`Delete inventory allocation #${selectedInventory?.inventory_id}?`}
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

export default Inventory;
