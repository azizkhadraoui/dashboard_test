import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Modal, Backdrop, Fade } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../../base.js";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [invoicesData, setInvoicesData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpen = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  const fetchData = async () => {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("valid", "==", false));
    const querySnapshot = await getDocs(q);

    const usersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setInvoicesData(usersData);
  };

  const handleValidation = async (row) => {
    const userDocRef = doc(db, "users", row.id);
    await updateDoc(userDocRef, { valid: true });

    // Create user account with email and password
    const email = row.email;
    const password = row.password; 
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert(`User account created for ${email}`);
    } catch (error) {
      console.error("Error creating user account: ", error);
      alert(`Error creating user account for ${email}: ${error.message}`);
    }

    // Update local state
    setInvoicesData((prevData) =>
      prevData.map((invoice) =>
        invoice.id === row.id ? { ...invoice, valid: true } : invoice
      )
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      field: "valid",
      headerName: "Validation",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color={params.row.valid ? "primary" : "secondary"}
          onClick={() => handleValidation(params.row)}
        >
          {params.row.valid ? "Valide" : "Invalide"}
        </Button>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="VALIDATION" subtitle="Validate User Accounts" />
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
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              outline: 'none',
            }}
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Proof of Payment"
                style={{ width: '100%', height: 'auto' }}
              />
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Invoices;
