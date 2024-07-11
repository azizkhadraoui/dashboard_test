import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Modal, Backdrop, Fade } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import app from "../../base.js";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const db = getFirestore(app);

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

  const getUserByEmail = async (email) => {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      throw new Error(`No user found with email: ${email}`);
    }
  
    let userName = "";
  
    querySnapshot.forEach((doc) => {
      userName = doc.data().name;
    });
  
    return userName;
  };

  const columns = [
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
          {params.row.value} DNT
        </Typography>
      ),
    },
    {
      field: "date",
      headerName: "date",
      flex: 1,
    },
    {
      field: "methode_payment",
      headerName: "methode de payment",
      flex: 1,
    },
    {
      field: "proofImageUrl",
      headerName: "preuve de payment",
      flex: 1,
      renderCell: (params) => (
        params.row.proofImageUrl ? (
          <img
            src={params.row.proofImageUrl}
            alt="Proof of Payment"
            style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
            onClick={() => handleOpen(params.row.proofImageUrl)}
          />
        ) : (
          <Typography>Aucun preuve</Typography>
        )
      ),
    },
    {
      field: "validation",
      headerName: "validation",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color={params.row.validation ? "primary" : "secondary"}
          onClick={() => toggleValidation(params.row)}
        >
          {params.row.validation ? "Valide" : "Non Valide"}
        </Button>
      ),
    },
  ];

  const fetchData = async () => {
    const clientsCollection = collection(db, "clients");
    const clientsSnapshot = await getDocs(clientsCollection);

    let paymentsData = [];

    for (const clientDoc of clientsSnapshot.docs) {
      const clientId = clientDoc.id;
      const clientData = clientDoc.data();
      const paymentsCollection = collection(clientDoc.ref, "payments");
      const paymentsQuery = query(paymentsCollection, where("validation", "==", false));

      const paymentsSnapshot = await getDocs(paymentsQuery);

      for (const paymentDoc of paymentsSnapshot.docs) {
        const paymentData = paymentDoc.data();
        let fromName = "Unknown";

        if (clientData.from) {
          try {
            fromName = await getUserByEmail(clientData.from);
          } catch (error) {
            console.error(error);
          }
        }

        paymentsData.push({
          id: paymentDoc.id,
          clientId,
          name: clientData.firstName + " " + clientData.lastName,
          from: fromName,
          passport: clientData.passportNumber,
          ...paymentData,
        });
      }
    }
    setInvoicesData(paymentsData);
  };

  const [invoicesData, setInvoicesData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const toggleValidation = async (row) => {
    const newValidationStatus = !row.validation;
    const paymentDocRef = doc(db, "clients", row.clientId, "payments", row.id);
    
    await updateDoc(paymentDocRef, {
      validation: newValidationStatus,
    });

    setInvoicesData((prevData) =>
      prevData.map((invoice) =>
        invoice.id === row.id && invoice.clientId === row.clientId
          ? { ...invoice, validation: newValidationStatus }
          : invoice
      )
    );
  };

  return (
    <Box m="20px">
      <Header title="VALIDATION" subtitle="Liste de payment a valide" />
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
