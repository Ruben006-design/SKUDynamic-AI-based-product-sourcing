import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";

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
  const theme = useTheme();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [weightages, setWeightages] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [snackbar, setSnackbar] = useState({
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

      const [orderData, analyticsData, productData, retailerData, supplierData, weightageData] =
        await Promise.all([
          getOrders(),
          getOrderAnalytics(),
          getProducts(),
          getRetailers(),
          getSuppliers(),
          getWeightages(),
        ]);

      setProducts(productData || []);
      setRetailers(retailerData || []);
      setSuppliers(supplierData || []);
      setWeightages(weightageData || []);
      setAnalytics(analyticsData || null);

      const productMap = Object.fromEntries(
        (productData || []).map((p) => [p.product_id, p.product_name])
      );
      const retailerMap = Object.fromEntries(
        (retailerData || []).map((r) => [r.retailer_id, r.retailer_name])
      );
      const supplierMap = Object.fromEntries(
        (supplierData || []).map((s) => [s.supplier_id, s.supplier_name])
      );

      const enrichedOrders = (orderData || []).map((o) => ({
        ...o,
        product_name: productMap[o.product_id] ?? `Product #${o.product_id}`,
        retailer_name: retailerMap[o.retailer_id] ?? `Retailer #${o.retailer_id}`,
        supplier_name: supplierMap[o.supplier_id] ?? `Supplier #${o.supplier_id}`,
      }));

      setOrders(enrichedOrders);
      setFilteredOrders(enrichedOrders);
    } catch (err) {
      console.error(err);
      setError("Failed to load replenishment orders.");
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
    setFilteredOrders(
      orders.filter(
        (order) =>
          order.product_name?.toLowerCase().includes(search) ||
          order.supplier_name?.toLowerCase().includes(search) ||
          order.retailer_name?.toLowerCase().includes(search) ||
          order.status?.toLowerCase().includes(search)
      )
    );
  };

  async function handleView(row) {
    try {
      const order = await getOrder(row.order_list_id);
      setSelectedOrder({
        ...order,
        product_name: row.product_name,
        retailer_name: row.retailer_name,
        supplier_name: row.supplier_name,
      });
      setViewDialog(true);
    } catch {
      showMessage("Unable to fetch order details.", "error");
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

  async function confirmDelete() {
    try {
      await deleteOrder(selectedOrder.order_list_id);
      showMessage("Order deleted successfully.");
      setDeleteDialog(false);
      loadOrders();
    } catch {
      showMessage("Delete failed.", "error");
    }
  }

  async function handleSave(data) {
    try {
      if (selectedOrder) {
        await updateOrder(selectedOrder.order_list_id, data);
        showMessage("Order updated successfully.");
      } else {
        await createOrder(data);
        showMessage("Order created successfully.");
      }
      setOpenDialog(false);
      loadOrders();
    } catch {
      showMessage("Failed to save order.", "error");
    }
  }

  async function handleApprove(row) {
    try {
      await approveOrder(row.order_list_id, "Procurement Lead");
      showMessage("Order approved successfully.");
      loadOrders();
    } catch {
      showMessage("Approval failed. Verify permissions.", "error");
    }
  }

  async function handleReject(row) {
    try {
      await rejectOrder(row.order_list_id, "Procurement Lead");
      showMessage("Order rejected.");
      loadOrders();
    } catch {
      showMessage("Rejection failed.", "error");
    }
  }

  async function handleExport() {
    try {
      const blob = await exportOrdersCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "procurement_orders.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showMessage("Orders CSV exported successfully.");
    } catch {
      showMessage("Export failed.", "error");
    }
  }

  const columns = [
    {
      field: "order_list_id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "product_name",
      headerName: "Target SKU",
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "supplier_name",
      headerName: "Assigned Supplier",
      flex: 1,
    },
    {
      field: "recommended_order_qty",
      headerName: "Reorder Qty",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {params.value} units
        </Typography>
      ),
    },
    {
      field: "final_score",
      headerName: "Score",
      width: 110,
      renderCell: (params) => {
        const val = Number(params.value ?? 0);
        const score = val > 1 ? val : val * 100;
        return (
          <Typography variant="body2" fontWeight={600}>
            {score.toFixed(1)}/100
          </Typography>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => <OrderStatusChip status={params.value} />,
    },
    {
      field: "approve",
      headerName: "Sign-off",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="success"
          variant="contained"
          disabled={params.row.status === "approved" || params.row.status === "ordered"}
          onClick={() => handleApprove(params.row)}
          sx={{ py: 0.4, px: 1, fontSize: "0.72rem" }}
        >
          Approve
        </Button>
      ),
    },
    {
      field: "reject",
      headerName: "Reject",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          variant="outlined"
          disabled={params.row.status === "rejected" || params.row.status === "ordered"}
          onClick={() => handleReject(params.row)}
          sx={{ py: 0.4, px: 1, fontSize: "0.72rem" }}
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="Procurement Order Management"
        subtitle="Review, approve, and track purchase recommendations formulated by the AI reordering engine"
        icon={<ReceiptLongRoundedIcon color="primary" />}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setSelectedOrder(null);
                setOpenDialog(true);
              }}
            >
              Create Order
            </Button>
          </Stack>
        }
      />

      {error && <Alert severity="error">{error}</Alert>}

      {/* Analytics KPI Ribbon */}
      <OrderAnalyticsCard analytics={analytics} />

      {/* Orders Table with Integrated Search */}
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
              Order Requisition List
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredOrders.length} records matching current filter
            </Typography>
          </Box>
          <SearchBar placeholder="Search product, supplier, or status..." onSearch={handleSearch} />
        </Stack>

        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            subtitle="No purchase orders match your search query."
          />
        ) : (
          <EntityTable
            rows={filteredOrders}
            columns={columns}
            getRowId={(row) => row.order_list_id}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Box>

      {/* Dialogs */}
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
        onClose={() => setViewDialog(false)}
        order={selectedOrder}
      />

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Procurement Order"
        message={`Are you sure you want to delete Order #${selectedOrder?.order_list_id}?`}
        onClose={() => setDeleteDialog(false)}
        onConfirm={confirmDelete}
      />

      {/* Feedback Snackbar */}
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

export default Orders;
