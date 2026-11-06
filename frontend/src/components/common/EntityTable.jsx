import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Tooltip, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import EmptyState from "./EmptyState";

function EntityTable({
  rows = [],
  columns = [],
  loading = false,
  getRowId,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 140,
    sortable: false,
    filterable: false,
    align: "center",
    headerAlign: "center",

    renderCell: (params) => (
      <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ height: "100%" }}>
        {onView && (
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={() => onView(params.row)}
              sx={{
                color: "primary.main",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}

        {onEdit && (
          <Tooltip title="Edit record">
            <IconButton
              size="small"
              onClick={() => onEdit(params.row)}
              sx={{
                color: "warning.main",
                "&:hover": { bgcolor: alpha(theme.palette.warning.main, 0.1) },
              }}
            >
              <EditRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}

        {onDelete && (
          <Tooltip title="Delete record">
            <IconButton
              size="small"
              onClick={() => onDelete(params.row)}
              sx={{
                color: "error.main",
                "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1) },
              }}
            >
              <DeleteRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  };

  const finalColumns = showActions && (onView || onEdit || onDelete)
    ? [...columns, actionColumn]
    : columns;

  return (
    <Box sx={{ width: "100%" }}>
      {rows.length === 0 && !loading ? (
        <EmptyState
          title="No Records Found"
          subtitle="There is currently no data matching your query."
        />
      ) : (
        <DataGrid
          autoHeight
          rows={rows}
          columns={finalColumns}
          getRowId={getRowId}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10,
              },
            },
          }}
          sx={{
            borderRadius: 3,
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: isDark ? alpha("#1E293B", 0.45) : "#F8FAFC",
              borderBottom: `1px solid ${theme.palette.divider}`,
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "text.secondary",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${theme.palette.divider}`,
              fontSize: "0.85rem",
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(15, 23, 42, 0.02)",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: `1px solid ${theme.palette.divider}`,
            },
          }}
        />
      )}
    </Box>
  );
}

export default EntityTable;
