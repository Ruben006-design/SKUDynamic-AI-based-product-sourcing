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
  retailer_name: "",
  industry_type: "",
  contact_email: "",
  plan_tier: "starter",
};

function RetailerDialog({
  open,
  onClose,
  onSave,
  retailer,
}) {
  const [form, setForm] =
    useState(initialState);

  useEffect(() => {
    if (retailer) {
      setForm({
        retailer_name:
          retailer.retailer_name ?? "",
        industry_type:
          retailer.industry_type ?? "",
        contact_email:
          retailer.contact_email ?? "",
        plan_tier:
          retailer.plan_tier ?? "starter",
      });
    } else {
      setForm(initialState);
    }
  }, [retailer, open]);

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
      maxWidth="sm"
    >
      <DialogTitle>
        {retailer
          ? "Edit Retailer"
          : "Add Retailer"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid
          container
          spacing={3}
          mt={0.5}
        >
          <Grid
            size={{ xs: 12 }}
          >
            <TextField
              fullWidth
              required
              label="Retailer Name"
              name="retailer_name"
              value={form.retailer_name}
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12 }}
          >
            <TextField
              fullWidth
              required
              label="Industry Type"
              name="industry_type"
              value={form.industry_type}
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12 }}
          >
            <TextField
              fullWidth
              required
              type="email"
              label="Contact Email"
              name="contact_email"
              value={form.contact_email}
              onChange={handleChange}
            />
          </Grid>

          <Grid
            size={{ xs: 12 }}
          >
            <TextField
              select
              fullWidth
              label="Plan Tier"
              name="plan_tier"
              value={form.plan_tier}
              onChange={handleChange}
            >
              <MenuItem value="starter">
                Starter
              </MenuItem>

              <MenuItem value="growth">
                Growth
              </MenuItem>

              <MenuItem value="enterprise">
                Enterprise
              </MenuItem>
            </TextField>
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
          {retailer
            ? "Update"
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RetailerDialog;