import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getFirestore, collection, getDocs,query } from "firebase/firestore";
import app from "../../base.js";
import { mockDataInvoices } from "../../data/mockData";



const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "passport",
      headerName: "numero de passport",
      flex: 1,
    },
    {
      field: "from",
      headerName: "from",
      flex: 1,
    },
    {
      field: "value",
      headerName: "value",
      flex: 1,
      renderCell: (params) => (
        <Typography color={colors.greenAccent[500]}>
          ${params.row.value}
        </Typography>
      ),
    },
    {
      field: "date",
      headerName: "date",
      flex: 1,
    },
  ];

  const fetchData = async () => {
    const db = getFirestore(app);
    const clientsCollection = collection(db, "clients");
    const clientsSnapshot = await getDocs(clientsCollection);

    let paymentsData = [];

    for (const clientDoc of clientsSnapshot.docs) {
      const clientId = clientDoc.id;
      const clientData = clientDoc.data(); // Get client data
      const paymentsCollection = collection(clientDoc.ref, "payments");
      const paymentsQuery = query(paymentsCollection);

      const paymentsSnapshot = await getDocs(paymentsQuery);

      paymentsSnapshot.forEach((paymentDoc) => {
        paymentsData.push({
          id: paymentDoc.id,
          clientId,
          name: clientData.firstName+" "+clientData.lastName, // Include client name
          from: clientData.from, // Include client from
          passport: clientData.passportNumber, // Include client phone number
          ...paymentDoc.data(),
        });
      });
    }
    console.log(paymentsData);
    setInvoicesData(paymentsData);
    return paymentsData;
  };

  const [invoicesData, setInvoicesData] = useState([]);

  useEffect(() => {
    fetchData().then((data) => {
      setInvoicesData(data);
    });
  }, []);

  return (
    <Box m="20px">
      <Header title="INVOICES" subtitle="List of Invoice Balances" />
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
        }}
      >
        <DataGrid checkboxSelection rows={invoicesData} columns={columns} />
      </Box>
    </Box>
  );
};

export default Invoices;
