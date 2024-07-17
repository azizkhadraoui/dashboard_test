import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import React, { useState, useEffect } from "react";
import app from "../../base.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const Dashboard = () => {
  const [Revenue, setRevenue] = useState(0);
  const [newClients, setNewClients] = useState({
    count: 0,
    progress: 0,
    increase: 0,
  });
  const [newSales, setNewSales] = useState({
    count: 0,
    progress: 0,
    increase: 0,
  });
  const [invoicesData, setInvoicesData] = useState([]);

  const overlayStyles = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(128, 128, 128, 0.5)", // Semi-transparent grey color
    backdropFilter: "blur(8px)", // Adjust the blur strength as needed
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const parseDate = (date) => {
    const day = String(date.toDate().getDate()).padStart(2, '0');
    const month = String(date.toDate().getMonth() + 1).padStart(2, '0'); // Note: Month is zero-based
    const year = date.toDate().getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore(app);
        const clientsCollection = collection(db, "clients");
        const clientsSnapshot = await getDocs(clientsCollection);

        const newClientsData = [];
        const newSalesData = [];
        const paymentsData = [];

        const currentDate = new Date();
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        let totalRevenue = 0;

        for (const clientDoc of clientsSnapshot.docs) {
          const clientData = clientDoc.data();
          const creationDate = clientData.creation_date.toDate();

          if (creationDate >= oneDayAgo) {
            newClientsData.push(clientData);
          }

          const clientId = clientDoc.id;
          const paymentsCollection = collection(clientDoc.ref, "payments");
          const paymentsQuery = query(paymentsCollection, where("validation", "==", true));
          const paymentsSnapshot = await getDocs(paymentsQuery);

          paymentsSnapshot.forEach((paymentDoc) => {
            const paymentData = {
              id: paymentDoc.id,
              clientId,
              name: clientData.firstName + " " + clientData.lastName,
              from: clientData.from,
              passport: clientData.passportNumber,
              ...paymentDoc.data(),
            };
            paymentsData.push(paymentData);

            const valueString = paymentData.value || "0";
            const valueNumber = parseInt(valueString, 10);
            totalRevenue += valueNumber;

            const paymentDate = new Date(paymentData.date.seconds * 1000);
            if (paymentDate >= oneDayAgo) {
              newSalesData.push(paymentData.value);
            }
          });
        }

        setRevenue(totalRevenue);

        const newSalesCount = newSalesData.length;
        const previousSalesCount = paymentsData.length - newSalesCount;

        const newClientsCount = newClientsData.length;
        const previousClientsCount = clientsSnapshot.size - newClientsCount;
        console.log("n9oss nyak",newClientsCount,previousClientsCount);

        const progress = calculateProgress(newClientsCount, previousClientsCount);
        const increase = calculateIncrease(newClientsCount, previousClientsCount);

        const progress2 = calculateProgress(newSalesCount, previousSalesCount);
        const increase2 = calculateIncrease(newSalesCount, previousSalesCount);

        setNewClients({
          count: newClientsCount,
          progress,
          increase,
        });

        setNewSales({
          count: newSalesCount,
          progress2,
          increase2,
        });

        setInvoicesData(paymentsData);

        return paymentsData;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("Updated Revenue:", Revenue);
    // Any other logic you want to execute after the state update
  }, [Revenue]);

  const calculateProgress = (newCount, previousCount) => {
    return previousCount > 0
      ? newCount / (newCount + previousCount)
      : 0;
  };

  const calculateIncrease = (newCount, previousCount) => {
    return previousCount > 0
      ? Math.round((newCount / (newCount + previousCount)) * 100)
      : 0;
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            telecharger les rapports
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative" 
          overflow="hidden"  
        >
          <StatBox
            title="12,361"
            subtitle="Emails Sent"
            progress="0.75"
            increase="+14%"
            icon={
              <EmailIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
          <div style={overlayStyles}></div>
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={newSales.count}
            subtitle="Ventes obtenues"
            progress={newSales.progress2}
            increase={"+"+newSales.increase2+"%"}
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={newClients.count}
            subtitle="nouveau client"
            progress={newClients.progress}
            increase={"+"+newClients.increase+"%"}
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative" 
          overflow="hidden"  
        >
          <StatBox
            title="1,325,134"
            subtitle="Traffic Received"
            progress="0.80"
            increase="+43%"
            icon={
              <TrafficIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
          <div style={overlayStyles}></div>
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          position="relative" 
          overflow="hidden"  
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Revenue Generated
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {Revenue}
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
            <div style={overlayStyles}></div>
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              transaction recent
            </Typography>
          </Box>
          {invoicesData.map((transaction, i) => (
            <Box
              key={`${transaction.id}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {transaction.name}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.user}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{parseDate(transaction.date)}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {transaction.value}DNT
              </Box>
            </Box>
          ))}
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Campaign
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
               {Revenue} DNT comme revenu
            </Typography>
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            quantite de vente
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            distrubition geographique de traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
