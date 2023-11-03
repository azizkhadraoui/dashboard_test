import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import app from "../../base.js";
import {Link} from "react-router-dom"

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contacts, setContacts] = useState([]);

  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const db = getFirestore(app);
    const contactsCollection = collection(db, 'clients');

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(contactsCollection);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContacts(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
      valueGetter: (params) => {
        return `${params.row.firstName} ${params.row.lastName}`;
      },
      renderCell: (params) => (
        <Link to={`/profile/${params.row.id}`}>
          {`${params.row.firstName} ${params.row.lastName}`}
        </Link>
      ),
    },
    {
      field: "birthday",
      headerName: "Age",
      type: "number",
      headerAlign: "left",
      align: "left",
      valueGetter: (params) => {
        return calculateAge(params.row.birthday);
      },
    },
    {
      field: "from",
      headerName: "Origin",
      flex: 1,
    },
    {
      field: "passportNumber",
      headerName: "Passport",
      flex: 1,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "sex",
      headerName: "Sex",
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="CLIENTS"
        subtitle="Liste des client"
      />
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

export default Contacts;