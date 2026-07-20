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

function InventoryDialog({
  open,
  onClose,
  onSave,
  inventory,
  products = [],
  retailers = [],
}) {
  const initialState = {
    product_id: "",
    retailer_id: "",
    current_stock: "",
    reserved_stock: "",
    reorder_point: "",
    eoq: "",
    safety_stock: "",
  };

  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (inventory) {
      setForm({
        product_id: inventory.product_id ?? "",
        retailer_id: inventory.retailer_id ?? "",
        current_stock: inventory.current_stock ?? "",
        reserved_stock: inventory.reserved_stock ?? "",
        reorder_point: inventory.reorder_point ?? "",
        eoq: inventory.eoq ?? "",
        safety_stock: inventory.safety_stock ?? "",
      });
    } else {
      setForm(initialState);
    }
  }, [inventory, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      product_id: Number(form.product_id),
      retailer_id: Number(form.retailer_id),
      current_stock: Number(form.current_stock),
      reserved_stock: Number(form.reserved_stock),
      reorder_point: Number(form.reorder_point),
      eoq: Number(form.eoq),
      safety_stock: Number(form.safety_stock),
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
        {inventory
          ? "Edit Inventory"
          : "Add Inventory"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3} mt={0.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              required
              label="Product"
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
            >
              {products.map((product) => (
                <MenuItem
                  key={product.product_id}
                  value={product.product_id}
                >
                  {product.product_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              required
              label="Retailer"
              name="retailer_id"
              value={form.retailer_id}
              onChange={handleChange}
            >
              {retailers.map((retailer) => (
                <MenuItem
                  key={retailer.retailer_id}
                  value={retailer.retailer_id}
                >
                  {retailer.retailer_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Current Stock"
              name="current_stock"
              value={form.current_stock}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Reserved Stock"
              name="reserved_stock"
              value={form.reserved_stock}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Reorder Point"
              name="reorder_point"
              value={form.reorder_point}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="EOQ"
              name="eoq"
              value={form.eoq}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Safety Stock"
              name="safety_stock"
              value={form.safety_stock}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          {inventory ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InventoryDialog;