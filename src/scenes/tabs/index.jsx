import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where} from "firebase/firestore";
import app from "../../base.js";

const TabsOpen = () => {
  const [sessionValue, setSessionValue] = useState(0);
  const [flightValue, setFlightValue] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(""); // State for selected user ID
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
          where("type", "==", sessions[sessionValue]?.title)
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
  }, [sessionValue, sessions]);

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore(app);
      const usersCollection = collection(db, "users");

      try {
        const querySnapshot = await getDocs(usersCollection);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSessionTabChange = (event, newValue) => {
    setSessionValue(newValue);
    setFlightValue(0); // Reset flight tab index when session changes
  };

  const handleFlightTabChange = (newValue) => {
    setFlightValue(newValue);
  };

  const handleUserChange = (event) => {
    setSelectedUserId(event.target.value);
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: colors.background }}>
      <Header title="CLIENTS" subtitle="Liste des client" />
      <Paper
        elevation={3}
        sx={{
          marginTop: 3,
          padding: "20px",
          borderRadius: 2,
          borderBottom: "1px solid gray",
          backgroundColor: "white",
        }}
      >
        <TabContext value={sessionValue}>
          <TabList
            onChange={handleSessionTabChange}
            aria-label="sessions"
            className="border-b border-gray-200"
          >
            {sessions.map((session, index) => (
              <Tab
                key={session.id} // Use a unique identifier as key
                label={session.title}
                className="border-b border-gray-200"
                value={index}
              />
            ))}
          </TabList>
          {flights.length > 0 && (
            <TabContext value={flightValue}>
              <TabList
                onChange={(event, newValue) => handleFlightTabChange(newValue)}
                aria-label="flights"
                className="border-b border-gray-200"
                value={flightValue}
              >
                {flights.map((flight, fIndex) => (
                  <Tab
                    key={flight.id} // Use a unique identifier as key
                    label={flight.date}
                    className="border-b border-gray-200"
                    value={fIndex}
                  />
                ))}
              </TabList>
              <TabPanel>
                <Paper elevation={3} sx={{ marginTop: 3, padding: "20px", borderRadius: 2 }}>
                  <Typography variant="body1" color="black" sx={{ margin: "20px 0" }}>
                    {flights[flightValue]?.content}
                  </Typography>
                </Paper>
              </TabPanel>
            </TabContext>
          )}
          <TabPanel>
            <select value={selectedUserId} onChange={handleUserChange}>
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </TabPanel>
        </TabContext>
      </Paper>
    </Box>
  );
};

export default TabsOpen;
