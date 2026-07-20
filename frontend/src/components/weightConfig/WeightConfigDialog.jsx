import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";

function WeightConfigDialog({
  open,
  onClose,
  onSave,
  config,
  retailers = [],
}) {
  const initialState = {
    retailer_id: "",
    config_name: "",

    sales_volume_w: 0.2,
    lead_time_w: 0.15,
    supplier_quality_w: 0.15,
    popularity_w: 0.15,
    weather_w: 0.10,
    festival_demand_w: 0.10,
    durability_w: 0.10,
    expiry_w: 0.05,

    is_active: true,
  };

  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (config) {
      setForm(config);
    } else {
      setForm(initialState);
    }
  }, [config, open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const weightFields = [
    {
      label: "Sales Volume",
      name: "sales_volume_w",
    },
    {
      label: "Lead Time",
      name: "lead_time_w",
    },
    {
      label: "Supplier Quality",
      name: "supplier_quality_w",
    },
    {
      label: "Popularity",
      name: "popularity_w",
    },
    {
      label: "Weather",
      name: "weather_w",
    },
    {
      label: "Festival Demand",
      name: "festival_demand_w",
    },
    {
      label: "Durability",
      name: "durability_w",
    },
    {
      label: "Expiry",
      name: "expiry_w",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {config
          ? "Edit Weight Configuration"
          : "Add Weight Configuration"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
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
              label="Configuration Name"
              name="config_name"
              value={form.config_name}
              onChange={handleChange}
            />
          </Grid>

          {weightFields.map((field) => (
            <Grid
              key={field.name}
              size={{ xs: 12, md: 6 }}
            >
              <TextField
                fullWidth
                type="number"
                label={field.label}
                name={field.name}
                inputProps={{
                  min: 0,
                  max: 1,
                  step: 0.01,
                }}
                value={form[field.name]}
                onChange={handleChange}
              />
            </Grid>
          ))}

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  name="is_active"
                  onChange={handleChange}
                />
              }
              label="Active Configuration"
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
          onClick={() => onSave(form)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WeightConfigDialog;