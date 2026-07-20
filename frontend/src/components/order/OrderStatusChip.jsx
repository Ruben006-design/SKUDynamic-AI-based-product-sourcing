import Chip from "@mui/material/Chip";

function OrderStatusChip({ status }) {
  const value = (status || "pending").toLowerCase();

  let color = "default";

  switch (value) {
    case "approved":
      color = "success";
      break;

    case "rejected":
      color = "error";
      break;

    case "pending":
      color = "warning";
      break;

    default:
      color = "default";
  }

  return (
    <Chip
      label={
        value.charAt(0).toUpperCase() +
        value.slice(1)
      }
      color={color}
      size="small"
      variant="filled"
    />
  );
}

export default OrderStatusChip;