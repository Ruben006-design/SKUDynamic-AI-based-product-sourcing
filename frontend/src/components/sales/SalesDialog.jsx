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

const initialState = {
  product_id: "",
  retailer_id: "",
  sale_date: "",
  quantity_sold: "",
  revenue: "",
  popularity_score: 1,
  sales_channel: "",
};

function SalesDialog({
  open,
  onClose,
  onSave,
  sale,
  products = [],
  retailers = [],
}) {
  const [form, setForm] =
    useState(initialState);

  useEffect(() => {
    if (sale) {
      setForm({
        product_id: sale.product_id,
        retailer_id: sale.retailer_id,
        sale_date: sale.sale_date,
        quantity_sold:
          sale.quantity_sold,
        revenue: sale.revenue,
        popularity_score:
          sale.popularity_score,
        sales_channel:
          sale.sales_channel,
      });
    } else {
      setForm(initialState);
    }
  }, [sale, open]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      product_id: Number(
        form.product_id
      ),
      retailer_id: Number(
        form.retailer_id
      ),
      quantity_sold: Number(
        form.quantity_sold
      ),
      revenue: Number(form.revenue),
      popularity_score: Number(
        form.popularity_score
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
        {sale
          ? "Edit Sale"
          : "Add Sale"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid
          container
          spacing={3}
          mt={0.5}
        >
          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <TextField
              select
              fullWidth
              required
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

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <TextField
              select
              fullWidth
              required
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

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <TextField
              fullWidth
              required
              type="date"
              label="Sale Date"
              name="sale_date"
              value={form.sale_date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <TextField
              fullWidth
              required
              type="number"
              label="Quantity Sold"
              name="quantity_sold"
              value={
                form.quantity_sold
              }
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <TextField
              fullWidth
              required
              type="number"
              label="Revenue"
              name="revenue"
              value={form.revenue}
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <TextField
              fullWidth
              type="number"
              inputProps={{
                min: 1,
                max: 10,
              }}
              label="Popularity Score"
              name="popularity_score"
              value={
                form.popularity_score
              }
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12 }}
          >
            <TextField
              fullWidth
              label="Sales Channel"
              name="sales_channel"
              value={
                form.sales_channel
              }
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
          {sale
            ? "Update"
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SalesDialog;