import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import app from "../../base.js";

const PastFlights = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
      const db = getFirestore(app);
      const contactsCollection = collection(db, "flights");

      const fetchData = async () => {
        try {
          const querySnapshot = await getDocs(contactsCollection);
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setContacts(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }, []);

    const columns = [
      { field: "id", headerName: "ID", flex: 1 },
      {
        field: "date",
        headerName: "Date",
        flex: 1,
      },
      {
        field: "empty_seats",
        headerName: "Empty Seats",
        flex: 1,
      },
      {
        field: "type",
        headerName: "Provider",
        flex: 1,
      },
    ];

    return (
      <Box m="20px">
        <Header title="Past Flights" subtitle="List of Available flights" />
        <Box
          m="40px 0 0 0"
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <DataGrid
            rows={contacts}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
          />
        </Box>
      </Box>
    );
};

export default PastFlights;
