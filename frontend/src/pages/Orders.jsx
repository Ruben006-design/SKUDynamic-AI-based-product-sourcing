import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";

import MuiAlert from "@mui/material/Alert";

import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  approveOrder,
  rejectOrder,
  getOrderAnalytics,
  exportOrdersCSV,
} from "../services/orderService";

import { getProducts } from "../services/productService";
import { getRetailers } from "../services/retailerService";
import { getSuppliers } from "../services/supplierService";
import { getWeightages } from "../services/weightageService";

import EntityTable from "../components/common/EntityTable";
import SearchBar from "../components/common/SearchBar";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";

import OrderDialog from "../components/order/OrderDialog";
import OrderViewDialog from "../components/order/OrderViewDialog";
import OrderAnalyticsCard from "../components/order/OrderAnalyticsCard";
import OrderStatusChip from "../components/order/OrderStatusChip";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] =
    useState([]);

  const [products, setProducts] =
    useState([]);
  const [retailers, setRetailers] =
    useState([]);
  const [suppliers, setSuppliers] =
    useState([]);
  const [weightages, setWeightages] =
    useState([]);

  const [analytics, setAnalytics] =
    useState(null);

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

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [snackbar, setSnackbar] =
    useState({
      open: false,
      message: "",
      severity: "success",
    });

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const [
        orderData,
        analyticsData,
        productData,
        retailerData,
        supplierData,
        weightageData,
      ] = await Promise.all([
        getOrders(),
        getOrderAnalytics(),
        getProducts(),
        getRetailers(),
        getSuppliers(),
        getWeightages(),
      ]);

      const productMap =
        Object.fromEntries(
          productData.map((p) => [
            p.product_id,
            p.product_name,
          ])
        );

      const retailerMap =
        Object.fromEntries(
          retailerData.map((r) => [
            r.retailer_id,
            r.retailer_name,
          ])
        );

      const supplierMap =
        Object.fromEntries(
          supplierData.map((s) => [
            s.supplier_id,
            s.supplier_name,
          ])
        );

      const enriched =
        orderData.map((o) => ({
          ...o,
          product_name:
            productMap[o.product_id],
          retailer_name:
            retailerMap[o.retailer_id],
          supplier_name:
            supplierMap[
              o.preferred_supplier_id
            ],
        }));

      setOrders(enriched);
      setFilteredOrders(enriched);

      setAnalytics(analyticsData);

      setProducts(productData);
      setRetailers(retailerData);
      setSuppliers(supplierData);
      setWeightages(weightageData);
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load orders."
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
    const search = value.toLowerCase();

    setFilteredOrders(
      orders.filter(
        (o) =>
          o.product_name
            ?.toLowerCase()
            .includes(search) ||
          o.retailer_name
            ?.toLowerCase()
            .includes(search) ||
          o.supplier_name
            ?.toLowerCase()
            .includes(search) ||
          o.status
            ?.toLowerCase()
            .includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const data = await getOrder(
        row.order_list_id
      );

      setSelectedOrder({
        ...data,
        product_name: row.product_name,
        retailer_name: row.retailer_name,
        supplier_name: row.supplier_name,
      });

      setViewDialog(true);
    } catch {
      showMessage(
        "Unable to fetch order.",
        "error"
      );
    }
  }

  function handleEdit(row) {
    setSelectedOrder(row);
    setOpenDialog(true);
  }

  function handleDelete(row) {
    setSelectedOrder(row);
    setDeleteDialog(true);
  }

  async function handleSave(form) {
    try {
      if (selectedOrder) {
        await updateOrder(
          selectedOrder.order_list_id,
          form
        );

        showMessage(
          "Order updated successfully."
        );
      } else {
        await createOrder(form);

        showMessage(
          "Order created successfully."
        );
      }

      setOpenDialog(false);
      setSelectedOrder(null);

      loadOrders();
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
      await deleteOrder(
        selectedOrder.order_list_id
      );

      showMessage(
        "Order deleted successfully."
      );

      setDeleteDialog(false);

      loadOrders();
    } catch {
      showMessage(
        "Delete failed.",
        "error"
      );
    }
  }

  async function handleApprove(row) {
    try {
      await approveOrder(
        row.order_list_id,
        "Admin"
      );

      showMessage(
        "Order approved successfully."
      );

      loadOrders();
    } catch {
      showMessage(
        "Approval failed.",
        "error"
      );
    }
  }

  async function handleReject(row) {
    try {
      await rejectOrder(
        row.order_list_id,
        "Admin"
      );

      showMessage(
        "Order rejected successfully."
      );

      loadOrders();
    } catch {
      showMessage(
        "Rejection failed.",
        "error"
      );
    }
  }

  async function handleExport() {
    try {
      const blob =
        await exportOrdersCSV();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = "orders.csv";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      showMessage(
        "CSV exported successfully."
      );
    } catch {
      showMessage(
        "Export failed.",
        "error"
      );
    }
  }
    const columns = [
    {
      field: "order_list_id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "product_name",
      headerName: "Product",
      flex: 1,
    },
    {
      field: "retailer_name",
      headerName: "Retailer",
      flex: 1,
    },
    {
      field: "supplier_name",
      headerName: "Supplier",
      flex: 1,
    },
    {
      field: "recommended_order_qty",
      headerName: "Qty",
      width: 110,
    },
    {
      field: "final_score",
      headerName: "AI Score",
      width: 120,
      renderCell: (params) => (
        <strong>
          {Number(
            params.value ?? 0
          ).toFixed(2)}
        </strong>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => (
        <OrderStatusChip
          status={params.value}
        />
      ),
    },
    {
      field: "approve",
      headerName: "Approve",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="success"
          variant="contained"
          startIcon={
            <CheckCircleRoundedIcon />
          }
          disabled={
            params.row.status ===
            "approved"
          }
          onClick={() =>
            handleApprove(params.row)
          }
        >
          Approve
        </Button>
      ),
    },
    {
      field: "reject",
      headerName: "Reject",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          variant="contained"
          startIcon={
            <CancelRoundedIcon />
          }
          disabled={
            params.row.status ===
            "rejected"
          }
          onClick={() =>
            handleReject(params.row)
          }
        >
          Reject
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }
    return (
    <Box>
      <PageHeader
        title="Order List"
        subtitle="Manage AI-generated purchase recommendations."
        icon={<ReceiptLongRoundedIcon />}
        action={
          <Box
            display="flex"
            gap={2}
          >
            <Button
              variant="outlined"
              startIcon={
                <DownloadRoundedIcon />
              }
              onClick={handleExport}
            >
              Export CSV
            </Button>

            <Button
              variant="contained"
              startIcon={
                <AddRoundedIcon />
              }
              onClick={() => {
                setSelectedOrder(null);
                setOpenDialog(true);
              }}
            >
              Create Order
            </Button>
          </Box>
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
        placeholder="Search orders..."
        onSearch={handleSearch}
      />

      <OrderAnalyticsCard
        analytics={analytics}
      />

      <Box mt={3}>
        {filteredOrders.length ===
        0 ? (
          <EmptyState
            title="No Orders"
            subtitle="No purchase recommendations found."
          />
        ) : (
          <EntityTable
            rows={filteredOrders}
            columns={columns}
            getRowId={(row) =>
              row.order_list_id
            }
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Box>

      <OrderDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedOrder(null);
        }}
        onSave={handleSave}
        order={selectedOrder}
        products={products}
        retailers={retailers}
        suppliers={suppliers}
        weightages={weightages}
      />

      <OrderViewDialog
        open={viewDialog}
        onClose={() =>
          setViewDialog(false)
        }
        order={selectedOrder}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Order"
        message={`Delete Order #${selectedOrder?.order_list_id}?`}
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
          severity={
            snackbar.severity
          }
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default Orders;