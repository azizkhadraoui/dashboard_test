import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { tokens } from "../../theme";
import app from "../../base.js";

const Team = () => {
  const [data, setData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newAccessLevel, setNewAccessLevel] = useState("");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const fetchData = async () => {
    try {
      const db = getFirestore(app);
      
      // Fetching users collection
      const userQuery = query(collection(db, "users"));
      const userQuerySnapshot = await getDocs(userQuery);

      const fetchedUsers = [];
      userQuerySnapshot.forEach((doc) => {
        const { name, age, phone, accessLevel, email, chiffre_affaire, num_client, parin, numPasseport, commition, location } = doc.data();
        fetchedUsers.push({
          id: doc.id,
          name: name || "nul",
          age: age || 0,
          phone: phone || "nul",
          accessLevel: accessLevel || "nul",
          email: email || "nul",
          chiffre_affaire: chiffre_affaire || 0,
          num_client: num_client || 0,
          numPasseport: numPasseport || "nul",
          location: location || "nul",
          commition: commition || 0,
          parin: parin || "nul",
        });
      });

      // Fetching sous_rabateur collection
      const rabateurQuery = query(collection(db, "sous_rabateurs"));
      const rabateurQuerySnapshot = await getDocs(rabateurQuery);

      const fetchedRabateurs = [];
      rabateurQuerySnapshot.forEach((doc) => {
        const { name, age, phone, accessLevel, email, chiffre_affaire, num_client, parin } = doc.data();
        fetchedRabateurs.push({
          id: doc.id,
          name: name || "nul",
          age: age || 0,
          phone: phone || "nul",
          accessLevel: accessLevel || "nul",
          email: email || "nul",
          chiffre_affaire: chiffre_affaire || 0,
          num_client: num_client || 0,
          parin: parin || "nul",
        });
      });

      // Combine both collections data
      const combinedData = [...fetchedUsers, ...fetchedRabateurs];
      setData(combinedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccessLevelChange = async () => {
    try {
      const db = getFirestore(app);
      const userDocRef = doc(db, "users", selectedUserId);
      await updateDoc(userDocRef, { accessLevel: newAccessLevel });
      setOpenDialog(false);
      // Refresh data after the access level is updated
      fetchData();
    } catch (error) {
      console.error("Error updating access level:", error);
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Nom",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "location",
      headerName: "deligation",
      flex: 1,
    },
    {
      field: "num_client",
      headerName: "nombre de client",
      flex: 1,
    },
    {
      field: "chiffre_affaire",
      headerName: "chiffre d'affaire",
      flex: 1,
      renderCell: (params) => `${params.value} DTN`,
    },
    {
      field: "commition",
      headerName: "commition",
      flex: 1,
      renderCell: (params) => `${params.value} DTN`,
    },
    {
      field: "phone",
      headerName: "numero de telephone",
      flex: 1,
    },
    {
      field: "numPasseport",
      headerName: "Passport Number",
      flex: 1,
    },
    {
      field: "parin",
      headerName: "Parin",
      flex: 1,
    },
    {
      field: "accessLevel",
      headerName: "Niveau d'Accès",
      flex: 2,
      renderCell: ({ row }) => (
        <Box
          width="80%"
          m="0 auto"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={
            row.accessLevel === "admin"
              ? colors.greenAccent[600]
              : row.accessLevel === "manager"
              ? colors.greenAccent[700]
              : colors.greenAccent[700]
          }
          borderRadius="4px"
          onClick={() => {
            setOpenDialog(true);
            setSelectedUserId(row.id);
          }}
        >
          {row.accessLevel === "admin" && <AdminPanelSettingsOutlinedIcon />}
          {row.accessLevel === "rabateur" && <SecurityOutlinedIcon />}
          {row.accessLevel === "sous_rabateur" && <LockOpenOutlinedIcon />}
          <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
            {row.accessLevel}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="l'equipe" subtitle="Manager l'equipe" />
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
        <DataGrid checkboxSelection rows={data} columns={columns} />
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Changer le Niveau d'Accès</DialogTitle>
        <DialogContent>
          <DialogContentText>Selectionner le nouveau Niveau d'Accès.</DialogContentText>
          <Select
            value={newAccessLevel}
            onChange={(e) => setNewAccessLevel(e.target.value)}
            fullWidth
            label="Nouveau Niveau d'Accès"
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="agence">Agence</MenuItem>
            <MenuItem value="rabateur">Rabatteur</MenuItem>
            <MenuItem value="sous_rabateur">Sous rabateur</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} variant="contained" color="primary">Cancel</Button>
          <Button onClick={handleAccessLevelChange} variant="contained" color="primary">Change</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;
