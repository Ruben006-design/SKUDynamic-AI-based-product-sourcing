import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Chip,
} from "@mui/material";

function HumanEvaluationViewDialog({
  open,
  onClose,
  evaluation,
}) {
  if (!evaluation) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Human Evaluation Details
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Evaluation ID
            </Typography>

            <Typography>
              {evaluation.eval_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Weightage ID
            </Typography>

            <Typography>
              {evaluation.weightage_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Retailer
            </Typography>

            <Typography>
              {evaluation.retailer_name ??
                evaluation.retailer_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Field
            </Typography>

            <Chip
              color="primary"
              label={evaluation.field_name}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Old Value
            </Typography>

            <Typography>
              {evaluation.old_value}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              New Value
            </Typography>

            <Typography
              color="success.main"
              fontWeight={600}
            >
              {evaluation.new_value}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Override Reason
            </Typography>

            <Typography>
              {evaluation.override_reason}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Evaluated By
            </Typography>

            <Typography>
              {evaluation.evaluated_by}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Evaluated At
            </Typography>

            <Typography>
              {new Date(
                evaluation.evaluated_at
              ).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default HumanEvaluationViewDialog;