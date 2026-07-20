import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";

function ProductDialog({
  open,
  onClose,
  onSave,
  product,
  retailers = [],
}) {
  const [form, setForm] = useState({
    retailer_id: "",
    product_name: "",
    category: "",
    sku_code: "",
    unit_cost: "",
    durability_days: "",
    expiry_date: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        retailer_id: product.retailer_id ?? "",
        product_name: product.product_name ?? "",
        category: product.category ?? "",
        sku_code: product.sku_code ?? "",
        unit_cost: product.unit_cost ?? "",
        durability_days: product.durability_days ?? "",
        expiry_date: product.expiry_date ?? "",
      });
    } else {
      setForm({
        retailer_id: "",
        product_name: "",
        category: "",
        sku_code: "",
        unit_cost: "",
        durability_days: "",
        expiry_date: "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {product ? "Edit Product" : "Add Product"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
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

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Product Name"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="SKU Code"
              name="sku_code"
              value={form.sku_code}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Unit Cost"
              name="unit_cost"
              value={form.unit_cost}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Durability Days"
              name="durability_days"
              value={form.durability_days}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              type="date"
              label="Expiry Date"
              name="expiry_date"
              value={form.expiry_date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          {product ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductDialog;