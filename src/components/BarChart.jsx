import React, { useEffect, useState } from 'react';
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { getFirestore,  getDocs,collection } from 'firebase/firestore';
import app from "../base.js";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [sessionKeys, setSessionKeys] = useState([]);
  const [data, setdata] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      const usersRef = collection(db, 'sessions');
      const snapshot = await getDocs(usersRef);
      const rawData = snapshot.docs.map(doc => doc.data());
      const titles = new Set(rawData.map(item => item.title));
      const uniqueTitles = [...titles];
      setSessionKeys(uniqueTitles);
    }
    fetchData();
    
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const clientsRef = collection(db, 'clients');
      const clientsSnapshot = await getDocs(clientsRef);
  
      const uniqueRabatteurs = {};
  
      // Fetch the user names from Firestore 'users' collection
      const userNames = {};
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      usersSnapshot.docs.forEach(userDoc => {
        const userData = userDoc.data();
        userNames[userData.email] = userData.name; // Assuming 'email' and 'name' are fields in 'users' collection
      });
  
      for (const clientDoc of clientsSnapshot.docs) {
        const clientData = clientDoc.data();
        const flightsRef = collection(clientDoc.ref, 'flights');
        const flightsSnapshot = await getDocs(flightsRef);
  
        const sellerEmail = clientData.from;
  
        if (!uniqueRabatteurs[sellerEmail]) {
          uniqueRabatteurs[sellerEmail] = {};
        }
  
        flightsSnapshot.docs.forEach(flightDoc => {
          const { payment, product } = flightDoc.data();
          uniqueRabatteurs[sellerEmail][product] = (uniqueRabatteurs[sellerEmail][product] || 0) + parseInt(payment, 10);
        });
      }
  
      const transformedData = Object.keys(uniqueRabatteurs).map(rabatteurEmail => ({
        rabatteur: userNames[rabatteurEmail] || rabatteurEmail, // Replace email with name, fallback to email if name not found
        ...uniqueRabatteurs[rabatteurEmail]
      }));
  
      setdata(transformedData);
      console.log(transformedData);
    }
  
    fetchData();
  }, []);
  

  return (
    <ResponsiveBar
      data={data}
      theme={{
        tooltip: {
          container: {
            background: 'white',
            color: 'black',
            fontSize: '15px',
          }},
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
      }}
      keys={sessionKeys}
      indexBy="rabatteur"
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "nivo" }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "#38bcb2",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "#eed312",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      borderColor={{
        from: "color",
        modifiers: [["darker", "1.6"]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "rabatteur", // changed
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "sales", // changed
        legendPosition: "middle",
        legendOffset: -40,
      }}
      enableLabel={false}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      role="application"
      barAriaLabel={function (e) {
        return e.id + ": " + e.formattedValue + " in rabatteur: " + e.indexValue;
      }}
    />
  );
};

export default BarChart;