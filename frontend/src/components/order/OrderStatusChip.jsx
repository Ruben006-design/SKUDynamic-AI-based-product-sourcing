import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";

function OrderStatusChip({ status }) {
  const theme = useTheme();
  const value = (status || "pending").toLowerCase();
  const isDark = theme.palette.mode === "dark";

  let bg = alpha("#94A3B8", 0.1);
  let color = "#94A3B8";
  let label = "Unknown";

  switch (value) {
    case "approved":
      bg = isDark ? alpha("#10B981", 0.15) : alpha("#059669", 0.1);
      color = isDark ? "#34D399" : "#059669";
      label = "Approved";
      break;
    case "rejected":
      bg = isDark ? alpha("#EF4444", 0.15) : alpha("#DC2626", 0.1);
      color = isDark ? "#F87171" : "#DC2626";
      label = "Rejected";
      break;
    case "ordered":
      bg = isDark ? alpha("#0EA5E9", 0.15) : alpha("#0284C7", 0.1);
      color = isDark ? "#38BDF8" : "#0284C7";
      label = "Ordered";
      break;
    case "pending":
      bg = isDark ? alpha("#F59E0B", 0.15) : alpha("#D97706", 0.1);
      color = isDark ? "#FBBF24" : "#D97706";
      label = "Pending";
      break;
    case "completed":
      bg = isDark ? alpha("#8B5CF6", 0.15) : alpha("#7C3AED", 0.1);
      color = isDark ? "#A78BFA" : "#7C3AED";
      label = "Completed";
      break;
    default:
      label = value.charAt(0).toUpperCase() + value.slice(1);
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 22,
        fontSize: "0.72rem",
        fontWeight: 600,
        borderRadius: 1.5,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${alpha(color, 0.25)}`,
      }}
    />
  );
}

export default OrderStatusChip;
