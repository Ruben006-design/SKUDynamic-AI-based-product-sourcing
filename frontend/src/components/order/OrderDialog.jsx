import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";

function OrderDialog({
  open,
  onClose,
  onSave,
  order,
  products,
  retailers,
  suppliers,
  weightages,
}) {
  const emptyForm = {
    product_id: "",
    weightage_id: "",
    retailer_id: "",
    preferred_supplier_id: "",
    recommended_order_qty: "",
    final_score: "",
    justification_summary: "",
    status: "pending",
    approved_by: "",
    approved_at: "",
  };

  const [form, setForm] =
    useState(emptyForm);

  useEffect(() => {
    if (order) {
      setForm({
        product_id:
          order.product_id ?? "",
        weightage_id:
          order.weightage_id ?? "",
        retailer_id:
          order.retailer_id ?? "",
        preferred_supplier_id:
          order.preferred_supplier_id ??
          "",
        recommended_order_qty:
          order.recommended_order_qty ??
          "",
        final_score:
          order.final_score ?? "",
        justification_summary:
          order.justification_summary ??
          "",
        status:
          order.status ?? "pending",
        approved_by:
          order.approved_by ?? "",
        approved_at:
          order.approved_at
            ? order.approved_at.slice(
                0,
                16
              )
            : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [order]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      product_id: Number(
        form.product_id
      ),
      weightage_id: Number(
        form.weightage_id
      ),
      retailer_id: Number(
        form.retailer_id
      ),
      preferred_supplier_id:
        Number(
          form.preferred_supplier_id
        ),
      recommended_order_qty:
        Number(
          form.recommended_order_qty
        ),
      final_score: Number(
        form.final_score
      ),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {order
          ? "Edit Order"
          : "Create Order"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Product */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Product"
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
            >
              {products.map((p) => (
                <MenuItem
                  key={p.product_id}
                  value={p.product_id}
                >
                  {p.product_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Retailer */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Retailer"
              name="retailer_id"
              value={form.retailer_id}
              onChange={handleChange}
            >
              {retailers.map((r) => (
                <MenuItem
                  key={r.retailer_id}
                  value={r.retailer_id}
                >
                  {r.retailer_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Weightage */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Weightage"
              name="weightage_id"
              value={
                form.weightage_id
              }
              onChange={handleChange}
            >
              {weightages.map((w) => (
                <MenuItem
                  key={w.weightage_id}
                  value={
                    w.weightage_id
                  }
                >
                  #{w.weightage_id}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Supplier */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Preferred Supplier"
              name="preferred_supplier_id"
              value={
                form.preferred_supplier_id
              }
              onChange={handleChange}
            >
              {suppliers.map((s) => (
                <MenuItem
                  key={s.supplier_id}
                  value={
                    s.supplier_id
                  }
                >
                  {s.supplier_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Quantity */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Recommended Quantity"
              name="recommended_order_qty"
              value={
                form.recommended_order_qty
              }
              onChange={handleChange}
            />
          </Grid>

          {/* Score */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Final Score"
              name="final_score"
              value={
                form.final_score
              }
              onChange={handleChange}
            />
          </Grid>

          {/* Status */}

          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <MenuItem value="pending">
                Pending
              </MenuItem>

              <MenuItem value="approved">
                Approved
              </MenuItem>

              <MenuItem value="rejected">
                Rejected
              </MenuItem>
            </TextField>
          </Grid>

          {/* Justification */}

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Justification Summary"
              name="justification_summary"
              value={
                form.justification_summary
              }
              onChange={handleChange}
            />
          </Grid>

          {/* Approved By */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Approved By"
              name="approved_by"
              value={
                form.approved_by
              }
              onChange={handleChange}
            />
          </Grid>

          {/* Approved At */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Approved At"
              name="approved_at"
              value={
                form.approved_at
              }
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrderDialog;