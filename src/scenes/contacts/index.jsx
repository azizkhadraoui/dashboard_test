import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { getFirestore, collection, getDocs, query, where, updateDoc, addDoc } from 'firebase/firestore';
import pdfToText from 'react-pdftotext'; // Import pdfToText function
import app from "../../base.js";
import { Link } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contacts, setContacts] = useState([]);
  const [pdfText, setPdfText] = useState('');

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

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  useEffect(() => {
    const db = getFirestore(app);
    const contactsCollection = collection(db, 'clients');

    const getName = async (userEmail) => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('email', '==', userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          return userData.name; // Assuming the user has a 'name' field
        } else {
          return ''; // Return an empty string if no user is found
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        return ''; // Return an empty string on error
      }
    };

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(contactsCollection);
        const data = querySnapshot.docs.map(doc => {
          const { tags, ...rest } = doc.data();
          let paymentStatus = 'unknown';
          let visaStatus = 'unknown';

          if (tags.includes('paye')) {
            paymentStatus = 'paye';
          } else if (tags.includes('non paye')) {
            paymentStatus = 'non paye';
          }

          if (tags.includes('visa dispo')) {
            visaStatus = 'visa dispo';
          } else if (tags.includes('visa attente')) {
            visaStatus = 'visa attente';
          }

          return { id: doc.id, ...rest, paymentStatus, visaStatus };
        });

        // Update the 'from' field with the associated name
        const updatedData = await Promise.all(
          data.map(async (client) => ({
            ...client,
            from: await getName(client.from),
          }))
        );

        setContacts(updatedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const text = await pdfToText(file);
        console.log("Extracted Text:", text); // Log extracted text for debugging

        // Extracting passport numbers
        const passportRegex = /\b[A-Z]\d{6}\b/g;
        const passportMatches = text.match(passportRegex);
        const passportNumbers = passportMatches ? passportMatches : [];
        console.log("Extracted Passport Numbers:", passportNumbers);

        // Extracting dates in the format dd/mm/yyyy
        const dateRegex = /\b\d{2}\/\d{2}\/\d{4}\b/g;
        const dates = text.match(dateRegex);
        console.log("Extracted Dates:", dates);

        // Extracting visa numbers (10 digits)
        const visaRegex = /\b\d{10}\b/g;
        const visaMatches = text.match(visaRegex);
        const visaNumbers = visaMatches ? visaMatches : [];
        console.log("Extracted Visa Numbers:", visaNumbers);

        // Assuming we use the first matched passport number and visa number for further operations
        const passportNumber = passportNumbers.length > 0 ? passportNumbers[0] : null;
        const visaNumber = visaNumbers.length > 0 ? visaNumbers[0] : null;
        console.log("Selected Passport Number:", passportNumber);
        console.log("Selected Visa Number:", visaNumber);

        if (passportNumber && visaNumber) {
          // Upload the PDF to Firebase Storage
          const storage = getStorage(app);
          const storageRef = ref(storage, `visas/${passportNumber}.pdf`);
          await uploadBytes(storageRef, file);
          const fileURL = await getDownloadURL(storageRef);
          console.log("File uploaded to Firebase Storage at:", fileURL);

          setPdfText(passportNumber);

          // Update tag in local state (contacts)
          const updatedContacts = contacts.map(contact => {
            if (contact.passportNumber === passportNumber.replace(/\s+/g, '')) {
              return { ...contact, visaStatus: 'visa dispo' };
            }
            return contact;
          });

          setContacts(updatedContacts);

          // Update Firestore document in 'clients' collection
          const db = getFirestore(app);
          const clientsCollection = collection(db, 'clients');
          const querySnapshot = await getDocs(clientsCollection);
          querySnapshot.forEach(async (doc) => {
            if (doc.data().passportNumber === passportNumber.replace(/\s+/g, '')) {
              await updateDoc(doc.ref, { visaStatus: 'visa dispo', fileURL });
              console.log("Firestore document updated successfully!");
            }
          });

          // Add document to 'visas' collection
          const visasCollection = collection(db, 'visas');
          await addDoc(visasCollection, {
            passportNumber,
            visaNumber,
            fileURL,
            validfrom: dates[0],
          });
          console.log("Document added to 'visas' collection successfully!");

        } else {
          console.error("Passport number or visa number not found in the extracted text.");
        }

      } catch (error) {
        console.error("Failed to process file:", error);
      }
    }
  };

  const columns = [
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
          <Typography color={colors.primary[100]}>
            {`${capitalizeFirstLetter(
              params.row.firstName
            )} ${capitalizeFirstLetter(params.row.lastName)}`}
          </Typography>
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
      headerName: "rabatteur",
      flex: 1,
      valueGetter: (params) => params.row.from,
    },
    {
      field: "passportNumber",
      headerName: "Passport",
      flex: 1,
    },
    {
      field: "deligation",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "sex",
      headerName: "Sex",
      flex: 1,
    },
    {
      field: "paymentStatus",
      headerName: "Statut Payment",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '25px',
            backgroundColor: params.value === 'paye' ? 'green' : 'red',
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "visaStatus",
      headerName: "Statut Visa",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '25px',
            backgroundColor: params.value === 'visa dispo' ? 'green' : 'red',
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          {params.value}
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="CLIENTS"
        subtitle="Liste des client"
      />
      <Box mt="20px">
        <Button variant="contained" component="label">
          Upload VISA
          <input type="file" hidden accept=".pdf" onChange={handleFileUpload} />
        </Button>
      </Box>
      {pdfText && (
        <Box mt="20px">
          <Typography variant="body1">Extracted Text:</Typography>
          <Typography variant="body2">{pdfText}</Typography>
        </Box>
      )}
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
