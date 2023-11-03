import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import app from "../../base.js";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { tokens } from "../../theme";

const Profile = () => {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const db = getFirestore(app);
    const contactRef = doc(db, "clients", id);

    const fetchData = async () => {
      try {
        const docSnapshot = await getDoc(contactRef);
        if (docSnapshot.exists()) {
          setContact({ id: docSnapshot.id, ...docSnapshot.data() });
          const storage = getStorage(app);
          const photoRef = ref(
            storage,
            `images/image/${contact.passportNumber}.jpg`
          );
          contact.profilePic = await getDownloadURL(photoRef);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

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
      <Avatar src={contact.profilePic} sx={{ width: 56, height: 56 }} />
      <Typography
        variant="h4"
        sx={{ color: colors.greenAccent[300] }}
      >{`${contact.firstName} ${contact.lastName}`}</Typography>
      <Typography variant="body1">ID: {contact.id}</Typography>
      <Typography variant="body1">
        Age: {calculateAge(contact.birthday)}
      </Typography>
      <Typography variant="body1">Sex: {contact.sex}</Typography>
      <Typography variant="body1">Flight Date: {contact.flight_date}</Typography>
      <Typography variant="body1">
        Passport Number: {contact.passportNumber}
      </Typography>
    </Box>
  );
};

export default Profile;
