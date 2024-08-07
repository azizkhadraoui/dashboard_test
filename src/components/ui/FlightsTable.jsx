import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

const columns = [
  {
    field: "flight_company",
    headerName: "Flight company",
    width: 150,
    editable: false,
  },
  {
    field: "date",
    headerName: "Flight date",
    width: 150,
    editable: false,
  },
  {
    field: "return_date",
    headerName: "Return date",
    width: 110,
    editable: false,
  },
  {
    field: "empty_seats",
    headerName: "Empty seats",
    width: 160,
  },
];

export default function DataGridDemo({ rows }) {
  const navigate = useNavigate();

  const handleRowClick = (params) => {
    navigate(`/testaa/${params.id}`);
  };

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
        onRowClick={handleRowClick}
      />
    </Box>
  );
}
