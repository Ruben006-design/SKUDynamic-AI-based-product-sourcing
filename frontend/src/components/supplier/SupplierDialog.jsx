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

function SupplierDialog({
  open,
  onClose,
  onSave,
  supplier,
  retailers = [],
}) {
  const initialState = {
    retailer_id: "",
    supplier_name: "",
    contact_person: "",
    email: "",
    phone: "",
    lead_time_days: "",
    quality_score: "",
  };

  const [form, setForm] =
    useState(initialState);

  useEffect(() => {
    if (supplier) {
      setForm({
        retailer_id:
          supplier.retailer_id ?? "",
        supplier_name:
          supplier.supplier_name ?? "",
        contact_person:
          supplier.contact_person ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        lead_time_days:
          supplier.lead_time_days ?? "",
        quality_score:
          supplier.quality_score ?? "",
      });
    } else {
      setForm(initialState);
    }
  }, [supplier, open]);

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
      retailer_id: Number(
        form.retailer_id
      ),
      lead_time_days: Number(
        form.lead_time_days
      ),
      quality_score: Number(
        form.quality_score
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
        {supplier
          ? "Edit Supplier"
          : "Add Supplier"}
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
              label="Retailer"
              name="retailer_id"
              value={form.retailer_id}
              onChange={handleChange}
            >
              {retailers.map(
                (retailer) => (
                  <MenuItem
                    key={
                      retailer.retailer_id
                    }
                    value={
                      retailer.retailer_id
                    }
                  >
                    {
                      retailer.retailer_name
                    }
                  </MenuItem>
                )
              )}
            </TextField>
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <TextField
              fullWidth
              required
              label="Supplier Name"
              name="supplier_name"
              value={form.supplier_name}
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <TextField
              fullWidth
              required
              label="Contact Person"
              name="contact_person"
              value={
                form.contact_person
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
              type="email"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <TextField
              fullWidth
              required
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 3 }}
          >
            <TextField
              fullWidth
              required
              type="number"
              label="Lead Time"
              name="lead_time_days"
              value={
                form.lead_time_days
              }
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 3 }}
          >
            <TextField
              fullWidth
              required
              type="number"
              inputProps={{
                min: 0,
                max: 1,
                step: 0.01,
              }}
              label="Quality Score"
              name="quality_score"
              value={
                form.quality_score
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
          {supplier
            ? "Update"
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SupplierDialog;