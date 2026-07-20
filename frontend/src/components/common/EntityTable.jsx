import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Tooltip } from "@mui/material";

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
  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 150,
    sortable: false,
    filterable: false,
    align: "center",
    headerAlign: "center",

    renderCell: (params) => (
      <Box>
        <Tooltip title="View">
          <IconButton
            color="primary"
            onClick={() => onView?.(params.row)}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit">
          <IconButton
            color="warning"
            onClick={() => onEdit?.(params.row)}
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => onDelete?.(params.row)}
          >
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  return (
    <Box>
      {rows.length === 0 && !loading ? (
        <EmptyState
          title="No Records Found"
          subtitle="Nothing to display."
        />
      ) : (
        <DataGrid
          autoHeight
          rows={rows}
          columns={
            showActions
              ? [...columns, actionColumn]
              : columns
          }
          getRowId={getRowId}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 20, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10,
              },
            },
          }}
          sx={{
            border: 0,

            "& .MuiDataGrid-columnHeaders": {
              fontWeight: 700,
            },

            "& .MuiDataGrid-cell": {
              borderBottom:
                "1px solid rgba(255,255,255,.05)",
            },

            "& .MuiDataGrid-row:hover": {
              backgroundColor:
                "rgba(59,130,246,.06)",
            },
          }}
        />
      )}
    </Box>
  );
}

export default EntityTable;