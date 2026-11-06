import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

function EntityDialog({
  open,
  title,
  subtitle,
  children,
  onClose,
  onSave,
  saveText = "Save",
  loading = false,
  maxWidth = "sm",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>{children}</DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small" disabled={loading}>
          Cancel
        </Button>
        {onSave && (
          <Button
            onClick={onSave}
            variant="contained"
            color="primary"
            size="small"
            disabled={loading}
          >
            {saveText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default EntityDialog;
