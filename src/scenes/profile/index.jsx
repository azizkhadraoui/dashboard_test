import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Modal, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import app from "../../base.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { tokens } from "../../theme";

const Profile = () => {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [visaPdf, setVisaPdf] = useState(null);
  const [contractPdf, setContractPdf] = useState(null);
  const [pdfLoadingError, setPdfLoadingError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const db = getFirestore(app);
    const contactRef = doc(db, "clients", id);

    const fetchData = async () => {
      try {
        const docSnapshot = await getDoc(contactRef);
        if (docSnapshot.exists()) {
          const contactData = docSnapshot.data();
          setContact(contactData);

          const storage = getStorage(app);
          const photoRef = ref(storage, `images/passport/${contactData.passportNumber}.jpg`);
          const downloadURL = await getDownloadURL(photoRef);
          setProfilePic(downloadURL);

          const visaPdfRef = ref(storage, `visas/${contactData.passportNumber}.pdf`);
          const contractPdfRef = ref(storage, `contrats/${contactData.passportNumber}.pdf`);
          try {
            const visaPdfURL = await getDownloadURL(visaPdfRef);
            setVisaPdf(visaPdfURL);
          } catch (error) {
            setVisaPdf(null);
            console.error("Failed to load visa PDF:", error);
          }

          try {
            const contractPdfURL = await getDownloadURL(contractPdfRef);
            setContractPdf(contractPdfURL);
          } catch (error) {
            setContractPdf(null);
            console.error("Failed to load contract PDF:", error);
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setPdfLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const db = getFirestore(app);
    const clientRef = doc(db, "clients", id);
    const flightsCollection = collection(clientRef, "flights");

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(flightsCollection);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContacts(data);
      } catch (error) {
        console.error("Error fetching flight data:", error);
      }
    };

    fetchData();
  }, [id]);

  const columns = [
    {
      field: "flight_date",
      headerName: "Date",
      flex: 1,
    },
    {
      field: "product",
      headerName: "Type",
      flex: 1,
    },
    {
      field: "payment",
      headerName: "Montant payer",
      flex: 1,
    },
  ];

  if (!contact) {
    return <div>Loading contact information...</div>;
  }

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

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <Box
      m="20px"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        color: theme.palette.text.primary,
        backgroundColor: colors.primary[400],
      }}
    >
      <Avatar
        src={profilePic}
        sx={{ width: 200, height: 150, borderRadius: 1, mb: 2, cursor: 'pointer' }}
        variant="square"
        onClick={handleOpen}
      />
      <Modal
        open={modalOpen}
        onClose={handleClose}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img src={profilePic} alt="Passport" style={{ width: '80%', height: 'auto', borderRadius: 4 }} />
      </Modal>
      <Typography variant="h4" sx={{ color: colors.greenAccent[300] }}>
        {`${contact.firstName} ${contact.lastName}`}
      </Typography>
      <Typography variant="body1">Age: {calculateAge(contact.birthday)}</Typography>
      <Typography variant="body1">Sex: {contact.sex}</Typography>
      <Typography variant="body1">Passport Number: {contact.passportNumber}</Typography>
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
        <DataGrid rows={contacts} columns={columns} components={{ Toolbar: GridToolbar }} />
      </Box>
      <Box m="20px" width="100%" display="flex" justifyContent="space-between">
        <Box width="48%">
          <Typography variant="h5" mb="10px">Visa PDF</Typography>
          {pdfLoading ? (
            <Typography>Loading PDF...</Typography>
          ) : visaPdf ? (
            <iframe
              src={visaPdf}
              title="Visa PDF"
              width="100%"
              height="600px"
              style={{ border: 'none' }}
            />
          ) : (
            <Typography variant="body1">{pdfLoadingError || "No Visa PDF available"}</Typography>
          )}
        </Box>
        <Box width="48%">
          <Typography variant="h5" mb="10px">Contract PDF</Typography>
          {pdfLoading ? (
            <Typography>Loading PDF...</Typography>
          ) : contractPdf ? (
            <iframe
              src={contractPdf}
              title="Contract PDF"
              width="100%"
              height="600px"
              style={{ border: 'none' }}
            />
          ) : (
            <Typography variant="body1">{pdfLoadingError || "No Contract PDF available"}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
