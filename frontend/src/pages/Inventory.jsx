import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";

import MuiAlert from "@mui/material/Alert";

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
  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] =
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

  const [selectedInventory, setSelectedInventory] =
    useState(null);

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

      const [
        inventoryData,
        productData,
        retailerData,
      ] = await Promise.all([
        getInventories(),
        getProducts(),
        getRetailers(),
      ]);

      setInventories(inventoryData);
      setFilteredInventories(inventoryData);

      setProducts(productData);
      setRetailers(retailerData);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventories.");
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

    setFilteredInventories(
      inventories.filter(
        (item) =>
          item.inventory_id
            ?.toString()
            .includes(search) ||
          item.product_id
            ?.toString()
            .includes(search) ||
          item.retailer_id
            ?.toString()
            .includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const inventory = await getInventory(
        row.inventory_id
      );

      setSelectedInventory(inventory);
      setViewDialog(true);
    } catch (err) {
      showMessage(
        "Unable to fetch inventory.",
        "error"
      );
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

  async function handleSave(form) {
    try {
      if (selectedInventory) {
        await updateInventory(
          selectedInventory.inventory_id,
          form
        );

        showMessage(
          "Inventory updated successfully."
        );
      } else {
        await createInventory(form);

        showMessage(
          "Inventory created successfully."
        );
      }

      setOpenDialog(false);
      setSelectedInventory(null);

      loadInventories();
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
      await deleteInventory(
        selectedInventory.inventory_id
      );

      showMessage(
        "Inventory deleted successfully."
      );

      setDeleteDialog(false);

      loadInventories();
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
      field: "inventory_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "product_id",
      headerName: "Product",
      width: 120,
    },
    {
      field: "retailer_id",
      headerName: "Retailer",
      width: 120,
    },
    {
      field: "current_stock",
      headerName: "Current Stock",
      width: 140,
    },
    {
      field: "reserved_stock",
      headerName: "Reserved",
      width: 120,
    },
    {
      field: "reorder_point",
      headerName: "Reorder Point",
      width: 150,
    },
    {
      field: "eoq",
      headerName: "EOQ",
      width: 120,
    },
    {
      field: "safety_stock",
      headerName: "Safety Stock",
      width: 140,
    },
    {
      field: "last_updated",
      headerName: "Last Updated",
      flex: 1,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Inventory"
        subtitle="Manage inventory levels and stock information."
        icon={<WarehouseRoundedIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSelectedInventory(null);
              setOpenDialog(true);
            }}
          >
            Add Inventory
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <SearchBar
        placeholder="Search inventory..."
        onSearch={handleSearch}
      />

      {filteredInventories.length === 0 ? (
        <EmptyState
          title="No Inventory Found"
          subtitle="No inventory records available."
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
        title="Delete Inventory"
        message={`Delete inventory record #${selectedInventory?.inventory_id}?`}
        onClose={() => setDeleteDialog(false)}
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

export default Inventory;