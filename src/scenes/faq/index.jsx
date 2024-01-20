import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";
import app from "../../base.js"; 
import React, { useState, useEffect } from 'react';

import { getFirestore, collection, getDocs } from 'firebase/firestore';

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to store memos
  const [memos, setMemos] = useState([]);

  useEffect(() => {
    const db = getFirestore(app);
    const contactsCollection = collection(db, 'memos');

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(contactsCollection);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(data);
        setMemos(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box m="20px">
      <Header title="commentaire" subtitle="les commentaire des utilisateurs" />

      {memos.map(memo => (
        <Accordion key={memo.userId} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5">
              {memo.userName}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {memo.text}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FAQ;
