import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import app from "../../base.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { tokens } from "../../theme";

const Profile = () => {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
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
          const photoRef = ref(
            storage,
            `images/image/${contactData.passportNumber}.jpg`
          );
          const downloadURL = await getDownloadURL(photoRef);
          setProfilePic(downloadURL); 
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const db = getFirestore(app);
    const clientRef = doc(db, "clients", id);
    const flightsCollection = collection(clientRef, "flights"); // Access the "flights" collection inside the "client" document.

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(flightsCollection);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContacts(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

 

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "flight_date",
      headerName: "Date",
      flex: 1,
    },
    {
      field: "product",
      headerName: "type",
      flex: 1,
    },
    {
      field: "payment",
      headerName: "montant payer",
      flex: 1,
    },
  ];

  if (!contact) {
    return <div>Loading...</div>;
  }

  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

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
      <Avatar src={profilePic} sx={{ width: 100, height: 100 }} />
      <Typography
        variant="h4"
        sx={{ color: colors.greenAccent[300] }}
      >{`${contact.firstName} ${contact.lastName}`}</Typography>
      <Typography variant="body1">
        Age: {calculateAge(contact.birthday)}
      </Typography>
      <Typography variant="body1">Sex: {contact.sex}</Typography>
      <Typography variant="body1">
        Flight Date: {contact.flight_date}
      </Typography>
      <Typography variant="body1">
        Passport Number: {contact.passportNumber}
      </Typography>
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


export default Profile;
