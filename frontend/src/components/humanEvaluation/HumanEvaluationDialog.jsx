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

function HumanEvaluationDialog({
  open,
  onClose,
  onSave,
  evaluation,
  weightages,
  retailers,
}) {
  const [form, setForm] = useState({
    weightage_id: "",
    retailer_id: "",
    field_name: "",
    old_value: "",
    new_value: "",
    override_reason: "",
    evaluated_by: "",
  });

  useEffect(() => {
    if (evaluation) {
      setForm({
        weightage_id:
          evaluation.weightage_id ?? "",
        retailer_id:
          evaluation.retailer_id ?? "",
        field_name:
          evaluation.field_name ?? "",
        old_value:
          evaluation.old_value ?? "",
        new_value:
          evaluation.new_value ?? "",
        override_reason:
          evaluation.override_reason ?? "",
        evaluated_by:
          evaluation.evaluated_by ?? "",
      });
    } else {
      setForm({
        weightage_id: "",
        retailer_id: "",
        field_name: "",
        old_value: "",
        new_value: "",
        override_reason: "",
        evaluated_by: "",
      });
    }
  }, [evaluation]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      weightage_id: Number(
        form.weightage_id
      ),
      retailer_id: Number(
        form.retailer_id
      ),
      old_value: Number(form.old_value),
      new_value: Number(form.new_value),
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
        {evaluation
          ? "Edit Human Evaluation"
          : "Add Human Evaluation"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Weightage"
              name="weightage_id"
              value={form.weightage_id}
              onChange={handleChange}
            >
              {weightages.map((w) => (
                <MenuItem
                  key={w.weightage_id}
                  value={w.weightage_id}
                >
                  #{w.weightage_id}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

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

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Field Name"
              name="field_name"
              value={form.field_name}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Old Value"
              name="old_value"
              value={form.old_value}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="New Value"
              name="new_value"
              value={form.new_value}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Override Reason"
              name="override_reason"
              value={form.override_reason}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Evaluated By"
              name="evaluated_by"
              value={form.evaluated_by}
              onChange={handleChange}
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

export default HumanEvaluationDialog;