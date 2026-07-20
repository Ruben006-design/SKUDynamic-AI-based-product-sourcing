import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";

function ProductSupplierDialog({
  open,
  onClose,
  onSave,
  productSupplier,
  products = [],
  suppliers = [],
}) {
  const initialForm = {
    product_id: "",
    supplier_id: "",
    is_preferred: false,
    negotiated_price: "",
    contract_start: "",
    contract_end: "",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (productSupplier) {
      setForm({
        product_id: productSupplier.product_id,
        supplier_id: productSupplier.supplier_id,
        is_preferred:
          productSupplier.is_preferred,
        negotiated_price:
          productSupplier.negotiated_price,
        contract_start:
          productSupplier.contract_start,
        contract_end:
          productSupplier.contract_end,
      });
    } else {
      setForm(initialForm);
    }
  }, [productSupplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitch = (e) => {
    setForm((prev) => ({
      ...prev,
      is_preferred: e.target.checked,
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      negotiated_price: Number(
        form.negotiated_price
      ),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {productSupplier
          ? "Edit Product Supplier"
          : "Add Product Supplier"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
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
              label="Supplier"
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
            >
              {suppliers.map((supplier) => (
                <MenuItem
                  key={supplier.supplier_id}
                  value={supplier.supplier_id}
                >
                  {supplier.supplier_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Negotiated Price"
              name="negotiated_price"
              value={form.negotiated_price}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    form.is_preferred
                  }
                  onChange={handleSwitch}
                />
              }
              label="Preferred Supplier"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Contract Start"
              name="contract_start"
              value={form.contract_start}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Contract End"
              name="contract_end"
              value={form.contract_end}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          {productSupplier
            ? "Update"
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductSupplierDialog;