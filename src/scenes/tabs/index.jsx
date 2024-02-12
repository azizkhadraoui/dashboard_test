import { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Tabs } from "flowbite-react";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import app from "../../base.js";

const TabsOpen = () => {
  const [value, setValue] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [flights, setFlights] = useState([]);
  const [flightTabIndex, setFlightTabIndex] = useState(0);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const db = getFirestore(app);
    const sessionsCollection = collection(db, "sessions");

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(sessionsCollection);
        const sessionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFlights = async () => {
      if (sessions.length > 0) {
        const db = getFirestore(app);
        const flightsCollection = collection(db, "flights");
        const q = query(
          flightsCollection,
          where("type", "==", sessions[value].title)
        );

        try {
          const querySnapshot = await getDocs(q);
          const flightsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFlights(flightsData);
        } catch (error) {
          console.error("Error fetching flights:", error);
        }
      }
    };

    fetchFlights();
  }, [value, sessions]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    setFlightTabIndex(0);
  };

  const handleFlightTabChange = (event, newValue) => {
    setFlightTabIndex(newValue);
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: colors.background }}>
      <Header title="CLIENTS" subtitle="Liste des client" />
      <Paper
  elevation={3}
  sx={{ marginTop:  3, padding: "20px", borderRadius:  2, borderBottom: "1px solid gray", backgroundColor: "white" }}
>
  <Tabs
    value={value}
    onChange={handleTabChange}
    className="border-b border-gray-200"
  >
    {sessions.map((session, index) => (
      <Tabs.Item
        key={index}
        title={session.title}
        className="py-2 px-4 hover:bg-gray-100"
      >
        <Typography variant="body1" color="black" sx={{ margin: "20px   0" }}>
          {`Content for ${session.name}`}
        </Typography>
        <Tabs
          value={flightTabIndex}
          onChange={handleFlightTabChange}
          className="mt-4 border-b border-gray-200"
        >
          {flights.filter(flight => flight.type === session.title).map((flight, fIndex) => (
            <Tabs.Item
              key={fIndex}
              title={flight.name}
              className="py-2 px-4 hover:bg-gray-100"
            >
              <Paper elevation={3} sx={{ marginTop:   3, padding: "20px", borderRadius:   2 }}>
                <div>{flight.content}</div>
              </Paper>
            </Tabs.Item>
          ))}
        </Tabs>
      </Tabs.Item>
    ))}
  </Tabs>
</Paper>
    </Box>
  );
};

export default TabsOpen;
